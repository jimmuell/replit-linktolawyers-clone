import { type ParsedFlow, type FlowNode, type FlowConnection } from './flowParser';
import { type TestPath, type TestStep, type ParsedTestScript } from './testScriptParser';

export interface ValidationError {
  type: 'question_mismatch' | 'type_mismatch' | 'node_count_mismatch' | 'path_count_mismatch' | 'missing_node' | 'connection_error';
  stepNumber: number;
  expected: string;
  actual: string;
  message: string;
}

export interface StepValidationResult {
  stepNumber: number;
  isValid: boolean;
  matchedNode: FlowNode | null;
  errors: ValidationError[];
}

export interface PathValidationResult {
  pathNumber: number;
  isValid: boolean;
  stepResults: StepValidationResult[];
  errors: ValidationError[];
  nodeCount: {
    expected: number;
    actual: number;
  };
}

export interface FlowValidationResult {
  isValid: boolean;
  flowName: string;
  pathResults: PathValidationResult[];
  summary: {
    totalPaths: number;
    validPaths: number;
    invalidPaths: number;
    totalSteps: number;
    validSteps: number;
    invalidSteps: number;
    totalNodes: {
      expected: number;
      actual: number;
    };
  };
  errors: ValidationError[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

function mapScreenTypeToNodeType(screenType: string): string {
  const mapping: Record<string, string> = {
    'start': 'start',
    'form': 'form',
    'yes-no': 'yes-no',
    'yes/no': 'yes-no',
    'yesno': 'yes-no',
    'multiple-choice': 'multiple-choice',
    'multiplechoice': 'multiple-choice',
    'multi-choice': 'multiple-choice',
    'info': 'info',
    'information': 'info',
    'completion': 'completion',
    'success': 'success',
    'end': 'end',
    'text': 'text',
    'text-input': 'text',
    'textinput': 'text',
    'date': 'date',
    'subflow': 'subflow'
  };
  
  const normalized = screenType.toLowerCase().trim().replace(/\s+/g, '-');
  return mapping[normalized] || normalized;
}

function getNodeContentTexts(node: FlowNode): string[] {
  const texts: string[] = [];
  
  // Add all possible content fields
  if (node.question) texts.push(node.question);
  if (node.formTitle) texts.push(node.formTitle);
  if (node.infoTitle) texts.push(node.infoTitle);
  if (node.infoDescription) texts.push(node.infoDescription);
  if (node.formDescription) texts.push(node.formDescription);
  if (node.welcomeDescription) texts.push(node.welcomeDescription);
  if (node.thankYouTitle) texts.push(node.thankYouTitle);
  if (node.thankYouMessage) texts.push(node.thankYouMessage);
  
  return texts.filter(t => t && t.trim() !== '');
}

function getNodePrimaryContent(node: FlowNode): string {
  // Priority order for primary content
  return node.question || 
         node.formTitle || 
         node.infoTitle || 
         node.infoDescription ||
         node.formDescription ||
         node.welcomeDescription ||
         node.thankYouTitle ||
         node.thankYouMessage ||
         '';
}

// Generic placeholders that test script generators commonly use
const GENERIC_PLACEHOLDERS = new Set([
  'welcome', 'start', 'begin', 'success', 'end', 'complete', 'completed', 
  'congratulations', 'thank you', 'thanks', 'finish', 'done'
]);

function isGenericPlaceholder(text: string): boolean {
  return GENERIC_PLACEHOLDERS.has(normalizeText(text));
}

function findNodeByStep(flow: ParsedFlow, step: TestStep, previousNodeId?: string): FlowNode | null {
  const expectedType = mapScreenTypeToNodeType(step.screenType);
  const normalizedQuestion = normalizeText(step.questionContent);
  
  // PRIORITY 1: Match by Node ID if provided (100% reliable)
  if (step.nodeId) {
    const nodeById = flow.nodes.find(node => node.id === step.nodeId);
    if (nodeById) {
      return nodeById;
    }
    // If node ID provided but not found, continue with fallback matching
  }
  
  let candidates = flow.nodes.filter(node => {
    const nodeType = node.type.toLowerCase();
    return nodeType === expectedType;
  });

  if (previousNodeId) {
    const connectedNodeIds = flow.connections
      .filter(c => c.sourceNodeId === previousNodeId)
      .map(c => c.targetNodeId);
    
    const connectedCandidates = candidates.filter(n => connectedNodeIds.includes(n.id));
    if (connectedCandidates.length > 0) {
      candidates = connectedCandidates;
    }
  }

  // For terminal node types (start, success, end, completion), if test uses generic placeholder,
  // match by type only since test script generators often use placeholders
  const terminalTypes = ['start', 'success', 'end', 'completion'];
  if (terminalTypes.includes(expectedType) && isGenericPlaceholder(step.questionContent)) {
    if (candidates.length > 0) {
      return candidates[0]; // Return first matching type
    }
  }

  // First pass: exact match on any content field
  for (const node of candidates) {
    const contentTexts = getNodeContentTexts(node);
    for (const text of contentTexts) {
      if (normalizeText(text) === normalizedQuestion) {
        return node;
      }
    }
  }

  // Second pass: check if test question is contained in any content field (handles truncation)
  for (const node of candidates) {
    const contentTexts = getNodeContentTexts(node);
    for (const text of contentTexts) {
      const normalizedText = normalizeText(text);
      // Strip trailing ellipsis for prefix matching
      const questionWithoutEllipsis = normalizedQuestion.replace(/\.{3,}$/, '').trim();
      if (normalizedText.includes(normalizedQuestion) || 
          normalizedQuestion.includes(normalizedText) ||
          normalizedText.startsWith(questionWithoutEllipsis)) {
        return node;
      }
    }
  }

  // Third pass: for terminal types, match by type if only one candidate
  if (terminalTypes.includes(expectedType) && candidates.length === 1) {
    return candidates[0];
  }

  return null;
}

function validateStepQuestionMatch(step: TestStep, node: FlowNode): ValidationError | null {
  const stepQuestion = normalizeText(step.questionContent);
  const contentTexts = getNodeContentTexts(node);
  const primaryContent = getNodePrimaryContent(node);
  
  // Skip validation if matched by Node ID - ID match is authoritative
  if (step.nodeId && step.nodeId === node.id) {
    return null; // Node ID match is 100% reliable, skip content validation
  }
  
  // Skip validation for terminal nodes with generic placeholders
  const terminalTypes = ['start', 'success', 'end', 'completion'];
  if (terminalTypes.includes(node.type.toLowerCase()) && isGenericPlaceholder(step.questionContent)) {
    return null; // Accept match for terminal nodes with generic placeholders
  }
  
  // Check if any content field matches
  for (const text of contentTexts) {
    const normalizedText = normalizeText(text);
    // Also handle truncated text with ellipsis
    const questionWithoutEllipsis = stepQuestion.replace(/\.{3,}$/, '').trim();
    if (normalizedText === stepQuestion || 
        normalizedText.includes(stepQuestion) || 
        stepQuestion.includes(normalizedText) ||
        normalizedText.startsWith(questionWithoutEllipsis)) {
      return null;
    }
  }
  
  return {
    type: 'question_mismatch',
    stepNumber: step.stepNumber,
    expected: step.questionContent,
    actual: primaryContent || '(no question)',
    message: `Question text does not match exactly. Expected: "${step.questionContent}" but found: "${primaryContent || '(no question)'}"`
  };
}

function validateStepTypeMatch(step: TestStep, node: FlowNode): ValidationError | null {
  const expectedType = mapScreenTypeToNodeType(step.screenType);
  const actualType = node.type.toLowerCase();
  
  if (expectedType !== actualType) {
    return {
      type: 'type_mismatch',
      stepNumber: step.stepNumber,
      expected: step.screenType,
      actual: node.type,
      message: `Node type mismatch. Expected: "${step.screenType}" but found: "${node.type}"`
    };
  }
  
  return null;
}

export function validateStep(
  step: TestStep,
  flow: ParsedFlow,
  previousNodeId?: string
): StepValidationResult {
  const errors: ValidationError[] = [];
  
  const matchedNode = findNodeByStep(flow, step, previousNodeId);
  
  if (!matchedNode) {
    errors.push({
      type: 'missing_node',
      stepNumber: step.stepNumber,
      expected: `${step.screenType}: ${step.questionContent}`,
      actual: '(not found)',
      message: `No matching node found for step ${step.stepNumber} with type "${step.screenType}" and question "${step.questionContent}"`
    });
    
    return {
      stepNumber: step.stepNumber,
      isValid: false,
      matchedNode: null,
      errors
    };
  }

  const typeError = validateStepTypeMatch(step, matchedNode);
  if (typeError) {
    errors.push(typeError);
  }

  const questionError = validateStepQuestionMatch(step, matchedNode);
  if (questionError) {
    errors.push(questionError);
  }

  return {
    stepNumber: step.stepNumber,
    isValid: errors.length === 0,
    matchedNode,
    errors
  };
}

export function validatePath(
  path: TestPath,
  flow: ParsedFlow
): PathValidationResult {
  const stepResults: StepValidationResult[] = [];
  const errors: ValidationError[] = [];
  let previousNodeId: string | undefined;

  for (const step of path.steps) {
    const result = validateStep(step, flow, previousNodeId);
    stepResults.push(result);
    
    if (result.matchedNode) {
      previousNodeId = result.matchedNode.id;
    }
    
    errors.push(...result.errors);
  }

  const expectedNodeCount = path.steps.length;
  const actualNodeCount = stepResults.filter(r => r.matchedNode !== null).length;
  
  if (expectedNodeCount !== actualNodeCount) {
    errors.push({
      type: 'node_count_mismatch',
      stepNumber: 0,
      expected: expectedNodeCount.toString(),
      actual: actualNodeCount.toString(),
      message: `Path ${path.pathNumber} node count mismatch. Expected ${expectedNodeCount} nodes but matched ${actualNodeCount}`
    });
  }

  return {
    pathNumber: path.pathNumber,
    isValid: errors.length === 0,
    stepResults,
    errors,
    nodeCount: {
      expected: expectedNodeCount,
      actual: actualNodeCount
    }
  };
}

export function validateFlowAgainstTestScript(
  testScript: ParsedTestScript,
  flow: ParsedFlow
): FlowValidationResult {
  const pathResults: PathValidationResult[] = [];
  const errors: ValidationError[] = [];
  
  let totalSteps = 0;
  let validSteps = 0;
  let totalExpectedNodes = 0;
  let totalActualNodes = 0;

  for (const path of testScript.paths) {
    const result = validatePath(path, flow);
    pathResults.push(result);
    errors.push(...result.errors);
    
    totalSteps += path.steps.length;
    validSteps += result.stepResults.filter(s => s.isValid).length;
    totalExpectedNodes += result.nodeCount.expected;
    totalActualNodes += result.nodeCount.actual;
  }

  const validPaths = pathResults.filter(p => p.isValid).length;
  const invalidPaths = pathResults.filter(p => !p.isValid).length;

  if (testScript.totalPaths !== pathResults.length) {
    errors.unshift({
      type: 'path_count_mismatch',
      stepNumber: 0,
      expected: testScript.totalPaths.toString(),
      actual: pathResults.length.toString(),
      message: `Path count mismatch. Test script declares ${testScript.totalPaths} paths but found ${pathResults.length}`
    });
  }

  return {
    isValid: errors.length === 0,
    flowName: testScript.flowName,
    pathResults,
    summary: {
      totalPaths: pathResults.length,
      validPaths,
      invalidPaths,
      totalSteps,
      validSteps,
      invalidSteps: totalSteps - validSteps,
      totalNodes: {
        expected: totalExpectedNodes,
        actual: totalActualNodes
      }
    },
    errors
  };
}

export function getValidationSummaryMessage(result: FlowValidationResult): string {
  if (result.isValid) {
    return `All ${result.summary.totalPaths} paths validated successfully with ${result.summary.totalSteps} steps matching exactly.`;
  }
  
  const errorTypes = new Set(result.errors.map(e => e.type));
  const messages: string[] = [];
  
  if (errorTypes.has('question_mismatch')) {
    messages.push('question text mismatches');
  }
  if (errorTypes.has('type_mismatch')) {
    messages.push('node type mismatches');
  }
  if (errorTypes.has('node_count_mismatch')) {
    messages.push('node count differences');
  }
  if (errorTypes.has('missing_node')) {
    messages.push('missing nodes');
  }
  
  return `Validation failed with ${result.errors.length} errors: ${messages.join(', ')}. ${result.summary.validPaths}/${result.summary.totalPaths} paths valid.`;
}
