import { useAuth } from '@/contexts/AuthContext';
import AdminNavbar from '@/components/AdminNavbar';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import SmtpConfigCard from '@/components/SmtpConfigCard';

export default function SmtpConfigPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="SMTP Configuration" />

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <SmtpConfigCard />
        </div>
      </div>
    </div>
  );
}