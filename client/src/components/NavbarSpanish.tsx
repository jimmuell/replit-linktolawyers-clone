import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface NavbarSpanishProps {
  activeSection: string;
  scrollToSection: (section: string) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  hideUserDropdown?: boolean;
}

export default function NavbarSpanish({ activeSection, scrollToSection, setIsLoginModalOpen, hideUserDropdown = false }: NavbarSpanishProps) {
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
              Cómo Funciona
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={cn(
                "text-gray-700 hover:text-primary transition-colors",
                activeSection === 'about' && "text-primary"
              )}
            >
              Acerca de
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Contáctanos
            </button>
            <Link href="/es/recursos-gratuitos" className="text-gray-700 hover:text-primary transition-colors">
              Recursos Gratuitos
            </Link>
            <Link href="/es/blog" className="text-gray-700 hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/es/ayuda" className="text-gray-700 hover:text-primary transition-colors">
              Ayuda
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6">
                English
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
                  "block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors",
                  activeSection === 'how-it-works' && "text-primary bg-gray-50"
                )}
              >
                Cómo Funciona
              </button>
              <button
                onClick={() => {
                  scrollToSection('about');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors",
                  activeSection === 'about' && "text-primary bg-gray-50"
                )}
              >
                Acerca de
              </button>
              <button
                onClick={() => {
                  scrollToSection('contact');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                Contáctanos
              </button>
              <Link 
                href="/es/recursos-gratuitos" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos Gratuitos
              </Link>
              <Link 
                href="/es/blog" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/es/ayuda" 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ayuda
              </Link>
              
              <div className="pt-3 border-t border-gray-200">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                    English
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