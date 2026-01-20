import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Info, X } from 'lucide-react';
import { type ParsedFlow, type FlowNode } from '@/lib/flowParser';

interface FlowState {
  currentNodeId: string;
  responses: Record<string, any>;
  nodeHistory: string[];
  stepNumber: number;
}

export default function FlowPreview() {
  const { flowId } = useParams<{ flowId: string }>();
  const [, setLocation] = useLocation();
  const [flow, setFlow] = useState<ParsedFlow | null>(null);
  const [state, setState] = useState<FlowState | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [yesNoValue, setYesNoValue] = useState<string>('');
  const [choiceValue, setChoiceValue] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const storedFlows = localStorage.getItem('importedFlows');
    if (storedFlows) {
      const flows: ParsedFlow[] = JSON.parse(storedFlows);
      const found = flows.find(f => f.metadata?.flowId === flowId || f.name.toLowerCase().replace(/\s+/g, '-') === flowId);
      if (found) {
        setFlow(found);
        const startNode = found.nodes.find(n => n.type === 'start');
        if (startNode) {
          setState({
            currentNodeId: startNode.id,
            responses: {},
            nodeHistory: [],
            stepNumber: 1
          });
        } else if (found.nodes.length > 0) {
          setState({
            currentNodeId: found.nodes[0].id,
            responses: {},
            nodeHistory: [],
            stepNumber: 1
          });
        }
      }
    }
  }, [flowId]);

  const getCurrentNode = (): FlowNode | null => {
    if (!flow || !state) return null;
    return flow.nodes.find(n => n.id === state.currentNodeId) || null;
  };

  const getNextNode = (condition?: string): FlowNode | null => {
    if (!flow || !state) return null;
    
    const connections = flow.connections.filter(c => c.sourceNodeId === state.currentNodeId);
    
    let matchedConnection = connections.find(c => c.condition === 'any');
    
    if (condition) {
      const conditionMatch = connections.find(c => 
        c.condition === condition || 
        c.label === condition ||
        c.condition?.toLowerCase() === condition.toLowerCase() ||
        c.label?.toLowerCase() === condition.toLowerCase()
      );
      if (conditionMatch) matchedConnection = conditionMatch;
    }
    
    if (!matchedConnection && connections.length === 1) {
      matchedConnection = connections[0];
    }
    
    if (matchedConnection) {
      return flow.nodes.find(n => n.id === matchedConnection.targetNodeId) || null;
    }
    
    return null;
  };

  const handleNext = (condition?: string) => {
    if (!state || !flow) return;
    
    const currentNode = getCurrentNode();
    const nextNode = getNextNode(condition);
    
    if (nextNode) {
      const newResponses = { ...state.responses };
      
      if (currentNode?.type === 'form') {
        newResponses[currentNode.id] = { ...formValues };
      } else if (currentNode?.type === 'yes-no') {
        newResponses[currentNode.id] = condition || yesNoValue;
      } else if (currentNode?.type === 'multiple-choice') {
        newResponses[currentNode.id] = condition || choiceValue;
      } else if (currentNode?.type === 'start') {
        newResponses[currentNode.id] = { started: true };
      }
      
      setState({
        currentNodeId: nextNode.id,
        responses: newResponses,
        nodeHistory: [...state.nodeHistory, state.currentNodeId],
        stepNumber: state.stepNumber + 1
      });
      
      setFormValues({});
      setYesNoValue('');
      setChoiceValue('');
    }
  };

  const handleBack = () => {
    if (!state || state.nodeHistory.length === 0) return;
    
    const previousNodeId = state.nodeHistory[state.nodeHistory.length - 1];
    setState({
      ...state,
      currentNodeId: previousNodeId,
      nodeHistory: state.nodeHistory.slice(0, -1),
      stepNumber: state.stepNumber - 1
    });
  };

  const handleClose = () => {
    setLocation(`/admin/flows/${flowId}`);
  };

  if (!flow || !state) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">No current node</div>
      </div>
    );
  }

  const renderNodeContent = () => {
    switch (currentNode.type) {
      case 'start':
        return (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Click Next to begin the form</p>
          </div>
        );

      case 'yes-no':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentNode.question}</h2>
            <RadioGroup value={yesNoValue} onValueChange={setYesNoValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">{currentNode.yesLabel || 'Yes'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">{currentNode.noLabel || 'No'}</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            {currentNode.formTitle && (
              <h2 className="text-xl font-semibold text-teal-600">{currentNode.formTitle}</h2>
            )}
            {currentNode.formFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'info':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">{currentNode.formTitle || currentNode.question}</h3>
                {currentNode.formDescription && (
                  <p className="text-gray-600 mt-1">{currentNode.formDescription}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">{currentNode.thankYouTitle || 'Thank You!'}</h1>
            {currentNode.thankYouMessage && (
              <p className="text-gray-600">{currentNode.thankYouMessage}</p>
            )}
            {currentNode.legalDisclaimer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-800 mb-2">Legal Disclaimer:</h4>
                <p className="text-sm text-blue-700">{currentNode.legalDisclaimer}</p>
              </div>
            )}
            {currentNode.additionalInfoPrompt && (
              <div className="text-left">
                <p className="text-gray-700 mb-2">{currentNode.additionalInfoPrompt}</p>
                <Textarea 
                  placeholder="Optional: Share any additional details about your case..."
                  className="w-full"
                />
              </div>
            )}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentNode.question}</h2>
            <RadioGroup value={choiceValue} onValueChange={setChoiceValue}>
              {currentNode.options?.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentNode.question}</h2>
            <Input
              id="text-input"
              type="text"
              placeholder="Enter your answer..."
              value={formValues['text-input'] || ''}
              onChange={(e) => setFormValues({ ...formValues, 'text-input': e.target.value })}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{currentNode.question}</h2>
            <Input
              id="date-input"
              type="date"
              value={formValues['date-input'] || ''}
              onChange={(e) => setFormValues({ ...formValues, 'date-input': e.target.value })}
            />
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">{currentNode.successTitle || 'Congratulations!'}</h1>
            {currentNode.successMessage && (
              <p className="text-gray-600">{currentNode.successMessage}</p>
            )}
          </div>
        );

      case 'end':
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">{currentNode.thankYouTitle || 'Thank You!'}</h1>
            {currentNode.thankYouMessage && (
              <p className="text-gray-600">{currentNode.thankYouMessage}</p>
            )}
          </div>
        );

      case 'subflow':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900">{currentNode.question || 'Subflow'}</h2>
              <p className="text-purple-700 mt-2">
                {currentNode.referencedFlowName 
                  ? `This step references: ${currentNode.referencedFlowName}` 
                  : 'This step references another flow'}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Unknown node type: {currentNode.type}</p>
          </div>
        );
    }
  };

  const isLastNode = ['completion', 'success', 'end'].includes(currentNode.type);
  const canProceed = () => {
    if (currentNode.type === 'yes-no') return !!yesNoValue;
    if (currentNode.type === 'multiple-choice') return !!choiceValue;
    if (currentNode.type === 'form') {
      return currentNode.formFields.every(field => !field.required || formValues[field.id]);
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Form Preview</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <Card className="border-dashed">
            <CardContent className="p-6 min-h-[300px]">
              {renderNodeContent()}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-between p-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={state.nodeHistory.length === 0}
          >
            Back
          </Button>
          
          <span className="text-gray-500">Step {state.stepNumber}</span>
          
          {isLastNode ? (
            <Button 
              onClick={handleClose}
              className="bg-green-500 hover:bg-green-600"
            >
              Submit Request
            </Button>
          ) : (
            <Button 
              onClick={() => handleNext(
                currentNode.type === 'yes-no' ? yesNoValue : 
                currentNode.type === 'multiple-choice' ? choiceValue : 
                undefined
              )}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
