import { useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Upload, FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { parseFlowMarkdown, validateFlow, type ParsedFlow } from '@/lib/flowParser';
import { useToast } from '@/hooks/use-toast';

export default function AdminFlows() {
  const [importedFlow, setImportedFlow] = useState<ParsedFlow | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleConfirmImport = () => {
    if (!importedFlow) return;
    
    toast({
      title: 'Flow imported successfully',
      description: `"${importedFlow.name}" has been imported with ${importedFlow.nodes.length} screens.`
    });
    setIsPreviewOpen(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              Asylum Flow
            </CardTitle>
            <CardDescription>
              Affirmative asylum application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              8 questions covering persecution fears, entry information, and court status.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-600" />
              K-1 Fiancé Visa
            </CardTitle>
            <CardDescription>
              Fiancé visa application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Questions for U.S. citizen petitioners bringing fiancés to the U.S.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              Family-Based Green Card
            </CardTitle>
            <CardDescription>
              Family immigration intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Separate flows for petitioners and beneficiaries.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              Removal of Conditions
            </CardTitle>
            <CardDescription>
              I-751 petition intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              For conditional residents removing conditions on their green card.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-600" />
              Citizenship/Naturalization
            </CardTitle>
            <CardDescription>
              N-400 application intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Naturalization application for lawful permanent residents.
            </p>
          </CardContent>
        </Card>
      </div>

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
                <div className="space-y-2">
                  {importedFlow.nodes.map((node, index) => (
                    <div key={node.id} className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <Badge className={getNodeTypeColor(node.type)}>
                        {getNodeTypeLabel(node.type)}
                      </Badge>
                      <span className="text-sm">
                        {node.formTitle || node.question || node.thankYouTitle || 'Untitled'}
                      </span>
                      {node.formFields && node.formFields.length > 0 && (
                        <span className="text-xs text-gray-500">
                          ({node.formFields.length} fields)
                        </span>
                      )}
                      {index < importedFlow.nodes.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancel
            </Button>
            {importedFlow && !parseError && (
              <Button onClick={handleConfirmImport} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirm Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
