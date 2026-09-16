export interface CodingTestCase {
  input: unknown[];
  expected: unknown;
}
export interface TestCaseResult {
  passed: boolean;
  actual?: unknown;
  error?: string;
}
export interface RunResult {
  results: TestCaseResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

const TIMEOUT_MS = 4000;

// Runs inside the Worker's own isolated global scope: no `window`, no DOM,
// no access to the app's React state. Network globals are shadowed so a
// submission can't make outbound calls from inside the grader.
const WORKER_SOURCE = `
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.importScripts = undefined;
self.onmessage = function (event) {
  const { code, functionName, testCases } = event.data;
  var fn;
  try {
    fn = new Function(
      code + "\\n;return typeof " + functionName + " === 'function' ? " + functionName + " : undefined;"
    )();
  } catch (err) {
    self.postMessage({
      results: testCases.map(function () {
        return { passed: false, error: "Code failed to run: " + (err && err.message ? err.message : String(err)) };
      }),
    });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({
      results: testCases.map(function () {
        return { passed: false, error: "Function '" + functionName + "' was not found" };
      }),
    });
    return;
  }
  var results = testCases.map(function (testCase) {
    try {
      var actual = fn.apply(null, testCase.input);
      var passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
      return { passed: passed, actual: actual };
    } catch (err) {
      return { passed: false, error: err && err.message ? err.message : String(err) };
    }
  });
  self.postMessage({ results: results });
};
`;

export function runCodingTests(
  code: string,
  functionName: string,
  testCases: CodingTestCase[],
): Promise<RunResult> {
  return new Promise((resolve) => {
    if (testCases.length === 0) {
      resolve({ results: [], passedCount: 0, totalCount: 0, allPassed: false });
      return;
    }
    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    let settled = false;

    const finish = (results: TestCaseResult[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      const passedCount = results.filter((r) => r.passed).length;
      resolve({
        results,
        passedCount,
        totalCount: testCases.length,
        allPassed: passedCount === testCases.length,
      });
    };

    const timer = setTimeout(() => {
      finish(
        testCases.map(() => ({
          passed: false,
          error: "Timed out — check for infinite loops",
        })),
      );
    }, TIMEOUT_MS);

    worker.onmessage = (event) => finish(event.data.results);
    worker.onerror = (event) =>
      finish(
        testCases.map(() => ({
          passed: false,
          error: event.message || "The code could not be run",
        })),
      );

    worker.postMessage({ code, functionName, testCases });
  });
}
