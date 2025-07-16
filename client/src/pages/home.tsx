import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, CheckSquare, DollarSign, Handshake, Menu, X, ChevronDown, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import { Link } from "wouter";
import girlThinkingImage from "@assets/thinking_girl_ai_3_1752707368242.png";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    category: '',
    nationality: '',
    email: '',
    zipCode: '',
    legalNeed: '',
    agreeToTerms: false
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'how-it-works', 'about'];
      const scrollPosition = window.scrollY + 100;

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsQuoteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  activeSection === 'how-it-works' && "text-primary"
                )}
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  activeSection === 'about' && "text-primary"
                )}
              >
                About
              </button>
              <button className="text-gray-700 hover:text-primary transition-colors">
                Contact Us
              </button>
              <Link href="/free-resources" className="text-gray-700 hover:text-primary transition-colors">
                Free resources
              </Link>
              <button className="text-gray-700 hover:text-primary transition-colors">
                Blog
              </button>
              <Link href="/help" className="text-gray-700 hover:text-primary transition-colors">
                Help
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.firstName} {user.lastName}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Sign In
                </Button>
              )}
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6">
                Español
              </Button>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-700 hover:text-primary transition-colors text-left"
                >
                  How it works
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-gray-700 hover:text-primary transition-colors text-left"
                >
                  About
                </button>
                <button className="text-gray-700 hover:text-primary transition-colors text-left">
                  Contact Us
                </button>
                <Link href="/free-resources" className="text-gray-700 hover:text-primary transition-colors text-left">
                  Free resources
                </Link>
                <button className="text-gray-700 hover:text-primary transition-colors text-left">
                  Blog
                </button>
                <Link href="/help" className="text-gray-700 hover:text-primary transition-colors text-left">
                  Help
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  {user ? (
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.firstName} {user.lastName}</span>
                      <Button variant="ghost" size="sm" onClick={() => logout()}>
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="bg-black text-white hover:bg-gray-800 rounded-full"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Sign In
                    </Button>
                  )}
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                    Español
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-8 lg:mb-0">
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
              
              <Button 
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg"
                onClick={() => setIsQuoteModalOpen(true)}
              >
                Get A Free Legal Quote!
              </Button>
            </div>
            
            <div className="flex justify-center">
              <img 
                src={girlThinkingImage} 
                alt="Free Legal Quotes - Professional woman thinking about legal options with thought bubbles showing Law Firm A ($1,200), Law Firm B ($1,750), and Law Firm C ($2,500) for Immigration Law, Personal Injury, Criminal Law, and Family Law services" 
                className="max-w-md w-full h-auto border-5 border-gray-300" 
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
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              Receive a <span className="font-bold">FREE</span> quote! Please fill out the form below and submit it.
            </DialogTitle>
          </DialogHeader>
          
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immigration">Immigration Law</SelectItem>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="criminal">Criminal Law</SelectItem>
                    <SelectItem value="business">Business Law</SelectItem>
                    <SelectItem value="personal-injury">Personal Injury</SelectItem>
                    <SelectItem value="estate">Estate Planning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose nationality..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="mx">Mexico</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="co">Colombia</SelectItem>
                    <SelectItem value="ve">Venezuela</SelectItem>
                    <SelectItem value="ar">Argentina</SelectItem>
                    <SelectItem value="br">Brazil</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="99999"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="legalNeed">Please describe your legal need</Label>
              <Textarea
                id="legalNeed"
                placeholder="Type your message here..."
                value={formData.legalNeed}
                onChange={(e) => handleInputChange('legalNeed', e.target.value)}
                rows={4}
                required
              />
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
              disabled={!formData.agreeToTerms}
            >
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
