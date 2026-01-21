import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import SmtpStatusCard from '@/components/SmtpStatusCard';
import PromptManagementCard from '@/components/PromptManagementCard';
import SubmissionsCard from '@/components/SubmissionsCard';
import AttorneyOnboardingCard from '@/components/AttorneyOnboardingCard';
import AttorneyFeeScheduleCard from '@/components/AttorneyFeeScheduleCard';
import BlogManagementCard from '@/components/BlogManagementCard';
import EmailTemplatesCard from '@/components/EmailTemplatesCard';
import CaseTypesManagementCard from '@/components/CaseTypesManagementCard';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.firstName}!</h2>
        <p className="text-gray-600">Manage your legal services platform from here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
        <SmtpStatusCard />
        <PromptManagementCard />
        <SubmissionsCard />
        <AttorneyOnboardingCard />
        <AttorneyFeeScheduleCard />
        <BlogManagementCard />
        <EmailTemplatesCard />
        <CaseTypesManagementCard />
      </div>
    </AdminLayout>
  );
}