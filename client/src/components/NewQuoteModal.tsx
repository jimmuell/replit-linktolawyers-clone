import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react';

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

type CaseType = 'family-based-immigrant-visa-immediate-relative' | 'k1-fiance-visa' | 'removal-of-conditions' | 'asylum-affirmative' | 'citizenship-naturalization-n400';

type Step = 'basic-info' | 'case-type' | 'questionnaire' | 'wrap-up';

interface BasicInfo {
  fullName: string;
  email: string;
}

// Flow configuration for all case types
const FLOW_CONFIG: Record<CaseType, Flow> = {
  'family-based-immigrant-visa-immediate-relative': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: 'Great! This is for people getting a green card through a U.S. citizen or legal permanent resident family member. Is that correct?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'relationship'
      },
      relationship: {
        id: 'relationship',
        kind: 'single',
        prompt: 'What is your relationship to the family member who can help you?',
        options: [
          { value: 'spouse', label: 'Spouse (U.S. citizen or LPR)' },
          { value: 'parent', label: 'Parent (U.S. citizen or LPR)' },
          { value: 'child', label: 'Child (U.S. citizen, 21 year or older)' },
          { value: 'other', label: 'Other' }
        ],
        required: true,
        next: () => 'location'
      },
      location: {
        id: 'location',
        kind: 'single',
        prompt: 'Are you inside the U.S. right now, or outside the U.S.?',
        options: [
          { value: 'inside', label: 'Inside the U.S.' },
          { value: 'outside', label: 'Outside the U.S.' }
        ],
        required: true,
        next: (answers) => answers.location === 'inside' ? 'inside_inspected' : 'outside_prior_benefit'
      },
      inside_inspected: {
        id: 'inside_inspected',
        kind: 'single',
        prompt: 'When you came to the U.S., were you inspected by a U.S. border officer?',
        options: [
          { value: 'yes', label: 'Yes - I was inspected and admitted' },
          { value: 'no', label: 'No - I entered without being inspected' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'inside_status'
      },
      inside_status: {
        id: 'inside_status',
        kind: 'textarea',
        prompt: 'Are you still in legal status, or out of status? (*In status* means following the rules of your visa and staying in the U.S. for the period allowed on your I-94. *Out of status* means you have stayed in the U.S. past the time allowed.) If you entered with inspection, what kind of visa did you enter on or entry did you use? Example: tourist, student, work, or no visa.',
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'inside_married_before'
      },
      inside_married_before: {
        id: 'inside_married_before',
        kind: 'confirm',
        prompt: 'Have you ever been married before?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'END'
      },
      outside_prior_benefit: {
        id: 'outside_prior_benefit',
        kind: 'textarea',
        prompt: 'Have you ever applied for an immigration benefit before? If yes, what happened?',
        required: true,
        visibleIf: (answers) => answers.location === 'outside',
        next: () => 'outside_help_type'
      },
      outside_help_type: {
        id: 'outside_help_type',
        kind: 'textarea',
        prompt: 'What kind of legal help are you looking for right now?',
        required: true,
        visibleIf: (answers) => answers.location === 'outside',
        next: () => 'END'
      }
    }
  },
  'asylum-affirmative': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: 'Great! This is for people in the U.S. due to fear of being persecuted if they return to their home country. Is that correct?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'inspected'
      },
      inspected: {
        id: 'inspected',
        kind: 'single',
        prompt: 'When you came to the U.S., were you inspected by a U.S. border officer?',
        options: [
          { value: 'yes', label: 'Yes - I was inspected and admitted' },
          { value: 'no', label: 'No - I entered without being inspected' }
        ],
        required: true,
        next: () => 'entry_date'
      },
      entry_date: {
        id: 'entry_date',
        kind: 'text',
        prompt: 'What date did you enter? Please give the date or your best guess.',
        required: true,
        next: () => 'afraid_return'
      },
      afraid_return: {
        id: 'afraid_return',
        kind: 'textarea',
        prompt: 'Are you afraid to return back to your home country? If yes, can you tell me why?',
        required: true,
        next: () => 'immigration_court'
      },
      immigration_court: {
        id: 'immigration_court',
        kind: 'confirm',
        prompt: 'Have you ever been placed in immigration court or faced deportation proceedings? Has the U.S. government sent you to immigration court or removal (deportation) proceedings?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'END'
      }
    }
  },
  'removal-of-conditions': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: 'Great! You are a conditional permanent resident who obtained status through marriage?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: 'What is the start date on your green card?',
        required: true,
        next: () => 'marital_evidence'
      },
      marital_evidence: {
        id: 'marital_evidence',
        kind: 'single',
        prompt: 'On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1 = very little and 10 = a lot).',
        options: [
          { value: '1', label: '1 - Very little' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
          { value: '6', label: '6' },
          { value: '7', label: '7' },
          { value: '8', label: '8' },
          { value: '9', label: '9' },
          { value: '10', label: '10 - A lot' }
        ],
        required: true,
        next: () => 'filing_type'
      },
      filing_type: {
        id: 'filing_type',
        kind: 'single',
        prompt: 'How will you file your application? (check one)',
        options: [
          { value: 'joint', label: 'Together with my spouse ("joint filing")' },
          { value: 'waiver', label: 'On my own (waiver)' }
        ],
        required: true,
        next: () => 'marriage_situation'
      },
      marriage_situation: {
        id: 'marriage_situation',
        kind: 'single',
        prompt: 'What is your current marriage situation?',
        options: [
          { value: 'married_together', label: 'Married living together' },
          { value: 'married_apart', label: 'Married but living apart' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widow', label: 'Widow(er)' }
        ],
        required: true,
        next: () => 'END'
      }
    }
  },
  'k1-fiance-visa': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: 'Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'met_in_person'
      },
      met_in_person: {
        id: 'met_in_person',
        kind: 'confirm',
        prompt: 'Have you and your fiance(e) met in person within the last 2 years?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'married_before'
      },
      married_before: {
        id: 'married_before',
        kind: 'confirm',
        prompt: 'Has either you (the petitioner) or your fiance(e) (the beneficiary) ever been married before?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'fiance_outside_us'
      },
      fiance_outside_us: {
        id: 'fiance_outside_us',
        kind: 'confirm',
        prompt: 'Is your fiance(e) outside the U.S.?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'prior_immigration_benefit'
      },
      prior_immigration_benefit: {
        id: 'prior_immigration_benefit',
        kind: 'textarea',
        prompt: 'Has your fiance(e) applied for an immigration benefit before? If so, please briefly explain.',
        required: true,
        next: () => 'END'
      }
    }
  },
  'citizenship-naturalization-n400': {
    start: 'green_card_how',
    nodes: {
      green_card_how: {
        id: 'green_card_how',
        kind: 'textarea',
        prompt: 'How did you get your green card? (Example: through family, work, marriage, or something else.)',
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: 'What is the start date on your green card? Please share the date printed on your card.',
        required: true,
        next: () => 'trips_over_6_months'
      },
      trips_over_6_months: {
        id: 'trips_over_6_months',
        kind: 'confirm',
        prompt: 'Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'lived_in_us_5_years'
      },
      lived_in_us_5_years: {
        id: 'lived_in_us_5_years',
        kind: 'confirm',
        prompt: 'In the last 5 years, have you lived in the U.S. at least half the time?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'marriage_3_year_rule'
      },
      marriage_3_year_rule: {
        id: 'marriage_3_year_rule',
        kind: 'confirm',
        prompt: 'If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time while married and living with your U.S. citizen spouse?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_applicable', label: 'Not applicable - I am not applying through marriage' }
        ],
        required: true,
        next: () => 'END'
      }
    }
  }
};

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

  // Case type options (exactly 5 as specified)
  const caseTypeOptions = [
    {
      value: 'family-based-immigrant-visa-immediate-relative' as CaseType,
      label: 'Green Card through a Spouse or Family Member ("Family-Based Green Card") Family'
    },
    {
      value: 'k1-fiance-visa' as CaseType,
      label: 'Fiance(e) Visa ("K-1 visa")'
    },
    {
      value: 'removal-of-conditions' as CaseType,
      label: 'Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions ")'
    },
    {
      value: 'asylum-affirmative' as CaseType,
      label: 'Asylum or Protection From Persecution'
    },
    {
      value: 'citizenship-naturalization-n400' as CaseType,
      label: 'U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen Naturalization / Citizenship'
    }
  ];

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

  const validateCurrentQuestion = (): boolean => {
    if (!caseType || currentStep !== 'questionnaire') return true;
    
    const flow = FLOW_CONFIG[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion?.required) return true;
    
    const answer = answers[currentNodeKey];
    if (!answer || (typeof answer === 'string' && !answer.trim())) {
      setErrors({ [currentNodeKey]: 'This field is required' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleBasicInfoNext = () => {
    if (validateBasicInfo()) {
      setCurrentStep('case-type');
    }
  };

  const handleCaseTypeNext = () => {
    if (caseType) {
      const flow = FLOW_CONFIG[caseType];
      setCurrentNodeKey(flow.start);
      setCurrentStep('questionnaire');
    }
  };

  const handleQuestionNext = () => {
    if (!validateCurrentQuestion() || !caseType) return;
    
    const flow = FLOW_CONFIG[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (currentQuestion.next) {
      const nextKey = currentQuestion.next(answers);
      if (nextKey === 'END') {
        setCurrentStep('wrap-up');
      } else {
        setCurrentNodeKey(nextKey);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'case-type') {
      setCurrentStep('basic-info');
    } else if (currentStep === 'questionnaire') {
      // Find previous question by checking which question leads to current one
      if (!caseType) return;
      const flow = FLOW_CONFIG[caseType];
      
      // If we're at the start, go back to case-type
      if (currentNodeKey === flow.start) {
        setCurrentStep('case-type');
        return;
      }
      
      // Find the previous question
      for (const [nodeKey, question] of Object.entries(flow.nodes)) {
        if (question.next && question.next(answers) === currentNodeKey) {
          setCurrentNodeKey(nodeKey);
          return;
        }
      }
    } else if (currentStep === 'wrap-up') {
      // Find the last question in the flow
      if (!caseType) return;
      const flow = FLOW_CONFIG[caseType];
      for (const [nodeKey, question] of Object.entries(flow.nodes)) {
        if (question.next && question.next(answers) === 'END') {
          setCurrentNodeKey(nodeKey);
          setCurrentStep('questionnaire');
          return;
        }
      }
    }
  };

  const handleSubmit = async () => {
    // Create transcript of questions and answers
    const transcript: Array<{ question: string; answer: string }> = [];
    
    if (caseType) {
      const flow = FLOW_CONFIG[caseType];
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = flow.nodes[questionId];
        if (question) {
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

    const submissionData = {
      basicInfo,
      caseType,
      answers,
      additionalDetails,
      transcript
    };

    console.log('Submitting structured intake:', submissionData);
    
    // TODO: POST to /api/structured-intakes
    // For now, just close the modal
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('basic-info');
    setCaseType('');
    setBasicInfo({ fullName: '', email: '' });
    setCurrentNodeKey('');
    setAnswers({});
    setAdditionalDetails('');
    setErrors({});
    onClose();
  };

  const renderQuestion = () => {
    if (!caseType) return null;
    
    const flow = FLOW_CONFIG[caseType];
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

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
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
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
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
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'case-type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Please choose the closest option:</h2>
            </div>

            <div className="space-y-4">
              <RadioGroup value={caseType} onValueChange={setCaseType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleCaseTypeNext} disabled={!caseType} data-testid="button-continue">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
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
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleQuestionNext} disabled={!validateCurrentQuestion()} data-testid="button-continue">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'wrap-up':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-600 mt-2">
                We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Legal Disclaimer:</strong> This AI assistant provides general information only and does not constitute legal advice. For specific legal matters, please consult with a qualified immigration attorney.
              </p>
            </div>

            {/* Optional Details */}
            <div className="space-y-4">
              <Label htmlFor="additionalDetails">
                Would you like to add any more details about your case? This helps the attorney understand your case better.
              </Label>
              <Textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Optional: Share any additional details about your case..."
                rows={4}
                data-testid="textarea-additional-details"
              />
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white" data-testid="button-submit">
                Submit Request
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${currentStep === 'case-type' ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="sr-only">
          <DialogTitle>Get Quote</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}