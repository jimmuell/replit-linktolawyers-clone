import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface NavbarSpanishProps {
  activeSection: string;
  scrollToSection: (section: string) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  hideUserDropdown?: boolean;
}

export default function NavbarSpanish({ 
  activeSection, 
  scrollToSection, 
  setIsLoginModalOpen, 
  hideUserDropdown = false 
}: NavbarSpanishProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const handleLogout = async () => {
    await logout();
    setIsUserDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              LinkToLawyers
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className={`text-gray-700 hover:text-gray-900 transition-colors ${
                activeSection === 'home' ? 'text-gray-900 font-semibold' : ''
              }`}
            >
              Inicio
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('how-it-works');
              }}
              className={`text-gray-700 hover:text-gray-900 transition-colors ${
                activeSection === 'how-it-works' ? 'text-gray-900 font-semibold' : ''
              }`}
            >
              Cómo Funciona
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className={`text-gray-700 hover:text-gray-900 transition-colors ${
                activeSection === 'about' ? 'text-gray-900 font-semibold' : ''
              }`}
            >
              Acerca de
            </a>
            <Link
              href="/recursos-gratuitos"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Recursos Gratuitos
            </Link>
            <Link
              href="/ayuda"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Ayuda
            </Link>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Blog
            </Link>
            
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = 'https://linkto-lawyers.com'}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              English
            </Button>

            {/* User Authentication */}
            {!hideUserDropdown && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <User size={20} />
                      <span>{user.firstName}</span>
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          href="/admin-dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Panel de Administración
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut size={16} className="mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Iniciar Sesión
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('home');
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md ${
                  activeSection === 'home' ? 'text-gray-900 bg-gray-50' : ''
                }`}
              >
                Inicio
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('how-it-works');
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md ${
                  activeSection === 'how-it-works' ? 'text-gray-900 bg-gray-50' : ''
                }`}
              >
                Cómo Funciona
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md ${
                  activeSection === 'about' ? 'text-gray-900 bg-gray-50' : ''
                }`}
              >
                Acerca de
              </a>
              <Link
                href="/recursos-gratuitos"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos Gratuitos
              </Link>
              <Link
                href="/ayuda"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Ayuda
              </Link>
              <Link
                href="/blog"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              
              {/* Language Toggle */}
              <button
                onClick={() => window.location.href = 'https://linkto-lawyers.com'}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                English
              </button>

              {/* Mobile User Authentication */}
              {!hideUserDropdown && (
                <>
                  {user ? (
                    <>
                      <Link
                        href="/admin-dashboard"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Panel de Administración
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}