import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Download,
  ArrowLeft,
  FlaskConical,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { parseTestScript, matchFlowToTestScript, type ParsedTestScript, type TestPath } from '@/lib/testScriptParser';
import { useToast } from '@/hooks/use-toast';
import { TestPathPreviewModal } from '@/components/TestPathPreviewModal';
import { type ParsedFlow } from '@/lib/flowParser';
import { validateFlowAgainstTestScript, getValidationSummaryMessage, type FlowValidationResult, type ValidationError } from '@/lib/flowValidator';
import type { Flow } from '@shared/schema';

type TestStatus = 'pending' | 'running' | 'passed' | 'failed';

interface PathTestResult {
  pathNumber: number;
  status: TestStatus;
  stepsCompleted: number;
  totalSteps: number;
  errorMessage?: string;
  failedStep?: number;
  screenshot?: string;
}

interface TestRun {
  id: string;
  flowName: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  totalPaths: number;
  passedPaths: number;
  failedPaths: number;
  results: PathTestResult[];
}

export default function TestFlows() {
  const [, setLocation] = useLocation();
  const [selectedFlowSlug, setSelectedFlowSlug] = useState<string>('');
  const [testScript, setTestScript] = useState<ParsedTestScript | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [previewPath, setPreviewPath] = useState<{ path: TestPath; result: PathTestResult } | null>(null);
  const [parsedFlows, setParsedFlows] = useState<ParsedFlow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: flows = [], isLoading } = useQuery<Flow[]>({
    queryKey: ['/api/flows/active'],
  });

  useEffect(() => {
    const storedFlows = localStorage.getItem('importedFlows');
    if (storedFlows) {
      try {
        setParsedFlows(JSON.parse(storedFlows));
      } catch (e) {
        console.error('Failed to parse stored flows:', e);
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a Markdown (.md) test script file',
        variant: 'destructive'
      });
      return;
    }

    try {
      const content = await file.text();
      const result = parseTestScript(content);

      if (!result.success || !result.testScript) {
        setParseError(result.error || 'Failed to parse test script');
        setTestScript(null);
        return;
      }

      setTestScript(result.testScript);
      setParseError(null);

      const matchedFlow = matchFlowToTestScript(
        flows.map(f => ({ name: f.name, slug: f.slug })),
        result.testScript.flowName
      );
      
      if (matchedFlow) {
        setSelectedFlowSlug(matchedFlow.slug);
        toast({
          title: 'Flow matched',
          description: `Automatically matched to "${matchedFlow.name}"`
        });
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to read file');
      setTestScript(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [validationResult, setValidationResult] = useState<FlowValidationResult | null>(null);

  const runValidation = async () => {
    if (!testScript || !selectedFlowSlug) return;

    const selectedFlow = flows.find(f => f.slug === selectedFlowSlug);
    if (!selectedFlow) return;

    const parsedFlow = getSelectedParsedFlow();
    if (!parsedFlow || parsedFlow.nodes.length === 0) {
      toast({
        title: 'Flow not imported',
        description: 'Please import the flow in Flow Management first to run validation.',
        variant: 'destructive'
      });
      return;
    }

    setIsTestRunning(true);

    const initialResults: PathTestResult[] = testScript.paths.map(path => ({
      pathNumber: path.pathNumber,
      status: 'pending' as TestStatus,
      stepsCompleted: 0,
      totalSteps: path.steps.length
    }));

    const run: TestRun = {
      id: Date.now().toString(),
      flowName: selectedFlow.name,
      startTime: new Date(),
      status: 'running',
      totalPaths: testScript.paths.length,
      passedPaths: 0,
      failedPaths: 0,
      results: initialResults
    };

    setTestRun(run);

    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateFlowAgainstTestScript(testScript, parsedFlow);
    setValidationResult(validation);

    for (let i = 0; i < validation.pathResults.length; i++) {
      const pathResult = validation.pathResults[i];
      
      run.results[i] = {
        ...run.results[i],
        status: 'running'
      };
      setTestRun({ ...run });

      for (let stepIdx = 0; stepIdx < pathResult.stepResults.length; stepIdx++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        run.results[i] = {
          ...run.results[i],
          stepsCompleted: stepIdx + 1
        };
        setTestRun({ ...run });
      }

      if (pathResult.isValid) {
        run.results[i] = {
          ...run.results[i],
          status: 'passed'
        };
        run.passedPaths++;
      } else {
        const firstError = pathResult.errors[0];
        const failedStep = firstError?.stepNumber || 1;
        
        let errorMessage = `Validation failed with ${pathResult.errors.length} error(s):`;
        pathResult.errors.slice(0, 2).forEach(err => {
          errorMessage += ` ${err.message}`;
        });
        if (pathResult.errors.length > 2) {
          errorMessage += ` (+${pathResult.errors.length - 2} more)`;
        }
        
        run.results[i] = {
          ...run.results[i],
          status: 'failed',
          failedStep: failedStep > 0 ? failedStep : 1,
          errorMessage
        };
        run.failedPaths++;
      }
      
      setTestRun({ ...run });
    }

    run.status = run.failedPaths === 0 ? 'completed' : 'failed';
    run.endTime = new Date();
    setTestRun({ ...run });
    setIsTestRunning(false);

    const summaryMessage = getValidationSummaryMessage(validation);
    toast({
      title: run.failedPaths === 0 ? 'All validations passed!' : 'Validation completed with failures',
      description: summaryMessage,
      variant: run.failedPaths === 0 ? 'default' : 'destructive'
    });
  };

  const getSelectedParsedFlow = (): ParsedFlow | null => {
    if (!selectedFlowSlug) return null;
    const selectedFlow = flows.find(f => f.slug === selectedFlowSlug);
    if (!selectedFlow) return null;
    
    return parsedFlows.find(pf => 
      pf.metadata?.flowId === selectedFlow.slug ||
      pf.name.toLowerCase().replace(/\s+/g, '-') === selectedFlow.slug ||
      pf.name.toLowerCase() === selectedFlow.name.toLowerCase()
    ) || null;
  };

  const handleViewPath = (path: TestPath, result: PathTestResult) => {
    setPreviewPath({ path, result });
  };

  const generateReport = () => {
    if (!testRun || !testScript) return;

    const reportDate = new Date().toLocaleString();
    const duration = testRun.endTime 
      ? Math.round((testRun.endTime.getTime() - testRun.startTime.getTime()) / 1000)
      : 0;

    let reportContent = `# Flow Test Report: ${testRun.flowName}\n\n`;
    reportContent += `**Generated**: ${reportDate}\n`;
    reportContent += `**Test Duration**: ${duration} seconds\n`;
    reportContent += `**Overall Status**: ${testRun.status === 'completed' ? 'PASSED' : 'FAILED'}\n\n`;
    reportContent += `---\n\n`;
    reportContent += `## Summary\n\n`;
    reportContent += `| Metric | Value |\n`;
    reportContent += `|--------|-------|\n`;
    reportContent += `| Total Paths | ${testRun.totalPaths} |\n`;
    reportContent += `| Passed | ${testRun.passedPaths} |\n`;
    reportContent += `| Failed | ${testRun.failedPaths} |\n`;
    reportContent += `| Pass Rate | ${Math.round((testRun.passedPaths / testRun.totalPaths) * 100)}% |\n\n`;

    reportContent += `---\n\n`;
    reportContent += `## Detailed Results\n\n`;

    testRun.results.forEach((result, idx) => {
      const path = testScript.paths[idx];
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      
      reportContent += `### Path ${result.pathNumber}: ${path.pathDescription}\n\n`;
      reportContent += `**Status**: ${statusIcon} ${result.status.toUpperCase()}\n`;
      reportContent += `**Steps Completed**: ${result.stepsCompleted}/${result.totalSteps}\n`;
      reportContent += `**Expected Outcome**: ${path.expectedOutcome}\n\n`;

      if (result.status === 'failed' && result.errorMessage) {
        reportContent += `**Error**: ${result.errorMessage}\n\n`;
        reportContent += `#### Suggested Corrections:\n`;
        reportContent += `- Verify the flow connection from step ${result.failedStep} to the next node\n`;
        reportContent += `- Check if the button labels match the expected action\n`;
        reportContent += `- Ensure conditional logic routes to the correct screen\n\n`;
      }

      reportContent += `#### Steps:\n\n`;
      reportContent += `| Step | Screen Type | Action | Status |\n`;
      reportContent += `|------|-------------|--------|--------|\n`;
      
      path.steps.forEach((step, stepIdx) => {
        const stepStatus = stepIdx < result.stepsCompleted 
          ? (result.failedStep === step.stepNumber ? '❌' : '✅')
          : '⏸️';
        reportContent += `| ${step.stepNumber} | ${step.screenType} | ${step.action} | ${stepStatus} |\n`;
      });

      reportContent += `\n---\n\n`;
    });

    reportContent += `## Final Sign-off\n\n`;
    reportContent += `- [${testRun.failedPaths === 0 ? 'x' : ' '}] All paths tested\n`;
    reportContent += `- [${testRun.failedPaths === 0 ? 'x' : ' '}] All questions match expected content\n`;
    reportContent += `- [${testRun.failedPaths === 0 ? 'x' : ' '}] All branching logic works correctly\n`;
    reportContent += `- [${testRun.failedPaths === 0 ? 'x' : ' '}] All terminal screens display properly\n\n`;
    reportContent += `**Tested by**: Automated Flow Testing System\n`;
    reportContent += `**Date**: ${reportDate}\n`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-test-report-${testRun.flowName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report downloaded',
      description: 'Test report has been saved to your downloads'
    });
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <AdminLayout title="Test Flows">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/admin-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flow Testing</h1>
            <p className="text-gray-600">Upload test scripts and validate flow logic with automated testing</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              Test Configuration
            </CardTitle>
            <CardDescription>Configure and run flow tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Flow</label>
              <Select value={selectedFlowSlug} onValueChange={setSelectedFlowSlug}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a flow to test" />
                </SelectTrigger>
                <SelectContent>
                  {flows.map(flow => (
                    <SelectItem key={flow.slug} value={flow.slug}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Test Script</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".md"
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Test Script (.md)
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Markdown format only
              </p>
              
              {testScript && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{testScript.flowName}</p>
                      <p className="text-xs text-green-600">
                        {testScript.totalPaths} paths | {testScript.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{parseError}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={!selectedFlowSlug || !testScript || isTestRunning}
              onClick={runValidation}
            >
              {isTestRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>

            {testRun && !isTestRunning && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={generateReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {testRun 
                ? `Testing ${testRun.flowName} - ${testRun.passedPaths}/${testRun.totalPaths} paths passed`
                : 'Upload a test script and run tests to see results'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!testRun && !testScript && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FlaskConical className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Run Yet</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Select a flow and upload a test script document to begin automated testing of your flow paths.
                </p>
              </div>
            )}

            {testScript && !testRun && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Test Script Preview</h3>
                <div className="space-y-3">
                  {testScript.paths.map((path) => (
                    <div key={path.pathNumber} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Path {path.pathNumber}</span>
                        <Badge variant="secondary">{path.steps.length} steps</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{path.pathDescription}</p>
                      <p className="text-xs text-gray-500">Expected: {path.expectedOutcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {testRun && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Progress 
                      value={(testRun.passedPaths + testRun.failedPaths) / testRun.totalPaths * 100} 
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {testRun.passedPaths + testRun.failedPaths}/{testRun.totalPaths}
                  </span>
                </div>

                {validationResult && !isTestRunning && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Validation Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="p-2 bg-white rounded border">
                        <div className="text-gray-500">Total Paths</div>
                        <div className="font-semibold">{validationResult.summary.totalPaths}</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="text-gray-500">Valid Paths</div>
                        <div className="font-semibold text-green-600">{validationResult.summary.validPaths}</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="text-gray-500">Total Steps</div>
                        <div className="font-semibold">{validationResult.summary.totalSteps}</div>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <div className="text-gray-500">Valid Steps</div>
                        <div className="font-semibold text-green-600">{validationResult.summary.validSteps}</div>
                      </div>
                      <div className="p-2 bg-white rounded border col-span-2">
                        <div className="text-gray-500">Expected Nodes</div>
                        <div className="font-semibold">{validationResult.summary.totalNodes.expected}</div>
                      </div>
                      <div className="p-2 bg-white rounded border col-span-2">
                        <div className="text-gray-500">Matched Nodes</div>
                        <div className={`font-semibold ${validationResult.summary.totalNodes.actual === validationResult.summary.totalNodes.expected ? 'text-green-600' : 'text-red-600'}`}>
                          {validationResult.summary.totalNodes.actual}
                        </div>
                      </div>
                    </div>
                    {validationResult.errors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="font-medium text-red-700 mb-1">Validation Errors ({validationResult.errors.length})</div>
                        <ul className="text-red-600 text-xs space-y-1 max-h-24 overflow-y-auto">
                          {validationResult.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>Step {err.stepNumber}: {err.type.replace('_', ' ')}</li>
                          ))}
                          {validationResult.errors.length > 5 && (
                            <li className="text-red-500">+{validationResult.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {testRun.results.map((result, idx) => {
                    const path = testScript?.paths[idx];
                    return (
                      <div 
                        key={result.pathNumber} 
                        className={`p-4 border rounded-lg ${
                          result.status === 'failed' ? 'border-red-200 bg-red-50' :
                          result.status === 'passed' ? 'border-green-200 bg-green-50' :
                          result.status === 'running' ? 'border-blue-200 bg-blue-50' :
                          'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-medium">Path {result.pathNumber}</span>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{path?.pathDescription}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Steps: {result.stepsCompleted}/{result.totalSteps}</span>
                          {result.status === 'running' && (
                            <Progress 
                              value={(result.stepsCompleted / result.totalSteps) * 100} 
                              className="h-1 w-20"
                            />
                          )}
                        </div>

                        {result.status === 'failed' && result.errorMessage && (
                          <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                            {result.errorMessage}
                          </div>
                        )}

                        {path && (result.status === 'passed' || result.status === 'failed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => handleViewPath(path, result)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Path
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {previewPath && testScript && (
        <TestPathPreviewModal
          isOpen={!!previewPath}
          onClose={() => setPreviewPath(null)}
          testPath={previewPath.path}
          flow={getSelectedParsedFlow() || { name: '', description: '', nodes: [], connections: [] }}
          pathStatus={previewPath.result.status === 'passed' ? 'passed' : previewPath.result.status === 'failed' ? 'failed' : 'pending'}
          failedAtStep={previewPath.result.failedStep}
        />
      )}
    </AdminLayout>
  );
}
