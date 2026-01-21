import { useQuery } from '@tanstack/react-query';
import { Tags, CheckCircle, GitBranch, Link } from 'lucide-react';
import AdminCard from './AdminCard';
import type { CaseType, Flow } from '@shared/schema';

export default function CaseTypesManagementCard() {
  const { data: caseTypes = [], isLoading: caseTypesLoading } = useQuery<CaseType[]>({
    queryKey: ['/api/case-types'],
  });

  const { data: flows = [], isLoading: flowsLoading } = useQuery<Flow[]>({
    queryKey: ['/api/flows/active'],
  });

  const isLoading = caseTypesLoading || flowsLoading;
  
  const activeCaseTypes = caseTypes.filter(ct => ct.isActive);
  const linkedCaseTypes = caseTypes.filter(ct => ct.flowId);
  const activeFlows = flows.length;

  return (
    <AdminCard
      title="Categories"
      description="Manage case types and flow assignments"
      icon={Tags}
      iconColor="text-indigo-600"
      route="/admin/categories"
      isLoading={isLoading}
      error={null}
      actionText="Manage"
    >
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{activeCaseTypes.length}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <GitBranch className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-gray-500">Flows</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{activeFlows}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Link className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Linked</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{linkedCaseTypes.length}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Quick Status:</div>
        <div className="text-sm text-gray-600">
          {linkedCaseTypes.length === activeCaseTypes.length 
            ? 'All categories have flows assigned'
            : `${activeCaseTypes.length - linkedCaseTypes.length} categories need flow assignment`
          }
        </div>
      </div>
    </AdminCard>
  );
}
