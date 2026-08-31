import io
import uuid
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .database import get_db
from .dependencies import get_current_student
from .models import (Certificate, CourseEnrollment, GeneratedResume, ResumeAtsEvaluation,
                     ResumeBuilderProfile, StudentSkill, User)
from .resume_builder_schemas import GenerateResumeIn, ResumeBuilderIn, UpdateResumeIn
from .resume_builder_service import PROMPT_VERSION, ats_evaluate, generate_resume_content

router = APIRouter(prefix="/api/v1/students/me", tags=["ATS Resume Builder"])


def _entry(value) -> dict: return value.model_dump() if hasattr(value,"model_dump") else value


def _profile_out(profile: ResumeBuilderProfile, user: User, db: Session) -> dict:
    skills=[item.skill.name for item in db.scalars(select(StudentSkill).where(StudentSkill.user_id==user.id)).all()]
    completed=[item.course.title for item in db.scalars(select(CourseEnrollment).where(CourseEnrollment.user_id==user.id,CourseEnrollment.status=="completed")).all()]
    earned=[item.course_title for item in db.scalars(select(Certificate).where(Certificate.student_id==user.id,Certificate.status=="issued")).all()]
    student=user.student_profile
    return {"profile":{"headline":profile.headline,"location":profile.location,"linkedin_url":profile.linkedin_url,"github_url":profile.github_url,"portfolio_url":profile.portfolio_url,
        "professional_summary":profile.professional_summary,"educations":profile.educations,"experiences":profile.experiences,"projects":profile.projects,"certifications":profile.certifications,"achievements":profile.achievements,"languages":profile.languages},
        "auto":{"full_name":student.full_name if student else user.email,"email":user.email,"mobile":user.mobile,"college":student.college.name if student else None,"program":student.program.name if student else None,"current_year":student.current_year if student else None,"skills":skills,"completed_courses":completed,"earned_certificates":earned}}


def _get_or_create(user: User, db: Session) -> ResumeBuilderProfile:
    item=db.scalar(select(ResumeBuilderProfile).where(ResumeBuilderProfile.user_id==user.id))
    if item:return item
    student=user.student_profile
    education=[]
    if student: education=[{"title":student.program.name,"subtitle":student.college.name,"start_date":None,"end_date":student.current_year,"location":None,"description":None,"bullets":[],"technologies":[],"url":None}]
    item=ResumeBuilderProfile(user_id=user.id,educations=education,experiences=[],projects=[],certifications=[],achievements=[],languages=[])
    db.add(item);db.commit();db.refresh(item);return item


def _snapshot(profile: ResumeBuilderProfile,user: User,db: Session,target_role:str)->dict:
    data=_profile_out(profile,user,db)
    return {"target_role":target_role,"contact":{**data["auto"],"headline":profile.headline,"location":profile.location,"linkedin_url":profile.linkedin_url,"github_url":profile.github_url,"portfolio_url":profile.portfolio_url},
        "confirmed_skills":data["auto"]["skills"],"professional_summary":profile.professional_summary,"educations":profile.educations,"experiences":profile.experiences,"projects":profile.projects,
        "certifications":profile.certifications,"achievements":profile.achievements,"languages":profile.languages,"completed_courses":data["auto"]["completed_courses"],"earned_certificates":data["auto"]["earned_certificates"]}


def _evaluation(item: GeneratedResume):
    value=item.evaluations[-1] if item.evaluations else None
    return None if not value else {"score":value.score,"grade":value.grade,"breakdown":value.breakdown,"strengths":value.strengths,"issues":value.issues,"suggestions":value.suggestions,"created_at":value.created_at}


def _resume_out(item: GeneratedResume,detail=True)->dict:
    result={"id":item.id,"title":item.title,"target_role":item.target_role,"version":item.version,"status":item.status,"model_name":item.model_name,"created_at":item.created_at,"updated_at":item.updated_at,"ats":_evaluation(item)}
    if detail:result["content"]=item.content;result["contact"]=item.input_snapshot.get("contact",{})
    return result


def _save_evaluation(item:GeneratedResume,db:Session):
    result=ats_evaluate(item.input_snapshot,item.content);evaluation=ResumeAtsEvaluation(resume_id=item.id,**result);db.add(evaluation);db.flush();return result


@router.get("/resume-builder")
def get_builder(user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    return _profile_out(_get_or_create(user,db),user,db)


@router.put("/resume-builder")
def save_builder(payload:ResumeBuilderIn,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    item=_get_or_create(user,db)
    for key,value in payload.model_dump().items():setattr(item,key,value)
    db.commit();db.refresh(item);return _profile_out(item,user,db)


@router.post("/resumes/generate",status_code=status.HTTP_201_CREATED)
def generate_resume(payload:GenerateResumeIn,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    profile=_get_or_create(user,db);snapshot=_snapshot(profile,user,db,payload.target_role.strip())
    if not snapshot["educations"]:raise HTTPException(status_code=422,detail="Add at least one education entry before generating your resume")
    draft,model=generate_resume_content(snapshot);version=(db.scalar(select(func.max(GeneratedResume.version)).where(GeneratedResume.user_id==user.id))or 0)+1
    item=GeneratedResume(user_id=user.id,title=payload.title or f"{payload.target_role} Resume",target_role=payload.target_role.strip(),version=version,input_snapshot=snapshot,content=draft.model_dump(),model_name=model,prompt_version=PROMPT_VERSION)
    db.add(item);db.flush();_save_evaluation(item,db);db.commit();db.refresh(item);return _resume_out(item)


@router.get("/resumes")
def list_resumes(user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    return [_resume_out(item,False) for item in db.scalars(select(GeneratedResume).where(GeneratedResume.user_id==user.id).order_by(GeneratedResume.version.desc())).all()]


@router.get("/resumes/{resume_id}")
def get_resume(resume_id:uuid.UUID,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    item=db.get(GeneratedResume,resume_id)
    if not item or item.user_id!=user.id:raise HTTPException(status_code=404,detail="Generated resume not found")
    return _resume_out(item)


@router.put("/resumes/{resume_id}")
def update_resume(resume_id:uuid.UUID,payload:UpdateResumeIn,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    item=db.get(GeneratedResume,resume_id)
    if not item or item.user_id!=user.id:raise HTTPException(status_code=404,detail="Generated resume not found")
    item.content=payload.content.model_dump();item.title=payload.title or item.title;_save_evaluation(item,db);db.commit();db.refresh(item);return _resume_out(item)


@router.post("/resumes/{resume_id}/ats-score")
def score_resume(resume_id:uuid.UUID,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    item=db.get(GeneratedResume,resume_id)
    if not item or item.user_id!=user.id:raise HTTPException(status_code=404,detail="Generated resume not found")
    result=_save_evaluation(item,db);db.commit();return result


def _pdf(item:GeneratedResume)->io.BytesIO:
    output=io.BytesIO();styles=getSampleStyleSheet();navy=colors.HexColor("#0F1C3F")
    title=ParagraphStyle("ResumeName",parent=styles["Title"],fontName="Helvetica-Bold",fontSize=18,textColor=navy,alignment=TA_CENTER,spaceAfter=4)
    role=ParagraphStyle("Role",parent=styles["Normal"],fontSize=10,textColor=colors.HexColor("#5A6A8A"),alignment=TA_CENTER,spaceAfter=5)
    heading=ParagraphStyle("Heading",parent=styles["Heading2"],fontName="Helvetica-Bold",fontSize=10,textColor=navy,spaceBefore=8,spaceAfter=4,borderWidth=0,borderPadding=0)
    body=ParagraphStyle("Body",parent=styles["Normal"],fontSize=8.5,leading=11,textColor=colors.HexColor("#202A44"),spaceAfter=3)
    doc=SimpleDocTemplate(output,pagesize=A4,rightMargin=17*mm,leftMargin=17*mm,topMargin=14*mm,bottomMargin=14*mm,title=item.title)
    safe=lambda value:escape(str(value or ""))
    contact=item.input_snapshot.get("contact",{});content=item.content;story=[Paragraph(safe(contact.get("full_name") or "Student"),title),Paragraph(safe(item.target_role),role)]
    links=[contact.get(k) for k in ["email","mobile","location","linkedin_url","github_url","portfolio_url"] if contact.get(k)]
    story.extend([Paragraph(safe(" | ".join(links)),role),Spacer(1,4),Paragraph("PROFESSIONAL SUMMARY",heading),Paragraph(safe(content.get("professional_summary","")),body)])
    if content.get("skills"):story.extend([Paragraph("TECHNICAL SKILLS",heading),Paragraph(safe(" • ".join(content["skills"])),body)])
    for label,key in [("EDUCATION","educations"),("EXPERIENCE","experiences"),("PROJECTS","projects"),("CERTIFICATIONS","certifications")]:
        values=content.get(key) or []
        if values:
            story.append(Paragraph(label,heading))
            for entry in values:
                line=f"<b>{safe(entry.get('title',''))}</b>"+(f" — {safe(entry.get('subtitle'))}" if entry.get('subtitle') else "")
                dates=" – ".join(x for x in [entry.get("start_date"),entry.get("end_date")] if x)
                if dates:line+=f" | {safe(dates)}"
                story.append(Paragraph(line,body))
                for bullet in entry.get("bullets") or ([entry.get("description")] if entry.get("description") else []):story.append(Paragraph(f"• {safe(bullet)}",body))
    for label,key in [("ACHIEVEMENTS","achievements"),("LANGUAGES","languages")]:
        if content.get(key):story.extend([Paragraph(label,heading),Paragraph(safe(" • ".join(content[key])),body)])
    doc.build(story);output.seek(0);return output


@router.get("/resumes/{resume_id}/download")
def download_resume(resume_id:uuid.UUID,user:User=Depends(get_current_student),db:Session=Depends(get_db)):
    item=db.get(GeneratedResume,resume_id)
    if not item or item.user_id!=user.id:raise HTTPException(status_code=404,detail="Generated resume not found")
    return StreamingResponse(_pdf(item),media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="resume-v{item.version}.pdf"'})
