import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  route: string;
  isLoading?: boolean;
  error?: any;
  children: React.ReactNode;
  actionText?: string;
}

export default function AdminCard({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  route,
  isLoading = false,
  error = null,
  children,
  actionText = 'Manage'
}: AdminCardProps) {
  const [, setLocation] = useLocation();

  const handleCardClick = () => {
    setLocation(route);
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${iconColor}`} />
            {title}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </CardTitle>
        <CardDescription className="min-h-[2.5rem] flex items-center">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <p className="text-red-600">Error loading data</p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-[200px] flex flex-col justify-center">
              {children}
            </div>
            <div className="flex justify-end pt-4 border-t mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCardClick}
                className="text-xs px-4 py-2"
              >
                {actionText}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}