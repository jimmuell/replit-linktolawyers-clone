import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import SmtpStatusCard from '@/components/SmtpStatusCard';
import PromptManagementCard from '@/components/PromptManagementCard';
import RequestManagementCard from '@/components/RequestManagementCard';
import AttorneyOnboardingCard from '@/components/AttorneyOnboardingCard';
import AttorneyFeeScheduleCard from '@/components/AttorneyFeeScheduleCard';
import BlogManagementCard from '@/components/BlogManagementCard';
import EmailTemplatesCard from '@/components/EmailTemplatesCard';

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      // Redirect non-admin users or logged out users immediately
      window.location.href = '/';
    }
  }, [user, loading]);

  // Show loading state while checking authentication or redirecting
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
      <AdminNavbar title="Admin Dashboard" showBackButton={false} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.firstName}!</h2>
          <p className="text-gray-600">Manage your legal services platform from here.</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
          <SmtpStatusCard />
          <PromptManagementCard />
          <RequestManagementCard />
          <AttorneyOnboardingCard />
          <AttorneyFeeScheduleCard />
          <BlogManagementCard />
          <EmailTemplatesCard />
        </div>
      </div>
    </div>
  );
}