import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, Mail, Clock, DollarSign, Star, X } from 'lucide-react';

interface WorkflowTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WorkflowStep = 'loading' | 'quotes' | 'confirmation' | 'final';

interface Attorney {
  id: number;
  name: string;
  firm: string;
  location: string;
  experience: string;
  rating: number;
  reviews: number;
  price: number;
  hourlyRate: number;
  timeline: string;
  description: string;
  specialties: string[];
  included: string[];
  isSelected: boolean;
}

const mockAttorneys: Attorney[] = [
  {
    id: 1,
    name: 'Michael Rodriguez',
    firm: 'Rodriguez Legal Group',
    location: 'Los Angeles, CA',
    experience: '12+ years',
    rating: 5,
    reviews: 30,
    price: 5950,
    hourlyRate: 595,
    timeline: '2-4 weeks',
    description: 'With 12 years of experience in immigration law, I\'m committed to providing you with expert legal representation tailored to your specific needs.',
    specialties: ['Immigration Law', 'Deportation Defense', 'Asylum Cases'],
    included: [
      'Initial consultation and case assessment',
      'Legal strategy development',
      'Document preparation and review',
      'Filing of all necessary forms',
      'Regular case updates and communication'
    ],
    isSelected: false
  },
  {
    id: 2,
    name: 'Jennifer Kim',
    firm: 'Kim Legal Group',
    location: 'Los Angeles, CA',
    experience: '6+ years',
    rating: 5,
    reviews: 15,
    price: 3850,
    hourlyRate: 385,
    timeline: '2-4 weeks',
    description: 'With 6 years of experience in immigration law, I\'m committed to providing you with expert legal representation tailored to your specific needs.',
    specialties: ['Family & Immigration Law', 'Employment-Based Immigration', 'Student Visas'],
    included: [
      'Initial consultation and case assessment',
      'Legal strategy development',
      'Document preparation and review',
      'Filing of all necessary forms',
      'Regular case updates and communication'
    ],
    isSelected: false
  },
  {
    id: 3,
    name: 'David Thompson',
    firm: 'Thompson Immigration Services',
    location: 'Los Angeles, CA',
    experience: '15+ years',
    rating: 5,
    reviews: 37,
    price: 7000,
    hourlyRate: 700,
    timeline: '2-4 weeks',
    description: 'With 15 years of experience in immigration law, I\'m committed to providing you with expert legal representation tailored to your specific needs.',
    specialties: ['Business Immigration', 'Investment Visas', 'Corporate Compliance'],
    included: [
      'Initial consultation and case assessment',
      'Legal strategy development',
      'Document preparation and review',
      'Filing of all necessary forms',
      'Regular case updates and communication'
    ],
    isSelected: false
  }
];

export default function WorkflowTestModal({ isOpen, onClose }: WorkflowTestModalProps) {
  const [step, setStep] = useState<WorkflowStep>('loading');
  const [attorneys, setAttorneys] = useState<Attorney[]>(mockAttorneys);
  const [selectedAttorneys, setSelectedAttorneys] = useState<Attorney[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('loading');
      setAttorneys(mockAttorneys.map(attorney => ({ ...attorney, isSelected: false })));
      setSelectedAttorneys([]);
      setShowEmailModal(false);
      setShowFinalModal(false);
      
      // Show loading for 4 seconds, then show quotes
      const timer = setTimeout(() => {
        setStep('quotes');
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAttorneySelect = (attorneyId: number) => {
    setAttorneys(prev => 
      prev.map(attorney => 
        attorney.id === attorneyId 
          ? { ...attorney, isSelected: !attorney.isSelected }
          : attorney
      )
    );
  };

  const handleConnectWithAttorneys = () => {
    const selected = attorneys.filter(attorney => attorney.isSelected);
    setSelectedAttorneys(selected);
    setShowEmailModal(true);
  };

  const handleEmailConfirm = () => {
    setShowEmailModal(false);
    setStep('confirmation');
  };

  const handleExitConfirmation = () => {
    setShowFinalModal(true);
  };

  const handleFinalExit = () => {
    setShowFinalModal(false);
    onClose();
  };

  const selectedCount = attorneys.filter(attorney => attorney.isSelected).length;

  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Hang tight — we're finding attorneys who can help!
      </h2>
      <p className="text-gray-600 mb-8">Analyzing your case requirements...</p>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );

  const QuotesScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <button 
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Your Attorney Quotes</h1>
        <div className="text-gray-500 text-sm">{attorneys.length} quotes found</div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Quote Summary for John Smith</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Case Type:</span> family-based-immigrant-visa-immediate-relative
          </div>
          <div>
            <span className="font-medium">Timeline:</span> 3-6 months
          </div>
          <div>
            <span className="font-medium">Budget:</span> 5k-10k
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Review the quotes below and select the attorneys you'd like to connect with. Selected attorneys will be notified of your 
          interest and will contact you directly to schedule consultations.
        </p>
      </div>

      <div className="space-y-4">
        {attorneys.map((attorney) => (
          <div 
            key={attorney.id} 
            className={`border rounded-lg p-6 ${attorney.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={attorney.isSelected}
                  onCheckedChange={() => handleAttorneySelect(attorney.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{attorney.name}</h3>
                    {attorney.isSelected && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{attorney.firm}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>{attorney.location}</span>
                    <span>{attorney.experience}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{attorney.rating} ({attorney.reviews} reviews)</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{attorney.description}</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        Timeline
                      </div>
                      <p className="text-sm text-gray-900">{attorney.timeline}</p>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {attorney.specialties.map((specialty, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Payment Options
                      </div>
                      <div className="text-sm text-gray-900 mb-1">Hourly • Flat Fee</div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">What's Included</p>
                        <ul className="space-y-1">
                          {attorney.included.map((item, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center">
                              <Check className="w-3 h-3 text-green-500 mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">${attorney.price.toLocaleString()}</div>
                <div className="text-sm text-gray-500">${attorney.hourlyRate}/hour</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="sticky bottom-0 bg-white border-t p-4">
          <Button 
            onClick={handleConnectWithAttorneys}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            Connect with {selectedCount} Attorney{selectedCount > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );

  const ConfirmationScreen = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <button 
          onClick={() => setStep('quotes')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Quote Confirmation</h1>
        <div className="text-gray-400 text-sm">07/21/2025</div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-green-800">Attorneys Notified!</h3>
        </div>
        <p className="text-green-700 mb-3">Your quote request has been sent to your selected attorneys.</p>
        <div className="bg-green-100 border border-green-200 rounded p-3">
          <div className="flex items-center text-sm text-green-800">
            <Mail className="w-4 h-4 mr-2" />
            <span className="font-medium">Email sent.</span>
            <span className="ml-1">
              We've also sent a confirmation email to john.smith@example.com with a direct link to track your 
              request status. Please check your spam or junk folder if you don't see it in your inbox.
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium text-gray-600">Quote Number:</p>
          <p className="text-lg font-mono font-bold">QN908951</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Case Type:</p>
          <p className="text-gray-900">Family Immigration</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Client:</p>
          <p className="text-gray-900">Client</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">Email:</p>
          <p className="text-gray-900">client@example.com</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <div className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
            {selectedAttorneys.length}
          </div>
          <h3 className="font-semibold text-gray-900">Connected Attorneys ({selectedAttorneys.length})</h3>
        </div>
        
        <div className="space-y-4">
          {selectedAttorneys.map((attorney) => (
            <div key={attorney.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{attorney.name}</h4>
                  <p className="text-sm text-gray-600">{attorney.firm}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{attorney.rating} • {attorney.experience}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">${attorney.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{attorney.timeline}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded p-3">
        <p className="text-sm font-medium text-green-800">Emails Sent Successfully!</p>
        <p className="text-sm text-green-700">Confirmation emails have been sent to {selectedAttorneys.length} attorney(s).</p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleExitConfirmation}
          className="bg-black hover:bg-gray-800 text-white px-8"
        >
          Exit Confirmation
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            {step === 'loading' && <LoadingScreen />}
            {step === 'quotes' && <QuotesScreen />}
            {step === 'confirmation' && <ConfirmationScreen />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Confirmation Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmation Email Sent!</h3>
            <p className="text-sm text-gray-600 mb-2">
              We've sent you a confirmation email with all the details about your selected attorneys.
            </p>
            <p className="text-sm text-orange-600 mb-4">
              Please check your spam or junk folder if you don't see the email in your inbox.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              The selected attorneys have also been notified and will contact you directly within 24 hours.
            </p>
            
            <Button 
              onClick={handleEmailConfirm}
              className="bg-black hover:bg-gray-800 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Exit Confirmation Modal */}
      <Dialog open={showFinalModal} onOpenChange={setShowFinalModal}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exit Confirmation</h3>
            <p className="text-sm text-gray-600 mb-4">
              To track your quote request later, use the quote number shown below, or in the confirmation email.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-2xl font-mono font-bold text-gray-900">QN908951</div>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              On the home page, click the "Track Request" button and enter this quote number to view the status of your request and any attorney responses.
            </p>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowFinalModal(false)}
                className="flex-1"
              >
                Stay on Page
              </Button>
              <Button 
                onClick={handleFinalExit}
                className="flex-1 bg-black hover:bg-gray-800 text-white"
              >
                Exit to Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}