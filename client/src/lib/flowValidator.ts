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
    'date': 'date',
    'subflow': 'subflow'
  };
  
  const normalized = screenType.toLowerCase().trim().replace(/\s+/g, '-');
  return mapping[normalized] || normalized;
}

function findNodeByStep(flow: ParsedFlow, step: TestStep, previousNodeId?: string): FlowNode | null {
  const expectedType = mapScreenTypeToNodeType(step.screenType);
  const normalizedQuestion = normalizeText(step.questionContent);
  
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

  for (const node of candidates) {
    const nodeQuestion = node.question || node.formTitle || '';
    const normalizedNodeQuestion = normalizeText(nodeQuestion);
    
    if (normalizedNodeQuestion === normalizedQuestion) {
      return node;
    }
  }

  return null;
}

function validateStepQuestionMatch(step: TestStep, node: FlowNode): ValidationError | null {
  const stepQuestion = normalizeText(step.questionContent);
  const nodeQuestion = normalizeText(node.question || node.formTitle || '');
  
  if (stepQuestion === nodeQuestion) {
    return null;
  }
  
  return {
    type: 'question_mismatch',
    stepNumber: step.stepNumber,
    expected: step.questionContent,
    actual: node.question || node.formTitle || '(no question)',
    message: `Question text does not match exactly. Expected: "${step.questionContent}" but found: "${node.question || node.formTitle || '(no question)'}"`
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
