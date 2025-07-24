import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Menu, X, ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Help() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Contact form submitted:', contactForm);
  };

  const faqs = [
    {
      question: "How do I find the right attorney for my case?",
      answer: "Our smart matching system analyzes your specific legal needs, location, and preferences to connect you with qualified immigration attorneys. Simply fill out our questionnaire, and we'll provide you with a curated list of attorneys who specialize in your type of case."
    },
    {
      question: "How much does it cost to use LinkToLawyers?",
      answer: "LinkToLawyers is free for clients. We connect you with attorneys at no cost. You only pay the attorney directly for their legal services. Our platform helps you compare rates and find transparent pricing."
    },
    {
      question: "Are all attorneys on your platform licensed?",
      answer: "Yes, all attorneys on LinkToLawyers are licensed and verified. We conduct thorough background checks and verify licensing status with state bar associations before approving any attorney to join our platform."
    },
    {
      question: "What types of immigration cases do you handle?",
      answer: "Our network includes attorneys who handle all types of immigration cases including family-based immigration, employment-based visas, asylum cases, naturalization, deportation defense, and more. We'll match you with attorneys who specialize in your specific case type."
    },
    {
      question: "How quickly can I get connected with an attorney?",
      answer: "Most clients receive attorney matches within 24 hours. Once you submit your information, our system immediately begins matching you with suitable attorneys. You can then schedule consultations directly through our platform."
    },
    {
      question: "Can I get a second opinion on my case?",
      answer: "Absolutely! You can request consultations with multiple attorneys through our platform. Getting a second opinion is often valuable, especially for complex cases. Our attorneys understand this and are happy to provide their professional assessment."
    },
    {
      question: "What if I'm not satisfied with the attorney I was matched with?",
      answer: "If you're not satisfied with your attorney match, you can request new matches at any time. Our platform is designed to help you find the right legal representation, and we'll work with you until you find an attorney you're comfortable with."
    },
    {
      question: "Do you offer services in languages other than English?",
      answer: "Yes, many attorneys in our network speak multiple languages. During the matching process, you can specify your preferred language, and we'll prioritize attorneys who can communicate with you in your preferred language."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-black">
                LinkToLawyers
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 50);
                }}
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="block px-3 py-2 text-gray-600 hover:text-black"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }, 50);
                  }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
            <p className="text-xl text-gray-300 mb-8">
              Find answers to your questions or get in touch with our support team
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search help articles..."
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Help Options */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help You?</h2>
            <p className="text-lg text-gray-600">
              Choose the best way to get the support you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Chat with our support team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Available 24/7
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>
                  Speak directly with a support representative
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Mon-Fri 9AM-6PM EST
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us a detailed message about your issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Response within 24 hours
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Find quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-black mr-3 flex-shrink-0" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">
              Can't find what you're looking for? Send us a message
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={contactForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Question</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="attorney">Attorney Match Issue</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="text-center bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Explore our resources or connect with our community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-resources">
              <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white">
                View Free Resources
              </Button>
            </Link>
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Join Community Forum
            </Button>
          </div>
        </section>
      </div>

    </div>
  );
}