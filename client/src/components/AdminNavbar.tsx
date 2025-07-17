import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminNavbarProps {
  title: string;
  backTo?: string;
}

export default function AdminNavbar({ title, backTo = '/admin-dashboard' }: AdminNavbarProps) {
  const [, navigate] = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(backTo)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        {/* Empty div to balance the layout */}
        <div className="w-32"></div>
      </div>
    </nav>
  );
}