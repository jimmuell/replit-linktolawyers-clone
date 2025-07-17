import { useState } from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface BlogHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function BlogHeader({ title, showBackButton = false }: BlogHeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      setIsLoginModalOpen(false);
      toast({ title: 'Login successful!' });
    } catch (error: any) {
      toast({ 
        title: 'Login failed', 
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive' 
      });
    }
  };

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

            {/* Right side - Auth */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/blog" className="text-gray-700 hover:text-black transition-colors">
                  Blog
                </Link>
                <Link href="/free-resources" className="text-gray-700 hover:text-black transition-colors">
                  Resources
                </Link>
                <Link href="/help" className="text-gray-700 hover:text-black transition-colors">
                  Help
                </Link>
                
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Welcome, {user.firstName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => logout()}
                      className="text-gray-700 hover:text-black"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-gray-700 hover:text-black"
                  >
                    Sign In
                  </Button>
                )}
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
                <Link href="/blog" className="block px-3 py-2 text-gray-700 hover:text-black">
                  Blog
                </Link>
                <Link href="/free-resources" className="block px-3 py-2 text-gray-700 hover:text-black">
                  Resources
                </Link>
                <Link href="/help" className="block px-3 py-2 text-gray-700 hover:text-black">
                  Help
                </Link>
                
                {user ? (
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-700 mb-2">Welcome, {user.firstName}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => logout()}
                      className="text-gray-700 hover:text-black"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-gray-700 hover:text-black"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                Sign In
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}