import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Play, Pause, SkipForward, RotateCcw, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ParsedFlow, type FlowNode } from '@/lib/flowParser';
import { type TestPath, type TestStep } from '@/lib/testScriptParser';

interface TestPathPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  testPath: TestPath;
  flow: ParsedFlow;
  pathStatus: 'passed' | 'failed' | 'pending';
  failedAtStep?: number;
}

interface StepResult {
  stepNumber: number;
  status: 'pending' | 'running' | 'passed' | 'failed';
  matchedNode?: FlowNode;
  message?: string;
}

export function TestPathPreviewModal({
  isOpen,
  onClose,
  testPath,
  flow,
  pathStatus,
  failedAtStep
}: TestPathPreviewModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const failedIndex = failedAtStep !== undefined ? failedAtStep - 1 : undefined;
      
      const initialResults: StepResult[] = testPath.steps.map((step, index) => {
        const isPassed = failedIndex === undefined || index < failedIndex;
        const isFailed = failedIndex !== undefined && index === failedIndex;
        
        return {
          stepNumber: step.stepNumber,
          status: isPassed ? 'passed' : isFailed ? 'failed' : 'pending',
          matchedNode: findMatchingNode(step),
          message: isFailed ? 'Step did not match expected behavior' : undefined
        };
      });
      
      setStepResults(initialResults);
      setCurrentStepIndex(0);
      
      if (flow.nodes.length > 0) {
        const startNode = flow.nodes.find(n => n.type === 'start') || flow.nodes[0];
        setCurrentNode(startNode);
      }
    }
  }, [isOpen, testPath, flow, failedAtStep]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && currentStepIndex < testPath.steps.length - 1) {
      timer = setTimeout(() => {
        goToNextStep();
      }, 1500);
    } else if (currentStepIndex >= testPath.steps.length - 1) {
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentStepIndex]);

  const findMatchingNode = (step: TestStep): FlowNode | undefined => {
    const screenType = step.screenType.toLowerCase();
    return flow.nodes.find(node => {
      if (node.type === screenType) return true;
      if (node.id === step.expectedNext) return true;
      if (node.question?.toLowerCase().includes(step.questionContent.toLowerCase().slice(0, 20))) return true;
      return false;
    });
  };

  const goToNextStep = () => {
    if (currentStepIndex < testPath.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      const nextStep = testPath.steps[nextIndex];
      const matchedNode = findMatchingNode(nextStep);
      if (matchedNode) {
        setCurrentNode(matchedNode);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      
      const prevStep = testPath.steps[prevIndex];
      const matchedNode = findMatchingNode(prevStep);
      if (matchedNode) {
        setCurrentNode(matchedNode);
      }
    }
  };

  const resetPreview = () => {
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
    if (flow.nodes.length > 0) {
      const startNode = flow.nodes.find(n => n.type === 'start') || flow.nodes[0];
      setCurrentNode(startNode);
    }
  };

  const currentStep = testPath.steps[currentStepIndex];
  const currentResult = stepResults[currentStepIndex];

  const hasFlowData = flow.nodes.length > 0;

  const renderNodePreview = () => {
    if (!hasFlowData) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-center p-4">
          <Info className="w-8 h-8 mb-2 text-gray-400" />
          <p className="font-medium">Flow data not available</p>
          <p className="text-sm mt-1">Import the flow in the Flow Management section to see node details.</p>
        </div>
      );
    }

    if (!currentNode) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No matching node found for this step
        </div>
      );
    }

    const getNodeTypeColor = (type: string) => {
      switch (type) {
        case 'start': return 'bg-blue-100 border-blue-300';
        case 'form': return 'bg-purple-100 border-purple-300';
        case 'yes-no': return 'bg-yellow-100 border-yellow-300';
        case 'multiple-choice': return 'bg-orange-100 border-orange-300';
        case 'info': return 'bg-cyan-100 border-cyan-300';
        case 'completion': return 'bg-green-100 border-green-300';
        case 'success': return 'bg-green-100 border-green-300';
        case 'end': return 'bg-gray-100 border-gray-300';
        default: return 'bg-gray-100 border-gray-300';
      }
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${getNodeTypeColor(currentNode.type)} transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="text-xs">
            {currentNode.type.toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-500">Node: {currentNode.id}</span>
        </div>
        
        {currentNode.question && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentNode.question}</h3>
        )}
        
        {currentNode.formTitle && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentNode.formTitle}</h3>
        )}

        {currentNode.type === 'form' && currentNode.formFields?.length > 0 && (
          <div className="space-y-2 mt-4">
            {currentNode.formFields.slice(0, 3).map((field) => (
              <div key={field.id} className="bg-white/50 p-2 rounded border">
                <span className="text-sm text-gray-600">{field.label}</span>
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            ))}
            {currentNode.formFields.length > 3 && (
              <span className="text-sm text-gray-500">+{currentNode.formFields.length - 3} more fields</span>
            )}
          </div>
        )}

        {currentNode.type === 'yes-no' && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              {currentNode.yesLabel || 'Yes'}
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              {currentNode.noLabel || 'No'}
            </Button>
          </div>
        )}

        {currentNode.type === 'multiple-choice' && currentNode.options && (
          <div className="space-y-2 mt-4">
            {currentNode.options.map((option) => (
              <div key={option.id} className="bg-white/50 p-2 rounded border text-sm">
                {option.label}
              </div>
            ))}
          </div>
        )}

        {(currentNode.type === 'completion' || currentNode.type === 'success' || currentNode.type === 'end') && (
          <div className="flex items-center justify-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        )}

        {currentNode.type === 'info' && (
          <div className="flex items-start gap-3 mt-4 bg-white/50 p-3 rounded">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <p className="text-sm text-gray-600">{currentNode.formDescription || 'Information screen'}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Path {testPath.pathNumber} Preview</span>
            <Badge variant={pathStatus === 'passed' ? 'default' : pathStatus === 'failed' ? 'destructive' : 'secondary'}>
              {pathStatus === 'passed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {pathStatus === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
              {pathStatus.toUpperCase()}
            </Badge>
          </DialogTitle>
          <p className="text-sm text-gray-500">Step-by-step visualization based on test script</p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2 max-h-[400px] overflow-y-auto pr-2">
            <h4 className="font-medium text-gray-700 mb-2">Test Steps</h4>
            {testPath.steps.map((step, index) => {
              const result = stepResults[index];
              const isActive = index === currentStepIndex;
              const failedIndex = failedAtStep !== undefined ? failedAtStep - 1 : undefined;
              const isFailed = failedIndex !== undefined && index === failedIndex;
              
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => {
                    setCurrentStepIndex(index);
                    const matchedNode = findMatchingNode(step);
                    if (matchedNode) setCurrentNode(matchedNode);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : isFailed 
                        ? 'border-red-300 bg-red-50'
                        : result?.status === 'passed'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Step {step.stepNumber}</span>
                    {result?.status === 'passed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {result?.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.screenType}
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {step.action}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-700">
                    Step {currentStep?.stepNumber}: {currentStep?.screenType}
                  </h4>
                  {currentResult?.status === 'passed' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Passed
                    </Badge>
                  )}
                  {currentResult?.status === 'failed' && (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>

                {renderNodePreview()}

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Question/Content:</span>
                      <p className="font-medium mt-1">{currentStep?.questionContent || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Expected Action:</span>
                      <p className="font-medium mt-1">{currentStep?.action || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Expected Next:</span>
                      <p className="font-medium mt-1">{currentStep?.expectedNext || '-'}</p>
                    </div>
                  </div>
                </div>

                {currentResult?.status === 'failed' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">Test Failed at This Step</p>
                        <p className="text-sm text-red-600 mt-1">
                          The flow behavior did not match the expected outcome for this step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextStep}
                  disabled={currentStepIndex >= testPath.steps.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPreview}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <span className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {testPath.steps.length}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
