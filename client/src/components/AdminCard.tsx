import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminCardProps {
  title: string;
  description: string;
  icon: LucideIcon | React.ReactElement;
  iconColor?: string;
  route?: string;
  isLoading?: boolean;
  error?: any;
  children: React.ReactNode;
  actionText?: string;
  actionButton?: React.ReactElement;
}

export default function AdminCard({
  title,
  description,
  icon,
  iconColor = 'text-blue-600',
  route,
  isLoading = false,
  error = null,
  children,
  actionText = 'Manage',
  actionButton
}: AdminCardProps) {
  const [, setLocation] = useLocation();

  const handleCardClick = () => {
    if (route) {
      setLocation(route);
    }
  };

  const renderIcon = () => {
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent className={`w-5 h-5 ${iconColor}`} />;
    } else {
      return icon;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderIcon()}
            {title}
          </div>
          {route && <ChevronRight className="w-5 h-5 text-gray-400" />}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error loading data</p>
          </div>
        ) : (
          <>
            {children}
            <div className="flex justify-end pt-4 border-t">
              {actionButton || (
                route && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCardClick}
                    className="text-xs"
                  >
                    {actionText}
                  </Button>
                )
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}