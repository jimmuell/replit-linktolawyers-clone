import { useQuery } from '@tanstack/react-query';
import { FlaskConical, CheckCircle2, Clock, XCircle } from 'lucide-react';
import AdminCard from './AdminCard';
import type { Flow } from '@shared/schema';

export default function TestFlowCard() {
  const { data: flows = [], isLoading } = useQuery<Flow[]>({
    queryKey: ['/api/flows/active'],
  });

  const totalFlows = flows.length;

  return (
    <AdminCard
      title="Test Flows"
      description="Upload test scripts and validate flow logic"
      icon={FlaskConical}
      iconColor="text-orange-600"
      route="/admin/test-flows"
      isLoading={isLoading}
      error={null}
      actionText="Test"
    >
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Flows</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalFlows}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">0</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-500">Failed</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">0</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Quick Status:</div>
        <div className="text-sm text-gray-600">
          {totalFlows > 0 
            ? `${totalFlows} flow${totalFlows !== 1 ? 's' : ''} available for testing`
            : 'No flows imported yet'
          }
        </div>
      </div>
    </AdminCard>
  );
}
