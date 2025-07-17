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
}

export default function Navbar({ activeSection, scrollToSection, setIsLoginModalOpen }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm border-b border-gray-200">
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => {
                  scrollToSection('how-it-works');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors text-left",
                  activeSection === 'how-it-works' && "text-primary"
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
                  "text-gray-700 hover:text-primary transition-colors text-left",
                  activeSection === 'about' && "text-primary"
                )}
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
  );
}