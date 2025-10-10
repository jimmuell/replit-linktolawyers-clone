import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { buildFlowConfig, getCaseTypeOptions, getLabels } from '@/lib/translations';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type definitions for the questionnaire system
type Answer = string | boolean | number;
type Option = { value: string; label: string };
type Question = {
  id: string;
  kind: 'confirm' | 'single' | 'multi' | 'text' | 'textarea' | 'date';
  prompt: string;
  options?: Option[];
  required?: boolean;
  visibleIf?: (answers: Record<string, Answer>) => boolean;
  next?: (answers: Record<string, Answer>) => string | 'END';
};

type Flow = {
  start: string;
  nodes: Record<string, Question>;
};

type CaseType = 'family-based-immigrant-visa-immediate-relative' | 'k1-fiance-visa' | 'removal-of-conditions' | 'asylum-affirmative' | 'citizenship-naturalization-n400' | 'other';

type Step = 'basic-info' | 'case-type' | 'questionnaire' | 'wrap-up';

interface BasicInfo {
  fullName: string;
  email: string;
}

// Flow configuration for all case types
const FLOW_CONFIG = buildFlowConfig('en');

// Spanish translations for all flow configurations
const FLOW_CONFIG_ES = buildFlowConfig('es');

export function NewQuoteModal({ isOpen, onClose }: NewQuoteModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [caseType, setCaseType] = useState<CaseType | ''>('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    fullName: '',
    email: ''
  });
  const [currentNodeKey, setCurrentNodeKey] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtherCaseDialog, setShowOtherCaseDialog] = useState<boolean>(false);

  const [location] = useLocation();
  const isSpanish = location.startsWith('/es');
  const { toast } = useToast();

  // UI labels from translation files
  const labels = getLabels(isSpanish ? 'es' : 'en');

  // Case type options from translation files
  const caseTypeOptions = getCaseTypeOptions(isSpanish ? 'es' : 'en').map(opt => ({
    value: opt.value as CaseType,
    label: opt.label
  }));

  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!basicInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!basicInfo.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCurrentQuestionValid = (): boolean => {
    if (!caseType || currentStep !== 'questionnaire') return true;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion?.required) return true;
    
    const answer = answers[currentNodeKey];
    return !(!answer || (typeof answer === 'string' && !answer.trim()));
  };

  const validateCurrentQuestion = (): boolean => {
    if (!caseType || currentStep !== 'questionnaire') return true;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion?.required) return true;
    
    const newErrors: Record<string, string> = {};
    
    // Validate main question
    const answer = answers[currentNodeKey];
    if (!answer || (typeof answer === 'string' && !answer.trim())) {
      newErrors[currentNodeKey] = 'This field is required';
    }
    
    // Validate conditional questions that are displayed inline
    if (currentNodeKey === 'inside_status_out_status_benefit' && answer === 'yes') {
      // Validate explanation field
      const explainAnswer = answers['inside_status_out_status_benefit_explain'];
      if (!explainAnswer || (typeof explainAnswer === 'string' && !explainAnswer.trim())) {
        newErrors['inside_status_out_status_benefit_explain'] = 'This field is required';
      }
      
      // Validate help field
      const helpAnswer = answers['inside_status_out_status_help'];
      if (!helpAnswer || (typeof helpAnswer === 'string' && !helpAnswer.trim())) {
        newErrors['inside_status_out_status_help'] = 'This field is required';
      }
    }
    
    if (currentNodeKey === 'inside_status_in_status_visa' && answer) {
      // Validate help field for in_status path
      const helpAnswer = answers['inside_status_in_status_help'];
      if (!helpAnswer || (typeof helpAnswer === 'string' && !helpAnswer.trim())) {
        newErrors['inside_status_in_status_help'] = 'This field is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicInfoNext = () => {
    if (validateBasicInfo()) {
      setCurrentStep('case-type');
    }
  };

  const handleCaseTypeNext = () => {
    if (caseType) {
      const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
      setCurrentNodeKey(flow.start);
      setNavigationHistory([]); // Reset navigation history for new flow
      setAnswers({}); // Clear previous answers to avoid stale data
      setErrors({});
      setCurrentStep('questionnaire');
    }
  };

  const handleQuestionNext = () => {
    if (!validateCurrentQuestion() || !caseType) return;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (currentQuestion.next) {
      // Always track current node in navigation history
      setNavigationHistory(prev => [...prev, currentNodeKey]);
      
      // Special handling for conditional questions that are now rendered inline
      if (currentNodeKey === 'inside_status_out_status_benefit' || currentNodeKey === 'inside_status_in_status_visa') {
        // Skip to the married question since conditional questions are handled inline
        setCurrentNodeKey('inside_married_before');
      } else {
        const nextKey = currentQuestion.next(answers);
        
        if (nextKey === 'END') {
          // Special handling for "other" case type - show custom dialog instead of going to wrap-up
          if (caseType === 'other') {
            handleOtherCaseSubmission();
          } else {
            setCurrentStep('wrap-up');
          }
        } else {
          setCurrentNodeKey(nextKey);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'case-type') {
      setCurrentStep('basic-info');
    } else if (currentStep === 'questionnaire') {
      // Use navigation history for accurate back navigation
      if (navigationHistory.length > 0) {
        const previousNodeKey = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory(prev => prev.slice(0, -1));
        setCurrentNodeKey(previousNodeKey);
      } else {
        // If no history, go back to case-type (we're at the start)
        setCurrentStep('case-type');
      }
    } else if (currentStep === 'wrap-up') {
      // Go back to the last question using navigation history
      if (navigationHistory.length > 0) {
        const lastNodeKey = navigationHistory[navigationHistory.length - 1];
        setCurrentNodeKey(lastNodeKey);
        setCurrentStep('questionnaire');
      } else if (caseType) {
        // If no history, go to the start of the flow
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        setCurrentNodeKey(flow.start);
        setCurrentStep('questionnaire');
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create transcript of questions and answers in order
      const transcript: Array<{ question: string; answer: string }> = [];
      
      if (caseType) {
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        // Create ordered transcript based on navigation history + current answers
        const questionOrder = [...navigationHistory, currentNodeKey];
        
        questionOrder.forEach((questionId) => {
          const question = flow.nodes[questionId];
          const answer = answers[questionId];
          if (question && answer !== undefined) {
            let answerText = String(answer);
            if (question.options) {
              const option = question.options.find(opt => opt.value === answer);
              answerText = option?.label || answerText;
            }
            transcript.push({
              question: question.prompt,
              answer: answerText
            });
          }
        });
      }

      // Format data to match existing backend endpoint
      const submissionData = {
        firstName: basicInfo.fullName.split(' ')[0] || basicInfo.fullName,
        lastName: basicInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: basicInfo.email,
        caseType,
        formResponses: {
          answers,
          additionalDetails,
          transcript,
          submittedAt: new Date().toISOString()
        }
      };

      // POST to structured intakes endpoint
      await apiRequest('/api/structured-intakes', {
        method: 'POST',
        body: submissionData
      });

      toast({
        title: 'Quote Request Submitted',
        description: 'Thank you! An experienced attorney will be in touch soon.',
        variant: 'default'
      });

      handleClose();
    } catch (error) {
      console.error('Error submitting intake:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtherCaseSubmission = async () => {
    setIsSubmitting(true);
    
    try {
      // Save the submission to the database
      const submissionData = {
        firstName: basicInfo.fullName.split(' ')[0] || basicInfo.fullName,
        lastName: basicInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: basicInfo.email,
        caseType: 'other',
        formResponses: {
          answers,
          additionalDetails,
          submittedAt: new Date().toISOString()
        }
      };

      await apiRequest('/api/structured-intakes', {
        method: 'POST',
        body: submissionData
      });

      // Show the custom dialog message
      setShowOtherCaseDialog(true);
    } catch (error) {
      console.error('Error submitting other case intake:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('basic-info');
    setCaseType('');
    setBasicInfo({ fullName: '', email: '' });
    setCurrentNodeKey('');
    setAnswers({});
    setAdditionalDetails('');
    setErrors({});
    setNavigationHistory([]);
    setIsSubmitting(false);
    setShowOtherCaseDialog(false);
    onClose();
  };

  const renderQuestion = () => {
    if (!caseType) return null;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion) return null;

    const answer = answers[currentNodeKey];
    const error = errors[currentNodeKey];

    const updateAnswer = (value: Answer) => {
      setAnswers(prev => ({
        ...prev,
        [currentNodeKey]: value
      }));
      setErrors({});
    };

    // Helper function to render conditional follow-up questions
    const renderConditionalQuestions = () => {
      const conditionalQuestions = [];
      
      // For inside_status_out_status_benefit question, show follow-ups inline
      if (currentNodeKey === 'inside_status_out_status_benefit' && answer === 'yes') {
        // Show explanation textarea
        const explainAnswer = answers['inside_status_out_status_benefit_explain'];
        const explainError = errors['inside_status_out_status_benefit_explain'];
        
        conditionalQuestions.push(
          <div key="explanation" className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg border">
            <Label className="text-lg font-medium">
              {isSpanish 
                ? 'Si la respuesta es sí, por favor proporcione una explicación' 
                : 'If the answer is yes, please provide an explanation'}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              value={String(explainAnswer || '')}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                'inside_status_out_status_benefit_explain': e.target.value
              }))}
              placeholder={isSpanish ? 'Ingrese su explicación' : 'Enter your explanation'}
              rows={3}
              data-testid="textarea-inside_status_out_status_benefit_explain"
            />
            {explainError && (
              <p className="text-red-500 text-sm">{explainError}</p>
            )}
          </div>
        );
      }
      
      // Show assistance question for both in_status and out_status paths
      if (currentNodeKey === 'inside_status_in_status_visa' || 
          (currentNodeKey === 'inside_status_out_status_benefit' && answer)) {
        const helpQuestionId = currentNodeKey === 'inside_status_in_status_visa' 
          ? 'inside_status_in_status_help'
          : 'inside_status_out_status_help';
        const helpAnswer = answers[helpQuestionId];
        const helpError = errors[helpQuestionId];
        
        conditionalQuestions.push(
          <div key="help" className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg border">
            <Label className="text-lg font-medium">
              {isSpanish 
                ? '¿Qué tipo de asistencia legal o ayuda de inmigración necesita?' 
                : 'What type of legal assistance or immigration help do you need?'}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              value={String(helpAnswer || '')}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [helpQuestionId]: e.target.value
              }))}
              placeholder={isSpanish ? 'Describe el tipo de ayuda que necesita' : 'Describe the type of help you need'}
              rows={3}
              data-testid={`textarea-${helpQuestionId}`}
            />
            {helpError && (
              <p className="text-red-500 text-sm">{helpError}</p>
            )}
          </div>
        );
      }
      
      return conditionalQuestions;
    };

    return (
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          {currentQuestion.prompt}
          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {currentQuestion.kind === 'confirm' && currentQuestion.options && (
          <RadioGroup 
            value={String(answer || '')} 
            onValueChange={updateAnswer}
            data-testid={`radio-group-${currentQuestion.id}`}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  data-testid={`radio-${option.value}`}
                />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.kind === 'single' && currentQuestion.options && (
          <RadioGroup 
            value={String(answer || '')} 
            onValueChange={updateAnswer}
            data-testid={`radio-group-${currentQuestion.id}`}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  data-testid={`radio-${option.value}`}
                />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.kind === 'text' && (
          <Input
            value={String(answer || '')}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Enter your answer"
            data-testid={`input-${currentQuestion.id}`}
          />
        )}

        {currentQuestion.kind === 'textarea' && (
          <Textarea
            value={String(answer || '')}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Enter your answer"
            rows={3}
            data-testid={`textarea-${currentQuestion.id}`}
          />
        )}

        {currentQuestion.kind === 'date' && (
          <Input
            type="date"
            value={String(answer || '')}
            onChange={(e) => updateAnswer(e.target.value)}
            data-testid={`input-date-${currentQuestion.id}`}
          />
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Render conditional follow-up questions */}
        {renderConditionalQuestions()}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Get Your Legal Quote</h2>
              <p className="text-gray-600 mt-2">Tell us about yourself to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">{labels.fullName} <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  value={basicInfo.fullName}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  data-testid="input-full-name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">{labels.email} <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleBasicInfoNext} disabled={!basicInfo.fullName || !basicInfo.email} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'case-type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{labels.chooseClosestOption}</h2>
            </div>

            <div className="space-y-4">
              <RadioGroup value={caseType} onValueChange={(value) => setCaseType(value as CaseType)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseTypeOptions.map((caseTypeOption) => (
                  <div key={caseTypeOption.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value={caseTypeOption.value} id={caseTypeOption.value} className="mt-1" data-testid={`radio-${caseTypeOption.value}`} />
                    <Label htmlFor={caseTypeOption.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900">{caseTypeOption.label}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button onClick={handleCaseTypeNext} disabled={!caseType} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'questionnaire':
        return (
          <div className="space-y-6">
            {renderQuestion()}
            
            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button onClick={handleQuestionNext} disabled={!checkCurrentQuestionValid()} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'wrap-up':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{labels.thankYou}</h2>
              <p className="text-gray-600 mt-2">
                {labels.thankYouSubtitle}
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{isSpanish ? 'Descargo de Responsabilidad Legal:' : 'Legal Disclaimer:'}</strong> {labels.legalDisclaimer}
              </p>
            </div>

            {/* Optional Details */}
            <div className="space-y-4">
              <Label htmlFor="additionalDetails">
                {labels.additionalDetails}
              </Label>
              <Textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={labels.additionalDetailsPlaceholder}
                rows={4}
                data-testid="textarea-additional-details"
              />
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50" 
                data-testid="button-submit"
              >
                {isSubmitting ? labels.submittingButton : labels.submitButton}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${currentStep === 'case-type' ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className="sr-only">
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>
              {labels.subtitle}
            </DialogDescription>
          </DialogHeader>
          {renderStep()}
        </DialogContent>
      </Dialog>

      {/* Dialog for "Other" case type submissions */}
      <Dialog open={showOtherCaseDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{labels.otherDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line">
              {labels.otherDialogMessage}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                {labels.closeButton}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}