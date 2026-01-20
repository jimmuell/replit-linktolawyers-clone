export interface FlowFormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface FlowNode {
  id: string;
  type: 'start' | 'form' | 'yes-no' | 'info' | 'completion' | 'multiple-choice';
  question: string;
  yesLabel?: string | null;
  noLabel?: string | null;
  options?: { id: string; label: string }[] | null;
  formTitle?: string | null;
  formDescription?: string | null;
  formFields: FlowFormField[];
  brandName?: string;
  welcomeDescription?: string;
  thankYouTitle?: string | null;
  thankYouMessage?: string | null;
  legalDisclaimer?: string | null;
  additionalInfoPrompt?: string | null;
  infoTitle?: string | null;
  infoDescription?: string | null;
}

export interface FlowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition: 'any' | 'yes' | 'no' | string;
  label?: string;
  isEndConnection?: boolean;
}

export interface ParsedFlow {
  name: string;
  description: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  metadata?: {
    flowId?: string;
    version?: string;
    totalScreens?: number;
    totalConnections?: number;
    estimatedTime?: string;
    created?: string;
  };
}

export interface FlowParseResult {
  success: boolean;
  flow?: ParsedFlow;
  error?: string;
}

function extractJsonFromMarkdown(content: string): string | null {
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1].trim();
  }
  return null;
}

function extractMetadataFromMarkdown(content: string): ParsedFlow['metadata'] {
  const metadata: ParsedFlow['metadata'] = {};
  
  const flowIdMatch = content.match(/\*\*Flow ID\*\*:\s*(.+)/);
  if (flowIdMatch) metadata.flowId = flowIdMatch[1].trim();
  
  const versionMatch = content.match(/\*\*Version\*\*:\s*(.+)/);
  if (versionMatch) metadata.version = versionMatch[1].trim();
  
  const screensMatch = content.match(/\*\*Total Screens\*\*:\s*(\d+)/);
  if (screensMatch) metadata.totalScreens = parseInt(screensMatch[1]);
  
  const connectionsMatch = content.match(/\*\*Total Connections\*\*:\s*(\d+)/);
  if (connectionsMatch) metadata.totalConnections = parseInt(connectionsMatch[1]);
  
  const timeMatch = content.match(/\*\*Estimated Completion Time\*\*:\s*(.+)/);
  if (timeMatch) metadata.estimatedTime = timeMatch[1].trim();
  
  const createdMatch = content.match(/\*\*Created\*\*:\s*(.+)/);
  if (createdMatch) metadata.created = createdMatch[1].trim();
  
  return metadata;
}

export function parseFlowMarkdown(content: string): FlowParseResult {
  try {
    const jsonString = extractJsonFromMarkdown(content);
    
    if (!jsonString) {
      return {
        success: false,
        error: 'No JSON block found in the markdown file. Expected a ```json ... ``` block.'
      };
    }
    
    const flowData = JSON.parse(jsonString);
    
    if (!flowData.name || !Array.isArray(flowData.nodes) || !Array.isArray(flowData.connections)) {
      return {
        success: false,
        error: 'Invalid flow structure. Expected name, nodes array, and connections array.'
      };
    }
    
    const metadata = extractMetadataFromMarkdown(content);
    
    const parsedFlow: ParsedFlow = {
      name: flowData.name,
      description: flowData.description || '',
      nodes: flowData.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        question: node.question || '',
        yesLabel: node.yesLabel,
        noLabel: node.noLabel,
        options: node.options,
        formTitle: node.formTitle,
        formDescription: node.formDescription,
        formFields: (node.formFields || []).map((field: any) => ({
          id: field.id,
          type: field.type || 'text',
          label: field.label || '',
          placeholder: field.placeholder,
          required: field.required || false,
          options: field.options
        })),
        brandName: node.brandName,
        welcomeDescription: node.welcomeDescription,
        thankYouTitle: node.thankYouTitle,
        thankYouMessage: node.thankYouMessage,
        legalDisclaimer: node.legalDisclaimer,
        additionalInfoPrompt: node.additionalInfoPrompt,
        infoTitle: node.infoTitle,
        infoDescription: node.infoDescription
      })),
      connections: flowData.connections.map((conn: any) => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        condition: conn.condition || 'any',
        label: conn.label,
        isEndConnection: conn.isEndConnection || false
      })),
      metadata
    };
    
    return {
      success: true,
      flow: parsedFlow
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse flow file'
    };
  }
}

export function getStartNode(flow: ParsedFlow): FlowNode | undefined {
  return flow.nodes.find(node => node.type === 'start');
}

export function getNextNodes(flow: ParsedFlow, currentNodeId: string, condition?: string): FlowNode[] {
  const connections = flow.connections.filter(conn => {
    if (conn.sourceNodeId !== currentNodeId) return false;
    if (condition && conn.condition !== 'any' && conn.condition !== condition) return false;
    return true;
  });
  
  return connections
    .map(conn => flow.nodes.find(node => node.id === conn.targetNodeId))
    .filter((node): node is FlowNode => node !== undefined);
}

export function validateFlow(flow: ParsedFlow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const startNodes = flow.nodes.filter(node => node.type === 'start');
  if (startNodes.length === 0) {
    errors.push('Flow must have at least one start node');
  } else if (startNodes.length > 1) {
    errors.push('Flow should have only one start node');
  }
  
  const completionNodes = flow.nodes.filter(node => node.type === 'completion');
  if (completionNodes.length === 0) {
    errors.push('Flow must have at least one completion node');
  }
  
  const nodeIds = new Set(flow.nodes.map(n => n.id));
  for (const conn of flow.connections) {
    if (!nodeIds.has(conn.sourceNodeId)) {
      errors.push(`Connection references non-existent source node: ${conn.sourceNodeId}`);
    }
    if (!nodeIds.has(conn.targetNodeId)) {
      errors.push(`Connection references non-existent target node: ${conn.targetNodeId}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
