import { useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface BlogHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function BlogHeader({ title, showBackButton = false }: BlogHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button or Logo */}
            <div className="flex items-center">
              {showBackButton ? (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="mr-4"
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              ) : (
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-black">LinkToLawyers</span>
                </Link>
              )}
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/help" className="text-gray-700 hover:text-black transition-colors">
                  Help
                </Link>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link href="/help" className="block px-3 py-2 text-gray-700 hover:text-black">
                  Help
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}