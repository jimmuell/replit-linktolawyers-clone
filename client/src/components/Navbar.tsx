import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface NavbarProps {
  activeSection: string;
  scrollToSection: (section: string) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  hideUserDropdown?: boolean;
}

export default function Navbar({ activeSection, scrollToSection, setIsLoginModalOpen, hideUserDropdown = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={cn(
                "px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
                activeSection === 'how-it-works' && "bg-gray-100 text-gray-900"
              )}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={cn(
                "px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
                activeSection === 'about' && "bg-gray-100 text-gray-900"
              )}
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </button>
            <Link 
              href="/free-resources" 
              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 50);
              }}
            >
              Free resources
            </Link>
            <Link 
              href="/blog" 
              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 50);
              }}
            >
              Blog
            </Link>
            <Link 
              href="/help" 
              className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 50);
              }}
            >
              Help
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user && !hideUserDropdown ? (
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
                    <DropdownMenuItem onClick={() => window.location.href = '/admin-dashboard'}>
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
                variant="outline"
                className="border-gray-300 text-black bg-white hover:bg-gray-50 rounded-full px-6"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Sign In
              </Button>
            )}
            <Link href="/es" className="text-gray-700 hover:text-primary transition-colors">
              <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
                Español
              </Button>
            </Link>
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
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-3 space-y-3 bg-white border-t">
              <button
                onClick={() => {
                  scrollToSection('how-it-works');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
                  activeSection === 'how-it-works' && "bg-gray-100 text-gray-900"
                )}
              >
                How it works
              </button>
              <button
                onClick={() => {
                  scrollToSection('about');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors",
                  activeSection === 'about' && "bg-gray-100 text-gray-900"
                )}
              >
                About
              </button>
              <button 
                onClick={() => {
                  scrollToSection('contact');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </button>
              <Link 
                href="/free-resources" 
                className="block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 50);
                }}
              >
                Free resources
              </Link>
              <Link 
                href="/blog" 
                className="block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 50);
                }}
              >
                Blog
              </Link>
              <Link 
                href="/help" 
                className="block w-full text-left py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 50);
                }}
              >
                Help
              </Link>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-3"></div>
              
              <div className="space-y-3">
                {user && !hideUserDropdown ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-md">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 text-black bg-white hover:bg-gray-50 rounded-full"
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
                <Link href="/es" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800 rounded-full"
                  >
                    Español
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}