import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Upload, FileText, CheckCircle, XCircle, ArrowRight, ArrowDown, Split, Trash2, Link, Loader2 } from 'lucide-react';
import { parseFlowMarkdown, validateFlow, type ParsedFlow } from '@/lib/flowParser';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Flow } from '@shared/schema';

type FlowWithUsage = Flow & { linkedCaseTypes: number };

export default function AdminFlows() {
  const [, setLocation] = useLocation();
  const [importedFlow, setImportedFlow] = useState<ParsedFlow | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteConfirmFlow, setDeleteConfirmFlow] = useState<{ id: number; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flows = [], isLoading } = useQuery<FlowWithUsage[]>({
    queryKey: ['/api/admin/flows'],
  });

  const createFlowMutation = useMutation({
    mutationFn: async (flowData: any) => {
      return await apiRequest('/api/admin/flows', {
        method: 'POST',
        body: flowData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flows'] });
    },
  });

  const deleteFlowMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/flows/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flows'] });
    },
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a markdown (.md) file',
        variant: 'destructive'
      });
      return;
    }

    try {
      const content = await file.text();
      const result = parseFlowMarkdown(content);

      if (!result.success || !result.flow) {
        setParseError(result.error || 'Failed to parse flow file');
        setImportedFlow(null);
        setIsPreviewOpen(true);
        return;
      }

      const validation = validateFlow(result.flow);
      setValidationErrors(validation.errors);
      setImportedFlow(result.flow);
      setParseError(null);
      setIsPreviewOpen(true);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to read file');
      setImportedFlow(null);
      setIsPreviewOpen(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importedFlow) return;
    
    const slug = importedFlow.metadata?.flowId || importedFlow.name.toLowerCase().replace(/\s+/g, '-');
    
    try {
      await createFlowMutation.mutateAsync({
        name: importedFlow.name,
        slug,
        description: importedFlow.description || 'Imported flow',
        nodes: importedFlow.nodes,
        connections: importedFlow.connections,
        metadata: importedFlow.metadata,
        isActive: true,
      });
      
      toast({
        title: 'Flow imported successfully',
        description: `"${importedFlow.name}" has been imported with ${importedFlow.nodes.length} screens.`
      });
      setIsPreviewOpen(false);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to save flow',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClick = (flow: FlowWithUsage, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmFlow({ id: flow.id, name: flow.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmFlow) return;
    
    try {
      await deleteFlowMutation.mutateAsync(deleteConfirmFlow.id);
      toast({
        title: 'Flow deleted',
        description: 'The flow has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete flow',
        variant: 'destructive'
      });
    }
    setDeleteConfirmFlow(null);
  };

  const handleFlowClick = (flow: FlowWithUsage) => {
    setLocation(`/admin/flows/${flow.slug}`);
  };

  const getNodeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'start': 'Start Screen',
      'form': 'Form',
      'yes-no': 'Yes/No Question',
      'info': 'Information',
      'completion': 'Completion',
      'multiple-choice': 'Multiple Choice'
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
      'multiple-choice': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getOutgoingConnections = (nodeId: string) => {
    if (!importedFlow) return [];
    return importedFlow.connections.filter(conn => conn.sourceNodeId === nodeId);
  };

  const getNodeById = (nodeId: string) => {
    if (!importedFlow) return null;
    return importedFlow.nodes.find(n => n.id === nodeId);
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

  return (
    <AdminLayout title="Flows Management">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Flows Management</h2>
          <p className="text-gray-600">View and manage intake flows for different case types.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button onClick={handleImportClick} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : flows.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flows yet</h3>
          <p className="text-gray-600 mb-4">Import a flow file to get started.</p>
          <Button onClick={handleImportClick} className="flex items-center gap-2 mx-auto">
            <Upload className="h-4 w-4" />
            Import Flow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <Card 
              key={flow.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow relative"
              onClick={() => handleFlowClick(flow)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                onClick={(e) => handleDeleteClick(flow, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-8">
                  <GitBranch className="h-5 w-5 text-cyan-600" />
                  {flow.name}
                </CardTitle>
                <CardDescription>
                  {flow.description || 'Imported flow'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{(flow.nodes as any[])?.length || 0} screens</Badge>
                  <Badge variant="outline">{(flow.connections as any[])?.length || 0} connections</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {flow.linkedCaseTypes > 0 ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Link className="h-3 w-3 mr-1" />
                      Active ({flow.linkedCaseTypes} {flow.linkedCaseTypes === 1 ? 'category' : 'categories'})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Click to edit or preview this flow.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {parseError ? 'Import Error' : 'Flow Preview'}
            </DialogTitle>
            <DialogDescription>
              {parseError ? 'There was an error parsing the flow file.' : 'Review the imported flow before confirming.'}
            </DialogDescription>
          </DialogHeader>

          {parseError ? (
            <div className="py-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Parse Error</p>
                  <p className="text-sm text-red-600 mt-1">{parseError}</p>
                </div>
              </div>
            </div>
          ) : importedFlow ? (
            <div className="py-4 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{importedFlow.name}</h3>
                {importedFlow.description && (
                  <p className="text-gray-600">{importedFlow.description}</p>
                )}
                {importedFlow.metadata && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {importedFlow.metadata.version && (
                      <Badge variant="outline">v{importedFlow.metadata.version}</Badge>
                    )}
                    <Badge variant="secondary">{importedFlow.nodes.length} screens</Badge>
                    <Badge variant="secondary">{importedFlow.connections.length} connections</Badge>
                    {importedFlow.metadata.estimatedTime && (
                      <Badge variant="outline">{importedFlow.metadata.estimatedTime}</Badge>
                    )}
                  </div>
                )}
              </div>

              {validationErrors.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800 mb-2">Validation Warnings</p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3">Flow Screens</h4>
                <div className="space-y-3">
                  {importedFlow.nodes.map((node, index) => {
                    const outgoingConnections = getOutgoingConnections(node.id);
                    const isBranching = outgoingConnections.length > 1;
                    
                    return (
                      <div key={node.id} className="border rounded-lg p-3 bg-white">
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
                          <div className="mt-2 pl-8 space-y-1">
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
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            {importedFlow && !parseError && (
              <Button 
                onClick={handleConfirmImport} 
                className="flex items-center gap-2"
                disabled={createFlowMutation.isPending}
              >
                {createFlowMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Confirm Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmFlow} onOpenChange={() => setDeleteConfirmFlow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Flow
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmFlow?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmFlow(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteFlowMutation.isPending}
            >
              {deleteFlowMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
