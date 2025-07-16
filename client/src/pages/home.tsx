import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit3, CheckSquare, DollarSign, Handshake, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('home')}
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  activeSection === 'home' && "text-primary"
                )}
              >
                Home
              </button>
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
              <button className="text-gray-700 hover:text-primary transition-colors">
                Blog
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
                Free Quote
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6">
                For Attorneys
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
                  onClick={() => scrollToSection('home')}
                  className="text-gray-700 hover:text-primary transition-colors text-left"
                >
                  Home
                </button>
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
                <button className="text-gray-700 hover:text-primary transition-colors text-left">
                  Blog
                </button>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button className="bg-black text-white hover:bg-gray-800 rounded-full">
                    Free Quote
                  </Button>
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                    For Attorneys
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
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your Attorney<br />
                Compare And Negotiate<br />
                Legal Fees From Law<br />
                Firms Nationwide
              </h1>
              
              <p className="text-lg text-gray-600 mb-6 max-w-lg">
                At LinkToLawyers, we bridge the gap between individuals seeking expert legal services and the professionals who can provide them by using our AI Powered Smart Matching Algorithm.
              </p>
              
              <p className="text-gray-600 mb-8 max-w-lg">
                Our platform simplifies the process of finding and connecting with experienced lawyers, ensuring you receive the best legal support tailored to your unique situation, at an affordable price.
              </p>
              
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg">
                Get A Free Legal Quote!
              </Button>
            </div>
            
            <div className="bg-gray-100 rounded-2xl p-8 relative">
              <div className="flex justify-center">
                <img 
                  src="/attached_assets/girl-thinking.jpg" 
                  alt="Free Legal Quotes - Professional woman thinking about legal options with thought bubbles showing Law Firm A ($4,000), Law Firm B ($6,500), and Law Firm C ($5,500) for Immigration Law, Personal Injury, Criminal Law, and Family Law services" 
                  className="rounded-xl max-w-full h-auto" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
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
              <p className="text-gray-600 text-sm leading-relaxed">
                At LinkToLawyers, integrity is paramount. We guarantee that your information will never be sold to spammers, ensuring you won't receive any spam emails or unwanted phone calls. Rest assured, your privacy is fully protected with our completely confidential service. Your trust is important to us, and we are committed to maintaining the highest standards of security and privacy in all our interactions.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="step-icon">
                <CheckSquare className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 2: Real Choice</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We are an impartial service that lets you compare prices from law firms across the nation. LinkToLawyers aggregates pricing information from law firms in every zip code and state. Using advanced AI technology, we analyze your needs to match you with suitable law firms across the U.S. Our mission is to ensure you get the best possible deal. Say goodbye to overpaying for legal services.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="step-icon">
                <DollarSign className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 3: Start Saving</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We work with law firms of varying sizes to provide you with extensive options. Our comparison search engine simplifies finding the perfect attorney. Legal services can vary, so we recommend comparing several firms, at least 3-5. Our platform ensures competitive rates to help you find the best value. Note that the rates provided are for comparison purposes only.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="step-icon">
                <Handshake className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Step 4: Not Satisfied</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                At LinkToLawyers, we understand the importance of fair pricing for legal services. You shouldn't have to pay an arm and a leg for legal services. If you are not satisfied with your attorney's fees, feel free to negotiate a price that works best for you and fits comfortably within your budget. We strive to ensure you receive quality legal services at a price you can afford.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About LinkToLawyers</h2>
            <p className="text-lg text-gray-600 mb-8">Connecting You with Expert Legal Services</p>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 leading-relaxed">
                LinkToLawyers was created to empower consumers in making informed decisions when choosing an attorney, a decision that can profoundly impact your life. We prioritize educating consumers because we believe that a well-informed consumer is a satisfied one. By fostering working relationships with law firms of all sizes, we offer consumers a comprehensive range of options. Our AI powered comparative platform allows consumers to compare attorney fees nationwide, and to negotiate pricing with attorneys, ensuring they receive the best value. Our goal is to match consumers with an attorney who will passionately advocate for them, taking their unique needs into account, and receive the most competitive pricing.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Introduction */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h3>
              <p className="text-gray-600 leading-relaxed">
                "At LinkToLawyers, our mission is to simplify the process of securing reliable and experienced legal assistance. We are dedicated to bridging the gap between individuals in need of legal support and the professionals who can provide it."
              </p>
            </div>
            
            {/* Our Mission */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                "Our mission is to streamline the connection between individuals seeking legal services and qualified legal professionals. We aim to make legal assistance accessible, efficient, and tailored to each user's specific needs."
              </p>
            </div>
            
            {/* Our Vision */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
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
    </div>
  );
}
