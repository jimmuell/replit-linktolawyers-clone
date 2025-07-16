import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Download, FileText, Video, Users, Menu, X, ChevronDown, Settings, Home, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import { Link } from "wouter";

export default function FreeResources() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const resources = [
    {
      title: "Immigration Law Guide",
      description: "Comprehensive guide covering the basics of U.S. immigration law",
      type: "PDF",
      size: "2.3 MB",
      downloads: 1247,
      category: "Legal Guides"
    },
    {
      title: "Visa Application Checklist",
      description: "Step-by-step checklist for common visa applications",
      type: "PDF",
      size: "1.1 MB",
      downloads: 892,
      category: "Checklists"
    },
    {
      title: "Understanding Your Rights",
      description: "Know your rights during immigration proceedings",
      type: "PDF",
      size: "1.8 MB",
      downloads: 675,
      category: "Legal Guides"
    },
    {
      title: "Immigration Process Timeline",
      description: "Visual timeline of common immigration processes",
      type: "PDF",
      size: "950 KB",
      downloads: 543,
      category: "Infographics"
    },
    {
      title: "Legal Terms Glossary",
      description: "Common legal terms explained in simple language",
      type: "PDF",
      size: "1.5 MB",
      downloads: 432,
      category: "Reference"
    },
    {
      title: "Family-Based Immigration",
      description: "Guide to family-based immigration petitions",
      type: "PDF",
      size: "2.1 MB",
      downloads: 387,
      category: "Legal Guides"
    }
  ];

  const webinars = [
    {
      title: "Immigration Law Basics",
      description: "60-minute webinar covering immigration fundamentals",
      duration: "60 min",
      views: 2340,
      category: "Educational"
    },
    {
      title: "Preparing for Your Interview",
      description: "Tips and strategies for immigration interviews",
      duration: "45 min",
      views: 1890,
      category: "Preparation"
    },
    {
      title: "Common Application Mistakes",
      description: "Avoid these frequent errors in your application",
      duration: "30 min",
      views: 1456,
      category: "Tips"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                LinkToLawyers
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Home
              </Link>
              
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
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Dashboard</Link>
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
                <Button onClick={() => setIsLoginModalOpen(true)}>
                  Sign In
                </Button>
              )}
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
                <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                  Back to Home
                </Link>
                {user ? (
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center space-x-2">
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
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="mx-3"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Free Immigration Resources</h1>
            <p className="text-xl text-blue-100 mb-8">
              Access our comprehensive collection of guides, checklists, and educational materials
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                <FileText className="w-4 h-4 mr-1" />
                Legal Guides
              </Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                <BookOpen className="w-4 h-4 mr-1" />
                Checklists
              </Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                <Video className="w-4 h-4 mr-1" />
                Webinars
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Downloads Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Download Resources</h2>
            <p className="text-lg text-gray-600">
              Free guides, checklists, and reference materials to help you navigate immigration law
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{resource.category}</Badge>
                    <div className="text-sm text-gray-500">{resource.type} • {resource.size}</div>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <Download className="w-4 h-4 inline mr-1" />
                      {resource.downloads.toLocaleString()} downloads
                    </div>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Webinars Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Educational Webinars</h2>
            <p className="text-lg text-gray-600">
              Learn from immigration law experts through our recorded webinar series
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{webinar.category}</Badge>
                    <div className="text-sm text-gray-500">{webinar.duration}</div>
                  </div>
                  <CardTitle className="text-lg">{webinar.title}</CardTitle>
                  <CardDescription>{webinar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <Users className="w-4 h-4 inline mr-1" />
                      {webinar.views.toLocaleString()} views
                    </div>
                    <Button size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Personalized Legal Help?</h2>
          <p className="text-lg text-gray-600 mb-6">
            While these resources are helpful, every case is unique. Connect with qualified immigration attorneys for personalized advice.
          </p>
          <Link href="/">
            <Button size="lg">
              Find an Attorney
            </Button>
          </Link>
        </section>
      </div>

      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}