import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, Link2, TrendingUp, MousePointer } from 'lucide-react';
import AdminCard from './AdminCard';
import { Button } from '@/components/ui/button';

interface AdVisit {
  id: number;
  visitedAt: string;
  language: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  didStart: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="shrink-0 h-7 px-2 text-xs"
    >
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
    </Button>
  );
}

export default function AdCampaignLinksCard() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: AdVisit[] }>({
    queryKey: ['/api/ad-visits'],
    retry: false,
  });

  const visits = data?.data || [];
  const totalVisits = visits.length;
  const totalStarts = visits.filter(v => v.didStart).length;
  const enVisits = visits.filter(v => v.language === 'en').length;
  const esVisits = visits.filter(v => v.language === 'es').length;
  const startRate = totalVisits > 0 ? Math.round((totalStarts / totalVisits) * 100) : 0;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const visitsThisWeek = visits.filter(v => new Date(v.visitedAt) >= weekAgo).length;
  const startsThisWeek = visits.filter(v => v.didStart && new Date(v.visitedAt) >= weekAgo).length;

  const origin = window.location.origin;
  const enUrl = `${origin}/get-a-quote`;
  const esUrl = `${origin}/es/get-a-quote`;

  return (
    <AdminCard
      title="Ad Campaign Links"
      description="Copyable landing page URLs for ad campaigns"
      icon={Link2}
      iconColor="text-orange-600"
      route="/admin-dashboard"
      isLoading={isLoading}
      error={error}
      actionText="Dashboard"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MousePointer className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total Visits</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalVisits}</div>
          <div className="text-xs text-gray-400">{visitsThisWeek} this week</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600">Started</span>
          </div>
          <div className="text-lg font-semibold text-orange-900">{totalStarts}</div>
          <div className="text-xs text-gray-400">{startsThisWeek} this week</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-xs text-gray-500">Start Rate</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{startRate}%</div>
          <div className="text-xs text-gray-400">all time</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">English ({enVisits} visits)</span>
            <CopyButton text={enUrl} />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 font-mono truncate">
            {enUrl}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Spanish ({esVisits} visits)</span>
            <CopyButton text={esUrl} />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 font-mono truncate">
            {esUrl}
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
