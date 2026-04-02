import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { buildFlowConfig, getLabels } from '@/lib/translations';
import type { CaseType as CaseTypeDB } from '@shared/schema';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBasicInfo?: { fullName: string; email: string };
  initialCaseType?: string;
  skipToQuestionnaire?: boolean;
  language?: 'en' | 'es';
  onStart?: () => void;
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

type CaseType = string;

type Step = 'welcome' | 'basic-info' | 'role-selection' | 'case-type' | 'questionnaire' | 'no-flow' | 'wrap-up';

type Role = 'beneficiary' | 'petitioner' | '';

interface BasicInfo {
  fullName: string;
  email: string;
  phone: string;
  state: string;
}

// US States list
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'US Virgin Islands' },
  { value: 'GU', label: 'Guam' },
  { value: 'OTHER', label: 'Outside the US' },
];

// Flow configuration for all case types (legacy - flows are now managed via admin interface)
const FLOW_CONFIG: Record<string, Flow> = buildFlowConfig('en') as unknown as Record<string, Flow>;

// Spanish translations for all flow configurations (legacy)
const FLOW_CONFIG_ES: Record<string, Flow> = buildFlowConfig('es') as unknown as Record<string, Flow>;

export function NewQuoteModal({ isOpen, onClose, initialBasicInfo, initialCaseType, skipToQuestionnaire = false, language = 'en', onStart }: NewQuoteModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(skipToQuestionnaire ? 'questionnaire' : 'welcome');
  const [caseType, setCaseType] = useState<CaseType | ''>(initialCaseType as CaseType || '');
  const [role, setRole] = useState<Role>('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(
    initialBasicInfo ? { ...initialBasicInfo, phone: '', state: '' } : {
      fullName: '',
      email: '',
      phone: '',
      state: ''
    }
  );
  const [currentNodeKey, setCurrentNodeKey] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtherCaseDialog, setShowOtherCaseDialog] = useState<boolean>(false);
  const [dbFlow, setDbFlow] = useState<any>(null);
  const [dbCurrentNodeId, setDbCurrentNodeId] = useState<string>('');
  const [dbNodeHistory, setDbNodeHistory] = useState<string[]>([]);
  const [isLoadingFlow, setIsLoadingFlow] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [yesNoValue, setYesNoValue] = useState<string>('');
  const [choiceValue, setChoiceValue] = useState<string>('');

  const [location] = useLocation();
  const isSpanish = location.startsWith('/es');
  const { toast } = useToast();

  // Initialize questionnaire when modal opens with prefilled data
  useEffect(() => {
    if (isOpen && skipToQuestionnaire && initialCaseType && caseType) {
      const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType as CaseType];
      if (flow && !currentNodeKey) {
        setCurrentNodeKey(flow.start);
        setNavigationHistory([]);
        setAnswers({});
        setErrors({});
      }
    }
  }, [isOpen, skipToQuestionnaire, initialCaseType, caseType, isSpanish, currentNodeKey]);

  // UI labels from translation files
  const labels = getLabels(isSpanish ? 'es' : 'en');

  // Fetch categories from database
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ success: boolean; data: CaseTypeDB[] }>({
    queryKey: ['/api/case-types'],
    enabled: isOpen,
  });

  // Filter categories by role and sort by display order
  const caseTypeOptions = (categoriesData?.data || [])
    .filter((cat: CaseTypeDB) => {
      // Only show active categories
      if (!cat.isActive) return false;
      
      // Filter by applicant type based on selected role
      if (!role) return true;
      
      if (role === 'beneficiary') {
        return cat.applicantType === 'beneficiary' || cat.applicantType === 'both';
      } else if (role === 'petitioner') {
        return cat.applicantType === 'petitioner' || cat.applicantType === 'both';
      }
      
      return true;
    })
    .sort((a: CaseTypeDB, b: CaseTypeDB) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((cat: CaseTypeDB) => ({
      value: cat.value,
      label: isSpanish && cat.labelEs ? cat.labelEs : cat.label,
      flowId: cat.flowId
    }));

  // Get the selected category's flowId
  const getSelectedFlowId = (): number | null => {
    const selected = caseTypeOptions.find(opt => opt.value === caseType);
    return selected?.flowId || null;
  };

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
    if (!basicInfo.state) {
      newErrors.state = 'State is required';
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
      setCurrentStep('role-selection');
    }
  };

  const handleRoleSelectionNext = () => {
    if (role) {
      setCurrentStep('case-type');
    }
  };

  const handleCaseTypeNext = async () => {
    if (caseType) {
      const flowId = getSelectedFlowId();
      
      if (flowId) {
        // Fetch the assigned flow from the database
        setIsLoadingFlow(true);
        try {
          const response = await fetch(`/api/flows/${flowId}`);
          if (response.ok) {
            const flow = await response.json();
            setDbFlow(flow);
            
            // Find the start node
            const startNode = flow.nodes?.find((n: any) => n.type === 'start');
            const firstNodeId = startNode?.id || flow.nodes?.[0]?.id || '';
            
            setDbCurrentNodeId(firstNodeId);
            setDbNodeHistory([]);
            setNavigationHistory([]);
            setAnswers({});
            setErrors({});
            setFormValues({});
            setYesNoValue('');
            setChoiceValue('');
            setCurrentStep('questionnaire');
          } else {
            // Flow not found, show no flow message
            setCurrentStep('no-flow');
          }
        } catch (error) {
          console.error('Error fetching flow:', error);
          setCurrentStep('no-flow');
        } finally {
          setIsLoadingFlow(false);
        }
      } else {
        // No flow assigned - show no flow available message
        setNavigationHistory([]);
        setAnswers({});
        setErrors({});
        setCurrentStep('no-flow');
      }
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
    if (currentStep === 'basic-info') {
      setCurrentStep('welcome');
    } else if (currentStep === 'role-selection') {
      setCurrentStep('basic-info');
    } else if (currentStep === 'case-type') {
      setCurrentStep('role-selection');
    } else if (currentStep === 'no-flow') {
      setCurrentStep('case-type');
    } else if (currentStep === 'questionnaire') {
      // Handle database flow back navigation
      if (dbFlow) {
        handleDbFlowBack();
      } else {
        // Use navigation history for legacy flow back navigation
        if (navigationHistory.length > 0) {
          const previousNodeKey = navigationHistory[navigationHistory.length - 1];
          setNavigationHistory(prev => prev.slice(0, -1));
          setCurrentNodeKey(previousNodeKey);
        } else {
          // If no history, go back to case-type (we're at the start)
          setCurrentStep('case-type');
        }
      }
    } else if (currentStep === 'wrap-up') {
      // Go back to the last question
      if (dbFlow && dbNodeHistory.length > 0) {
        // For database flows, go back to the last node in history
        const lastNodeId = dbNodeHistory[dbNodeHistory.length - 1];
        setDbCurrentNodeId(lastNodeId);
        setDbNodeHistory(prev => prev.slice(0, -1));
        setCurrentStep('questionnaire');
      } else if (navigationHistory.length > 0) {
        const lastNodeKey = navigationHistory[navigationHistory.length - 1];
        setCurrentNodeKey(lastNodeKey);
        setCurrentStep('questionnaire');
      } else if (caseType) {
        // If no history, go to the start of the flow
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        setCurrentNodeKey(flow?.start || '');
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
      
      if (dbFlow) {
        // For database flows, build transcript from node history
        const questionOrder = [...dbNodeHistory, dbCurrentNodeId];
        
        questionOrder.forEach((nodeId) => {
          const node = dbFlow.nodes?.find((n: any) => n.id === nodeId);
          const answer = answers[nodeId];
          if (node && answer !== undefined && node.type !== 'start' && !['completion', 'success', 'end', 'info'].includes(node.type)) {
            if (node.type === 'form' && typeof answer === 'object' && node.formFields) {
              Object.entries(answer).forEach(([fieldId, value]) => {
                if (value !== undefined && value !== '') {
                  const field = node.formFields.find((f: any) => f.id === fieldId);
                  const fieldLabel = field?.label || field?.placeholder || fieldId;
                  transcript.push({
                    question: fieldLabel,
                    answer: String(value),
                  });
                }
              });
            } else {
              let answerText = '';
              if (typeof answer === 'object') {
                answerText = Object.values(answer).filter(v => v !== undefined && v !== '').join(', ');
              } else {
                answerText = String(answer);
              }
              const questionLabel = node.question || node.formTitle || 'Question';
              transcript.push({
                question: questionLabel,
                answer: answerText,
              });
            }
          }
        });
      } else if (caseType) {
        // Legacy flow handling
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        if (flow?.nodes) {
          const questionOrder = [...navigationHistory, currentNodeKey];
          
          questionOrder.forEach((questionId) => {
            const question = flow.nodes[questionId];
            const answer = answers[questionId];
            if (question && answer !== undefined) {
              let answerText = String(answer);
              if (question.options) {
                const option = question.options.find((opt: any) => opt.value === answer);
                answerText = option?.label || answerText;
              }
              transcript.push({
                question: question.prompt,
                answer: answerText
              });
            }
          });
        }
      }

      // Format data to match existing backend endpoint
      const submissionData = {
        firstName: basicInfo.fullName.split(' ')[0] || basicInfo.fullName,
        lastName: basicInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: basicInfo.email,
        phoneNumber: basicInfo.phone || null,
        state: basicInfo.state || null,
        caseType,
        role,
        formResponses: {
          answers,
          additionalDetails,
          transcript,
          submittedAt: new Date().toISOString()
        },
        language
      };

      // POST to structured intakes endpoint
      await apiRequest('/api/structured-intakes', {
        method: 'POST',
        body: submissionData
      });

      toast({
        title: language === 'es' ? 'Solicitud Enviada' : 'Quote Request Submitted',
        description: language === 'es' ? '¡Gracias! Un abogado experimentado se pondrá en contacto pronto.' : 'Thank you! An experienced attorney will be in touch soon.',
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
        phoneNumber: basicInfo.phone || null,
        state: basicInfo.state || null,
        caseType: 'other',
        role,
        formResponses: {
          answers,
          additionalDetails,
          submittedAt: new Date().toISOString()
        },
        language
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
    setCurrentStep('welcome');
    setCaseType('');
    setRole('');
    setBasicInfo({ fullName: '', email: '', phone: '', state: '' });
    setCurrentNodeKey('');
    setAnswers({});
    setAdditionalDetails('');
    setErrors({});
    setNavigationHistory([]);
    setIsSubmitting(false);
    setShowOtherCaseDialog(false);
    setDbFlow(null);
    setDbCurrentNodeId('');
    setDbNodeHistory([]);
    setIsLoadingFlow(false);
    setFormValues({});
    setYesNoValue('');
    setChoiceValue('');
    onClose();
  };

  // Get title and subtitle for current step
  const getStepHeader = (): { title: string; subtitle?: string } => {
    switch (currentStep) {
      case 'welcome':
        return {
          title: isSpanish ? 'Bienvenido a LinkToLawyers' : 'Welcome to LinkToLawyers',
          subtitle: isSpanish 
            ? 'Obtenga precios personalizados de abogados para su caso de inmigración en solo unos pocos pasos.' 
            : 'Get personalized attorney pricing for your immigration case in just a few steps.'
        };
      case 'basic-info':
        return {
          title: isSpanish ? 'Cuéntanos sobre ti' : 'Tell us about yourself'
        };
      case 'role-selection':
        return {
          title: isSpanish ? '¿Quién solicita esta cotización?' : 'Who is requesting this quote?',
          subtitle: isSpanish 
            ? '¿Eres la persona que está siendo patrocinada o la persona que patrocina?' 
            : 'Are you the person being sponsored or the person sponsoring?'
        };
      case 'case-type':
        return {
          title: labels.chooseClosestOption,
          subtitle: role ? (isSpanish 
            ? `Seleccione su tipo de caso (${role === 'beneficiary' ? 'Beneficiario' : 'Peticionario'})` 
            : `Select your case type (${role === 'beneficiary' ? 'Beneficiary' : 'Petitioner'})`)
            : undefined
        };
      case 'questionnaire':
        return {
          title: labels.title
        };
      case 'no-flow':
        return {
          title: isSpanish ? 'Flujo no disponible' : 'Flow Not Available'
        };
      case 'wrap-up':
        return {
          title: labels.almostDone
        };
      default:
        return { title: '' };
    }
  };

  // Get current database flow node
  const getDbCurrentNode = () => {
    if (!dbFlow || !dbFlow.nodes) return null;
    return dbFlow.nodes.find((n: any) => n.id === dbCurrentNodeId) || null;
  };

  // Get next node based on connections
  const getDbNextNode = (condition?: string) => {
    if (!dbFlow || !dbFlow.connections) return null;
    
    const connections = dbFlow.connections.filter((c: any) => c.sourceNodeId === dbCurrentNodeId);
    
    let matchedConnection = connections.find((c: any) => c.condition === 'any');
    
    if (condition) {
      const conditionMatch = connections.find((c: any) => 
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
      return dbFlow.nodes.find((n: any) => n.id === matchedConnection.targetNodeId) || null;
    }
    
    return null;
  };

  // Handle next in database flow
  const captureCurrentNodeAnswer = (currentNode: any, condition?: string) => {
    const newAnswers = { ...answers };
    if (!currentNode) return newAnswers;

    if (currentNode.type === 'form') {
      newAnswers[currentNode.id] = formValues as any;
    } else if (currentNode.type === 'yes-no') {
      const rawVal = condition || yesNoValue;
      const label = rawVal === 'yes' ? (currentNode.yesLabel || 'Yes') : (currentNode.noLabel || 'No');
      newAnswers[currentNode.id] = label.trim();
    } else if (currentNode.type === 'multiple-choice') {
      const rawChoice = condition || choiceValue;
      const choiceOpt = (currentNode.options || []).find((opt: any) => opt.id === rawChoice);
      newAnswers[currentNode.id] = choiceOpt?.label?.trim() || rawChoice;
    } else if (currentNode.type === 'text') {
      newAnswers[currentNode.id] = formValues['text-input'] || '';
    } else if (currentNode.type === 'date') {
      newAnswers[currentNode.id] = formValues['date-input'] || '';
    } else if (currentNode.type === 'start') {
      newAnswers[currentNode.id] = { started: true } as any;
    }
    return newAnswers;
  };

  const handleDbFlowNext = (condition?: string) => {
    if (!dbFlow) return;
    
    const currentNode = getDbCurrentNode();
    const nextNode = getDbNextNode(condition);
    
    if (nextNode) {
      const newAnswers = captureCurrentNodeAnswer(currentNode, condition);
      
      setDbNodeHistory(prev => [...prev, dbCurrentNodeId]);
      setDbCurrentNodeId(nextNode.id);
      setAnswers(newAnswers);
      setFormValues({});
      setYesNoValue('');
      setChoiceValue('');
    } else {
      // No next node - capture final answer before going to wrap-up
      const newAnswers = captureCurrentNodeAnswer(currentNode, condition);
      setAnswers(newAnswers);
      setCurrentStep('wrap-up');
    }
  };

  // Handle back in database flow
  const handleDbFlowBack = () => {
    if (dbNodeHistory.length === 0) {
      setDbFlow(null);
      setDbCurrentNodeId('');
      setCurrentStep('case-type');
      return;
    }
    
    const previousNodeId = dbNodeHistory[dbNodeHistory.length - 1];
    setDbNodeHistory(prev => prev.slice(0, -1));
    setDbCurrentNodeId(previousNodeId);
  };

  // Check if can proceed in database flow
  const canDbFlowProceed = () => {
    const currentNode = getDbCurrentNode();
    if (!currentNode) return false;
    
    if (currentNode.type === 'yes-no') return !!yesNoValue;
    if (currentNode.type === 'multiple-choice') return !!choiceValue;
    if (currentNode.type === 'text') return !!(formValues['text-input'] || '').trim();
    if (currentNode.type === 'date') return !!(formValues['date-input'] || '').trim();
    if (currentNode.type === 'form') {
      return (currentNode.formFields || []).every((field: any) => !field.required || formValues[field.id]);
    }
    return true;
  };

  // Check if current node is end node
  const isDbEndNode = () => {
    const currentNode = getDbCurrentNode();
    return currentNode && ['completion', 'success', 'end'].includes(currentNode.type);
  };

  // Render database flow question (from admin-uploaded flows)
  const renderDbFlowQuestion = () => {
    const currentNode = getDbCurrentNode();
    if (!currentNode) return null;

    switch (currentNode.type) {
      case 'start':
        return (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{dbFlow?.name || 'Questionnaire'}</h2>
            <p className="text-gray-600">{isSpanish ? 'Haga clic en Continuar para comenzar' : 'Click Continue to begin'}</p>
          </div>
        );

      case 'yes-no':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{currentNode.question}</h2>
            <RadioGroup value={yesNoValue} onValueChange={setYesNoValue}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer flex-1">{currentNode.yesLabel || 'Yes'}</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer flex-1">{currentNode.noLabel || 'No'}</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            {currentNode.formTitle && (
              <h2 className="text-lg font-medium text-gray-900">{currentNode.formTitle}</h2>
            )}
            {currentNode.formDescription && (
              <p className="text-gray-600">{currentNode.formDescription}</p>
            )}
            {(currentNode.formFields || []).map((field: any) => (
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
                    onChange={(e) => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    value={formValues[field.id] || ''}
                    onChange={(e) => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'info':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{currentNode.formTitle || currentNode.infoTitle || currentNode.question}</h3>
              {(currentNode.formDescription || currentNode.infoDescription) && (
                <p className="text-gray-600 mt-2">{currentNode.formDescription || currentNode.infoDescription}</p>
              )}
            </div>
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{currentNode.question}</h2>
            <RadioGroup value={choiceValue} onValueChange={setChoiceValue}>
              {(currentNode.options || []).map((option: any) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{currentNode.question}</h2>
            <Input
              id="text-input"
              placeholder={isSpanish ? 'Ingrese su respuesta...' : 'Enter your answer...'}
              value={formValues['text-input'] || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, 'text-input': e.target.value }))}
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{currentNode.question}</h2>
            <Input
              id="date-input"
              type="date"
              value={formValues['date-input'] || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, 'date-input': e.target.value }))}
            />
          </div>
        );

      case 'completion':
      case 'success':
      case 'end':
        return (
          <div className="space-y-6">
            {/* Title section from node */}
            {(currentNode.thankYouTitle || currentNode.successTitle) && (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentNode.thankYouTitle || currentNode.successTitle}
                </h2>
                {(currentNode.thankYouMessage || currentNode.successMessage) && (
                  <p className="text-gray-600 mt-2">{currentNode.thankYouMessage || currentNode.successMessage}</p>
                )}
              </div>
            )}
            
            {/* Legal disclaimer from node */}
            {currentNode.legalDisclaimer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">{currentNode.legalDisclaimer}</p>
              </div>
            )}
            
            {/* Additional info prompt from node */}
            {currentNode.additionalInfoPrompt && (
              <div className="space-y-2">
                <p className="text-gray-700">{currentNode.additionalInfoPrompt}</p>
                <Textarea
                  id="additionalDetails"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder={isSpanish ? 'Opcional: Comparta detalles adicionales...' : 'Optional: Share additional details...'}
                  rows={4}
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">{currentNode.question || currentNode.formTitle || 'Question'}</h2>
            <Textarea
              placeholder={isSpanish ? 'Ingrese su respuesta' : 'Enter your answer'}
              value={formValues['default'] || ''}
              onChange={(e) => setFormValues(prev => ({ ...prev, 'default': e.target.value }))}
            />
          </div>
        );
    }
  };

  const renderQuestion = () => {
    if (!caseType) return null;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow?.nodes?.[currentNodeKey];
    
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
      case 'welcome':
        return (
          <div className="flex justify-center pt-8">
            <Button 
              onClick={() => { onStart?.(); setCurrentStep('basic-info'); }} 
              className="bg-black hover:bg-gray-800 text-white px-12 py-6 text-lg"
              data-testid="button-start"
            >
              {isSpanish ? 'Comenzar' : 'Start'}
            </Button>
          </div>
        );

      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">{labels.fullName}</Label>
                <Input
                  id="fullName"
                  value={basicInfo.fullName}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                  data-testid="input-full-name"
                  className="mt-1"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">{labels.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@email.com"
                  data-testid="input-email"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">{isSpanish ? 'Número de teléfono (opcional)' : 'Phone Number (optional)'}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  data-testid="input-phone"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="state">
                  {isSpanish ? 'Estado' : 'State'} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={basicInfo.state}
                  onValueChange={(value) => setBasicInfo(prev => ({ ...prev, state: value }))}
                >
                  <SelectTrigger id="state" className="mt-1" data-testid="select-state">
                    <SelectValue placeholder={isSpanish ? 'Seleccione un estado' : 'Select a state'} />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>

            <Button 
              onClick={handleBasicInfoNext} 
              disabled={!basicInfo.fullName || !basicInfo.email || !basicInfo.state} 
              className="w-full bg-black hover:bg-gray-800 text-white py-6"
              data-testid="button-continue"
            >
              {labels.continueButton}
            </Button>
          </div>
        );

      case 'role-selection':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <RadioGroup value={role} onValueChange={(value) => setRole(value as Role)} className="space-y-3">
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <RadioGroupItem value="beneficiary" id="beneficiary" className="mt-1" data-testid="radio-beneficiary" />
                  <Label htmlFor="beneficiary" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">
                      {isSpanish 
                        ? 'Soy la persona que está siendo patrocinada y estoy completando esta solicitud de cotización (beneficiario)' 
                        : 'I am the person being sponsored and I am filling out this quote request (beneficiary)'}
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <RadioGroupItem value="petitioner" id="petitioner" className="mt-1" data-testid="radio-petitioner" />
                  <Label htmlFor="petitioner" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900">
                      {isSpanish 
                        ? 'Soy la persona que está patrocinando y completando esta solicitud de cotización (peticionario)' 
                        : 'I am the person sponsoring and filling out this quote request (petitioner)'}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleRoleSelectionNext} 
              disabled={!role} 
              className="w-full bg-black hover:bg-gray-800 text-white py-6"
              data-testid="button-continue"
            >
              {labels.continueButton}
            </Button>
          </div>
        );

      case 'case-type':
        if (categoriesLoading) {
          return (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
              <p className="text-gray-600">{isSpanish ? 'Cargando opciones...' : 'Loading options...'}</p>
            </div>
          );
        }

        if (caseTypeOptions.length === 0) {
          return (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isSpanish ? 'No hay categorías disponibles' : 'No categories available'}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {isSpanish 
                    ? 'Actualmente no hay categorías de casos activas. Por favor, contacte a nuestro equipo para obtener asistencia.' 
                    : 'There are currently no active case categories. Please contact our team for assistance.'}
                </p>
              </div>
              <Button variant="outline" onClick={handleBack} className="w-full" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <RadioGroup value={caseType} onValueChange={(value) => setCaseType(value)} className="space-y-3">
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

            <Button 
              onClick={handleCaseTypeNext} 
              disabled={!caseType || isLoadingFlow} 
              className="w-full bg-black hover:bg-gray-800 text-white py-6"
              data-testid="button-continue"
            >
              {isLoadingFlow ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isSpanish ? 'Cargando...' : 'Loading...'}
                </>
              ) : (
                labels.continueButton
              )}
            </Button>
          </div>
        );

      case 'no-flow':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isSpanish 
                  ? 'No hay flujo de admisión disponible' 
                  : 'No intake flow available'}
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                {isSpanish 
                  ? 'Actualmente no hay un cuestionario configurado para esta categoría de caso. Por favor, contacte a nuestro equipo para obtener asistencia.' 
                  : 'There is currently no questionnaire configured for this case category. Please contact our team for assistance.'}
              </p>
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button onClick={handleClose} data-testid="button-close">
                {isSpanish ? 'Cerrar' : 'Close'}
              </Button>
            </div>
          </div>
        );

      case 'questionnaire':
        // Use database flow if available, otherwise fall back to legacy flow
        const isDbFlow = !!dbFlow;
        const dbCurrentNode = isDbFlow ? getDbCurrentNode() : null;
        const isDbEndNode = dbCurrentNode && ['completion', 'success', 'end'].includes(dbCurrentNode.type);
        
        return (
          <div className="space-y-6">
            {isDbFlow ? renderDbFlowQuestion() : renderQuestion()}
            
            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              {isDbFlow ? (
                isDbEndNode ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-submit"
                  >
                    {isSubmitting 
                      ? (isSpanish ? 'Enviando...' : 'Submitting...') 
                      : (isSpanish ? 'Enviar Solicitud' : 'Submit Request')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleDbFlowNext(
                      dbCurrentNode?.type === 'yes-no' ? yesNoValue : 
                      dbCurrentNode?.type === 'multiple-choice' ? choiceValue : 
                      undefined
                    )}
                    disabled={!canDbFlowProceed()}
                    data-testid="button-continue"
                  >
                    {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )
              ) : (
                <Button onClick={handleQuestionNext} disabled={!checkCurrentQuestionValid()} data-testid="button-continue">
                  {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
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

  const stepHeader = getStepHeader();
  const showBackButton = currentStep !== 'welcome';
  
  // Determine modal width based on step
  const getModalWidth = () => {
    // First 3 modals are 30% wider (max-w-xl instead of max-w-md)
    if (currentStep === 'welcome' || currentStep === 'basic-info' || currentStep === 'role-selection') {
      return 'max-w-xl';
    }
    // Case type modal is extra wide
    if (currentStep === 'case-type') {
      return 'max-w-4xl';
    }
    // Default width for questionnaire and wrap-up
    return 'max-w-md';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${getModalWidth()} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-shrink-0 pt-1 min-w-[80px]">
                {showBackButton && (
                  <Button 
                    variant="ghost" 
                    onClick={handleBack} 
                    className="p-0 h-auto hover:bg-transparent text-gray-600 hover:text-gray-900"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" /> 
                    {labels.backButton}
                  </Button>
                )}
              </div>
              <div className="flex-1 text-center">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {stepHeader.title}
                </DialogTitle>
                {stepHeader.subtitle && (
                  <DialogDescription className="text-gray-600 mt-2">
                    {stepHeader.subtitle}
                  </DialogDescription>
                )}
              </div>
              <div className="flex-shrink-0 min-w-[80px]">
                {/* Spacer to balance the back button and ensure title centering */}
              </div>
            </div>
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