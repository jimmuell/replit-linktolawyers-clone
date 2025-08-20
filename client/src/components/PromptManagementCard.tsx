import { MessageSquare, Settings, Edit, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PromptManagementCard() {
  const handleManagePrompts = () => {
    // Navigate to prompt management page when implemented
    window.location.href = '/prompt-management';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Prompt Management</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleManagePrompts}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Edit className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">System Prompts</p>
                <p className="text-xs text-gray-500">Configure chatbot behavior</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Response Templates</p>
                <p className="text-xs text-gray-500">Manage default responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                3 Templates
              </span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleManagePrompts} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="sm"
        >
          <span>Manage Prompts</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}