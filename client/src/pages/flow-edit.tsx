import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, GitBranch, ArrowDown, ArrowRight, Split } from 'lucide-react';
import { type ParsedFlow } from '@/lib/flowParser';

export default function FlowEdit() {
  const { flowId } = useParams<{ flowId: string }>();
  const [, setLocation] = useLocation();
  const [flow, setFlow] = useState<ParsedFlow | null>(null);

  useEffect(() => {
    const storedFlows = localStorage.getItem('importedFlows');
    if (storedFlows) {
      const flows: ParsedFlow[] = JSON.parse(storedFlows);
      const found = flows.find(f => f.metadata?.flowId === flowId || f.name.toLowerCase().replace(/\s+/g, '-') === flowId);
      if (found) {
        setFlow(found);
      }
    }
  }, [flowId]);

  const getNodeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'start': 'Start Screen',
      'form': 'Form',
      'yes-no': 'Yes/No Question',
      'info': 'Information',
      'completion': 'Completion',
      'multiple-choice': 'Multiple Choice',
      'text': 'Text Input',
      'date': 'Date Picker',
      'success': 'Success',
      'end': 'End',
      'subflow': 'Subflow'
    };
    return labels[type] || type;
  };

  const getNodeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'start': 'bg-green-100 text-green-800',
      'form': 'bg-blue-100 text-blue-800',
      'yes-no': 'bg-purple-100 text-purple-800',
      'info': 'bg-yellow-100 text-yellow-800',
      'completion': 'bg-emerald-100 text-emerald-800',
      'multiple-choice': 'bg-orange-100 text-orange-800',
      'text': 'bg-sky-100 text-sky-800',
      'date': 'bg-pink-100 text-pink-800',
      'success': 'bg-lime-100 text-lime-800',
      'end': 'bg-slate-100 text-slate-800',
      'subflow': 'bg-violet-100 text-violet-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getOutgoingConnections = (nodeId: string) => {
    if (!flow) return [];
    return flow.connections.filter(conn => conn.sourceNodeId === nodeId);
  };

  const getNodeById = (nodeId: string) => {
    if (!flow) return null;
    return flow.nodes.find(n => n.id === nodeId);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'any': 'Continue',
      'yes': 'Yes',
      'no': 'No'
    };
    return labels[condition] || condition;
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'any': 'bg-gray-100 text-gray-700',
      'yes': 'bg-green-100 text-green-700',
      'no': 'bg-red-100 text-red-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  };

  if (!flow) {
    return (
      <AdminLayout title="Flow Editor">
        <div className="text-center py-12">
          <p className="text-gray-500">Flow not found</p>
          <Button variant="outline" onClick={() => setLocation('/admin/flows')} className="mt-4">
            Back to Flows
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Flow Editor">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/admin/flows')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{flow.name}</h2>
            {flow.description && (
              <p className="text-gray-600">{flow.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setLocation(`/admin/flows/${flowId}/preview`)} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Preview
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {flow.metadata?.version && (
          <Badge variant="outline">v{flow.metadata.version}</Badge>
        )}
        <Badge variant="secondary">{flow.nodes.length} screens</Badge>
        <Badge variant="secondary">{flow.connections.length} connections</Badge>
        {flow.metadata?.estimatedTime && (
          <Badge variant="outline">{flow.metadata.estimatedTime}</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Flow Structure
          </CardTitle>
          <CardDescription>
            Visual overview of all screens and their connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {flow.nodes.map((node, index) => {
              const outgoingConnections = getOutgoingConnections(node.id);
              const isBranching = outgoingConnections.length > 1;
              
              return (
                <div key={node.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                    <Badge className={getNodeTypeColor(node.type)}>
                      {getNodeTypeLabel(node.type)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {node.formTitle || node.question || node.thankYouTitle || 'Untitled'}
                    </span>
                    {node.formFields && node.formFields.length > 0 && (
                      <span className="text-xs text-gray-500">
                        ({node.formFields.length} fields)
                      </span>
                    )}
                    {isBranching && (
                      <Badge variant="outline" className="ml-auto flex items-center gap-1">
                        <Split className="h-3 w-3" />
                        Branches
                      </Badge>
                    )}
                  </div>
                  
                  {outgoingConnections.length > 0 && (
                    <div className="mt-3 pl-8 space-y-1">
                      {outgoingConnections.map((conn) => {
                        const targetNode = getNodeById(conn.targetNodeId);
                        return (
                          <div key={conn.id} className="flex items-center gap-2 text-sm">
                            <ArrowDown className="h-3 w-3 text-gray-400" />
                            <Badge variant="outline" className={getConditionColor(conn.condition)}>
                              {getConditionLabel(conn.condition)}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">
                              {targetNode?.formTitle || targetNode?.question || targetNode?.thankYouTitle || 'Unknown'}
                            </span>
                            {conn.isEndConnection && (
                              <Badge variant="secondary" className="text-xs">End</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
