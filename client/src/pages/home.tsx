import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit3, CheckSquare, DollarSign, Handshake, ChevronUp, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoginModal from "@/components/LoginModal";
import HierarchicalCaseTypeSelect from "@/components/HierarchicalCaseTypeSelect";
import EmailPreviewModal from "@/components/EmailPreviewModal";
import { generateConfirmationEmail } from "@/lib/emailTemplates";
import Navbar from "@/components/Navbar";
import { Link } from "wouter";
import girlThinkingImage from "@assets/girl-final_1752714322954.png";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    caseType: '',
    email: '',
    phoneNumber: '',
    caseDescription: '',
    urgencyLevel: '',
    budgetRange: '',
    location: '',
    captcha: '',
    agreeToTerms: false
  });

  const [prefillChecked, setPrefillChecked] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [currentRequestNumber, setCurrentRequestNumber] = useState<string>('');
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string; text: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Fetch case types for dropdown
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const caseTypes = caseTypesData?.data || [];



  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'how-it-works', 'about'];
      const scrollPosition = window.scrollY + 100;

      // Show/hide scroll to top button
      setShowScrollToTop(window.scrollY > 300);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate request number when form opens
  const generateRequestNumber = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `lr-${randomNumber}`;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrefillToggle = (checked: boolean) => {
    setPrefillChecked(checked);
    if (checked) {
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        caseType: 'family-based-immigrant-visa-immediate-relative',
        email: 'john.doe@example.com',
        phoneNumber: '(555) 123-4567',
        caseDescription: 'I need assistance with filing a family-based immigrant visa petition for my spouse. We have been married for 2 years and have all the required documentation ready. Looking for guidance on the process and timeline.',
        urgencyLevel: 'moderate',
        budgetRange: '2500-5000',
        location: 'Los Angeles, CA',
        captcha: '4',
        agreeToTerms: false
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        caseType: '',
        email: '',
        phoneNumber: '',
        caseDescription: '',
        urgencyLevel: '',
        budgetRange: '',
        location: '',
        captcha: '',
        agreeToTerms: false
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous captcha error
    setCaptchaError(null);
    
    // Validate captcha
    if (formData.captcha !== '4') {
      setCaptchaError('Please solve the captcha correctly. 7 - 3 = ?');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/legal-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestNumber: currentRequestNumber
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmittedRequestNumber(result.data.requestNumber);
        
        // Generate email preview
        const selectedCaseType = caseTypes.find(ct => ct.value === formData.caseType);
        const emailTemplate = generateConfirmationEmail({
          ...formData,
          requestNumber: result.data.requestNumber
        }, selectedCaseType);
        
        setEmailPreview(emailTemplate);
        setIsEmailPreviewOpen(true);
      } else {
        alert('Error submitting request: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async (emailAddress: string) => {
    if (!emailPreview || !submittedRequestNumber) return;
    
    setIsSendingEmail(true);
    
    try {
      const response = await apiRequest(`/api/legal-requests/${submittedRequestNumber}/send-confirmation`, {
        method: 'POST',
        body: { 
          emailTemplate: emailPreview,
          overrideEmail: emailAddress 
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Email sent successfully!",
          description: `Confirmation email has been sent to ${emailAddress}`,
        });
        setIsEmailPreviewOpen(false);
      } else {
        toast({
          title: "Failed to send email",
          description: result.error || "An error occurred while sending the email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <Navbar 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
      <div className="min-h-screen bg-white w-full">

      {/* Hero Section */}
      <section id="home" className="bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-stretch min-h-[600px]">
            <div className="mb-8 lg:mb-0 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Find Your Immigration Attorney
                </h1>
                <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6 leading-relaxed">
                  Compare And Negotiate Legal Fees<br />
                  From Law Firms Nationwide
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 max-w-lg">
                  At LinkToLawyers, we bridge the gap between individuals seeking expert legal services and the professionals who can provide them by using our AI Powered Smart Matching Algorithm.
                </p>
                
                <p className="text-gray-600 mb-8 max-w-lg">
                  Our platform simplifies the process of finding and connecting with experienced lawyers, ensuring you receive the best legal support tailored to your unique situation, at an affordable price.
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 max-w-lg">
                  Take control of your legal expenses today. Compare quotes from multiple attorneys, negotiate fair pricing, and make confident decisions about your legal representation. Start your journey to affordable legal services now.
                </p>
              </div>
              
              <Button 
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg self-start"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Get A Free Legal Quote!
              </Button>
            </div>
            
            <div className="flex justify-center items-center">
              <img 
                src={girlThinkingImage} 
                alt="Free Legal Quotes - Professional woman thinking about legal options with thought bubbles showing Law Firm A ($1,200), Law Firm B ($1,750), and Law Firm C ($2,500) for Immigration Law, Personal Injury, Criminal Law, and Family Law services" 
                className="max-w-lg w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="text-justify">
            <p className="text-lg text-gray-700 leading-relaxed">
              Stop overspending for legal services. Finding the right attorney shouldn't be complicated or cost you an arm and a leg. We're here to help you make a smart choice and connect you with lawyers at a fair price. Our platform lets you compare fees and negotiate with top law firms locally and nationally. It's crucial to compare firms and costs before selecting an attorney. Comparing legal prices from multiple law firms is the best way to save. Compare attorney fees hassle-free and avoid unnecessary expenses. You're in control no consultations until you're prepared to move forward.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How LinkToLawyers Works</h2>
            <p className="text-lg text-gray-600">4 Simple Steps to Connect with Qualified Legal Experts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="step-icon">
                <Edit3 className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 1: Fill Out A Request</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                At LinkToLawyers, integrity is paramount. We guarantee that your information will never be sold to spammers, ensuring you won't receive any spam emails or unwanted phone calls. Rest assured, your privacy is fully protected with our completely confidential service. Your trust is important to us, and we are committed to maintaining the highest standards of security and privacy in all our interactions.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="step-icon">
                <CheckSquare className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 2: Real Choice</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                We are an impartial service that lets you compare prices from law firms across the nation. LinkToLawyers aggregates pricing information from law firms in every zip code and state. Using advanced AI technology, we analyze your needs to match you with suitable law firms across the U.S. Our mission is to ensure you get the best possible deal. Say goodbye to overpaying for legal services.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="step-icon">
                <DollarSign className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 3: Start Saving</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                We work with law firms of varying sizes to provide you with extensive options. Our comparison search engine simplifies finding the perfect attorney. Legal services can vary, so we recommend comparing several firms, at least 3-5. Our platform ensures competitive rates to help you find the best value. Note that the rates provided are for comparison purposes only.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="step-icon">
                <Handshake className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 4: Not Satisfied</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                At LinkToLawyers, we understand the importance of fair pricing for legal services. You shouldn't have to pay an arm and a leg for legal services. If you are not satisfied with your attorney's fees, feel free to negotiate a price that works best for you and fits comfortably within your budget. We strive to ensure you receive quality legal services at a price you can afford.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About LinkToLawyers</h2>
            <p className="text-lg text-gray-600 mb-8">Connecting You with Expert Legal Services</p>
            
            <div>
              <p className="text-gray-700 leading-relaxed text-justify">
                LinkToLawyers was created to empower consumers in making informed decisions when choosing an attorney, a decision that can profoundly impact your life. We prioritize educating consumers because we believe that a well-informed consumer is a satisfied one. By fostering working relationships with law firms of all sizes, we offer consumers a comprehensive range of options. Our AI powered comparative platform allows consumers to compare attorney fees nationwide, and to negotiate pricing with attorneys, ensuring they receive the best value. Our goal is to match consumers with an attorney who will passionately advocate for them, taking their unique needs into account, and receive the most competitive pricing.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Introduction */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "At LinkToLawyers, our mission is to simplify the process of securing reliable and experienced legal assistance. We are dedicated to bridging the gap between individuals in need of legal support and the professionals who can provide it."
              </p>
            </div>
            
            {/* Our Mission */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "Our mission is to streamline the connection between individuals seeking legal services and qualified legal professionals. We aim to make legal assistance accessible, efficient, and tailored to each user's specific needs."
              </p>
            </div>
            
            {/* Our Vision */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "We envision a world where everyone has access to expert legal assistance, regardless of their location or background. By leveraging technology, we strive to create a platform that empowers individuals to navigate the complexities of law with confidence."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">LinkToLawyers</h3>
              <p className="text-gray-600 text-sm">© 2024 LinkToLawyers</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Legal Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Attorney Directory</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Legal Articles</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="mailto:info@linktolawyers.com" className="hover:text-primary transition-colors">info@linktolawyers.com</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Live Chat</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              LinkToLawyers connects clients with qualified attorneys nationwide. We are not a law firm and do not provide legal advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Free Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={(open) => {
        setIsQuoteModalOpen(open);
        if (open && !currentRequestNumber) {
          setCurrentRequestNumber(generateRequestNumber());
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              Request Your Free Quote
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Tell us about your immigration case and get personalized quotes from qualified attorneys
            </DialogDescription>
          </DialogHeader>
          
          {currentRequestNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Legal Request Number:</span>
                <span className="text-sm font-mono font-bold text-blue-900">{currentRequestNumber}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                This number will be assigned to your request upon submission
              </p>
            </div>
          )}
          
          {!submittedRequestNumber && (
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="prefill"
                checked={prefillChecked}
                onCheckedChange={handlePrefillToggle}
              />
              <Label htmlFor="prefill" className="text-sm font-medium">
                Prefill form with sample data
              </Label>
            </div>
          )}

          {submittedRequestNumber ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Request Submitted Successfully!
                </h3>
                <p className="text-green-700 mb-3">
                  Your legal request has been submitted and assigned the following number:
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3 inline-block">
                  <span className="text-xl font-mono font-bold text-green-800">
                    {submittedRequestNumber}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-3">
                  Please save this number for your records.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    📧 <strong>Confirmation email sent!</strong> Please check your email inbox and spam/junk folders for the confirmation details.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSubmittedRequestNumber(null);
                  setIsQuoteModalOpen(false);
                  setIsEmailPreviewOpen(false);
                  setEmailPreview(null);
                  // Reset form
                  setFormData({
                    firstName: '',
                    lastName: '',
                    caseType: '',
                    email: '',
                    phoneNumber: '',
                    caseDescription: '',
                    urgencyLevel: '',
                    budgetRange: '',
                    location: '',
                    captcha: '',
                    agreeToTerms: false
                  });
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <HierarchicalCaseTypeSelect
                caseTypes={caseTypes}
                value={formData.caseType}
                onValueChange={(value) => handleInputChange('caseType', value)}
                loading={caseTypesLoading}
                placeholder="Choose case type..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="caseDescription">Case Description</Label>
              <Textarea
                id="caseDescription"
                placeholder="Please describe your immigration situation, including any specific circumstances, deadlines, or concerns you have..."
                value={formData.caseDescription}
                onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Urgency Level</Label>
                <RadioGroup value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-urgent" id="not-urgent" />
                    <Label htmlFor="not-urgent">Not urgent (6+ months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderate (3-6 months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Urgent (1-3 months)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate">Immediate (less than 1 month)</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1000">Under $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="over-10000">Over $10,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Your Location (City, State)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Los Angeles, CA"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="captcha">Verify you are human</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-mono bg-gray-100 px-3 py-2 rounded border">7 - 3 = ?</span>
                  <Input
                    id="captcha"
                    placeholder="Answer"
                    value={formData.captcha}
                    onChange={(e) => {
                      handleInputChange('captcha', e.target.value);
                      // Clear error when user starts typing
                      if (captchaError) {
                        setCaptchaError(null);
                      }
                    }}
                    className={`w-20 ${captchaError ? 'border-red-500' : formData.captcha === '4' ? 'border-green-500' : ''}`}
                    required
                  />
                  {formData.captcha === '4' && (
                    <span className="text-green-600 font-medium">Correct!</span>
                  )}
                </div>
                {captchaError && (
                  <p className="text-red-500 text-sm mt-1">{captchaError}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>
                    By clicking Submit you agree to share your information with a law firm and consent to be contacted by them. You will 
                    be matched with a firm closest to your zip code. Certain inquiries may require a manual review in which we will contact 
                    you prior to matching with a law firm. Your information will not be treated as confidential nor will it create an attorney-
                    client relationship. You agree to our <a href="#" className="text-blue-600 hover:underline">terms and conditions</a> and 
                    our <a href="#" className="text-blue-600 hover:underline">privacy policy</a>.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-md"
              disabled={!formData.agreeToTerms || isSubmitting || formData.captcha !== '4'}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        emailPreview={emailPreview}
        recipientEmail={formData.email}
        onSendEmail={handleSendEmail}
        isSending={isSendingEmail}
      />

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
      </div>
    </>
  );
}
