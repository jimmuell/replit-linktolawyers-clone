import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ChevronDown, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNavbarProps {
  title: string;
  backTo?: string;
  showBackButton?: boolean;
}

export default function AdminNavbar({ title, backTo = '/admin-dashboard', showBackButton = true }: AdminNavbarProps) {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {showBackButton ? (
          <Button
            variant="ghost"
            onClick={() => navigate(backTo)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">LinkToLawyers</h1>
          </div>
        )}
        
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        {!showBackButton && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user.firstName?.charAt(0) || 'A'}{user.lastName?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
                <span>{user.firstName} {user.lastName}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
          <div className="w-32"></div>
        )}
      </div>
    </nav>
  );
}