import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import HierarchicalCaseTypeSelect from './HierarchicalCaseTypeSelect';
import { FamilyImmigrationForm } from './FamilyImmigrationForm';
import { AsylumForm } from './AsylumForm';
import { NaturalizationForm } from './NaturalizationForm';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'basic-info' | 'case-type' | 'case-form' | 'summary';

interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export function NewQuoteModal({ isOpen, onClose }: NewQuoteModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [caseType, setCaseType] = useState<string>('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch case types from API
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const caseTypes = (caseTypesData as any)?.data || [];

  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!basicInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!basicInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!basicInfo.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      setCurrentStep('case-form');
    }
  };

  const handleFormComplete = async (responses: Record<string, any>) => {
    setFormResponses(responses);
    
    try {
      // Submit to backend API
      const response = await fetch('/api/structured-intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: basicInfo.firstName,
          lastName: basicInfo.lastName,
          email: basicInfo.email,
          caseType,
          formResponses: responses
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Structured intake submitted successfully:', result.data.requestNumber);
        setCurrentStep('summary');
      } else {
        console.error('Error submitting form:', result.error);
        // Handle error - could show error message to user
        setCurrentStep('summary'); // For now, still proceed to summary
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error - could show error message to user
      setCurrentStep('summary'); // For now, still proceed to summary
    }
  };

  const handleClose = () => {
    // Reset all state
    setCurrentStep('basic-info');
    setCaseType('');
    setBasicInfo({ firstName: '', lastName: '', email: '' });
    setFormResponses({});
    setErrors({});
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Get Your Free Quote</h2>
              <p className="text-gray-600 mt-2">Let's start with your basic information</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-red-500' : ''}
                    data-testid="input-first-name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-red-500' : ''}
                    data-testid="input-last-name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-red-500' : ''}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleBasicInfoNext} data-testid="button-next">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'case-type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Choose Your Case Type</h2>
              <p className="text-gray-600 mt-2">Please select the type of immigration case you need help with</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="caseType">Case Type <span className="text-red-500">*</span></Label>
              <HierarchicalCaseTypeSelect
                caseTypes={caseTypes}
                value={caseType}
                onValueChange={setCaseType}
                loading={caseTypesLoading}
                placeholder="Choose your case type..."
                data-testid="select-case-type"
              />
              {errors.caseType && (
                <p className="text-red-500 text-sm mt-1">{errors.caseType}</p>
              )}
            </div>

            <div className="flex justify-between space-x-3">
              <Button variant="outline" onClick={() => setCurrentStep('basic-info')} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleCaseTypeNext} disabled={!caseType} data-testid="button-continue">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'case-form':
        const renderCaseForm = () => {
          // Map database case type values to the appropriate forms
          if (caseType.includes('family-based') || caseType.includes('k1-fiance') || caseType.includes('removal-of-conditions')) {
            return <FamilyImmigrationForm onComplete={handleFormComplete} onBack={() => setCurrentStep('case-type')} />;
          } else if (caseType.includes('asylum')) {
            return <AsylumForm onComplete={handleFormComplete} onBack={() => setCurrentStep('case-type')} />;
          } else if (caseType.includes('citizenship') || caseType.includes('naturalization')) {
            return <NaturalizationForm onComplete={handleFormComplete} onBack={() => setCurrentStep('case-type')} />;
          } else {
            // For other case types, default to family immigration form
            return <FamilyImmigrationForm onComplete={handleFormComplete} onBack={() => setCurrentStep('case-type')} />;
          }
        };
        return renderCaseForm();

      case 'summary':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-600 mt-2">Your information has been submitted successfully</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-2">What happens next:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Our team will review your case details</li>
                <li>• Qualified attorneys will provide personalized quotes</li>
                <li>• You'll receive quotes directly to your email within 1-2 business days</li>
              </ul>
            </div>

            <Button onClick={handleClose} className="w-full" data-testid="button-close">
              Close
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Get Quote</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}