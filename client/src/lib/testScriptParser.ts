export interface TestStep {
  stepNumber: number;
  nodeId?: string;
  screenType: string;
  questionContent: string;
  action: string;
  expectedNext: string;
}

export interface TestPath {
  pathNumber: number;
  totalPaths: number;
  pathDescription: string;
  expectedOutcome: string;
  steps: TestStep[];
  checklist: string[];
}

export interface ParsedTestScript {
  flowName: string;
  generatedDate: string;
  totalPaths: number;
  estimatedTime: string;
  paths: TestPath[];
  summary: {
    totalPaths: number;
    successPaths: number;
    completionPaths: number;
    endPaths: number;
    deadEndPaths: number;
  };
}

export interface TestScriptParseResult {
  success: boolean;
  testScript?: ParsedTestScript;
  error?: string;
}

function parseMarkdownTableRows(tableContent: string): TestStep[] {
  const steps: TestStep[] = [];
  const lines = tableContent.split('\n').filter(line => line.includes('|'));
  
  // Detect if Node ID column is present by checking header row
  let hasNodeIdColumn = false;
  for (const line of lines) {
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells[0] === 'Step' && cells.some(c => c.toLowerCase() === 'node id')) {
      hasNodeIdColumn = true;
      break;
    }
  }
  
  for (const line of lines) {
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    const minCells = hasNodeIdColumn ? 6 : 5;
    
    if (cells.length >= minCells && !cells[0].includes('---') && cells[0] !== 'Step') {
      const stepNum = parseInt(cells[0]);
      if (!isNaN(stepNum)) {
        if (hasNodeIdColumn) {
          // New format: Step | Node ID | Screen Type | Question/Content | Action | Expected Next
          steps.push({
            stepNumber: stepNum,
            nodeId: cells[1] || undefined,
            screenType: cells[2] || '',
            questionContent: cells[3] || '',
            action: cells[4] || '',
            expectedNext: cells[5] || ''
          });
        } else {
          // Old format: Step | Screen Type | Question/Content | Action | Expected Next
          steps.push({
            stepNumber: stepNum,
            screenType: cells[1] || '',
            questionContent: cells[2] || '',
            action: cells[3] || '',
            expectedNext: cells[4] || ''
          });
        }
      }
    }
  }
  
  return steps;
}

function extractPathInfo(pathSection: string): Partial<TestPath> {
  const pathMatch = pathSection.match(/Path (\d+) of (\d+):\s*(.+?)(?:\*\*|$)/m);
  const outcomeMatch = pathSection.match(/\*\*Expected Outcome\*\*:\s*(.+?)(?:\n|$)/i) || 
                       pathSection.match(/Expected Outcome[:\s]*(.+?)(?:\n|$)/i);
  
  const checklistItems: string[] = [];
  const checklistMatches = pathSection.match(/- \[[\s\]]*\]\s*([^\n]+)/g);
  if (checklistMatches) {
    checklistMatches.forEach(item => {
      const text = item.replace(/- \[[\s\]]*\]\s*/, '').trim();
      if (text) checklistItems.push(text);
    });
  }

  return {
    pathNumber: pathMatch ? parseInt(pathMatch[1]) : 0,
    totalPaths: pathMatch ? parseInt(pathMatch[2]) : 0,
    pathDescription: pathMatch ? pathMatch[3].trim() : '',
    expectedOutcome: outcomeMatch ? outcomeMatch[1].trim() : '',
    checklist: checklistItems
  };
}

function extractSummary(content: string): ParsedTestScript['summary'] {
  const summary = {
    totalPaths: 0,
    successPaths: 0,
    completionPaths: 0,
    endPaths: 0,
    deadEndPaths: 0
  };

  const totalMatch = content.match(/Total Paths[|\s]*(\d+)/i);
  const successMatch = content.match(/Success Paths[|\s]*(\d+)/i);
  const completionMatch = content.match(/Completion Paths[|\s]*(\d+)/i);
  const endMatch = content.match(/End Paths[|\s]*(\d+)/i);
  const deadEndMatch = content.match(/Dead End Paths[|\s]*(\d+)/i);

  if (totalMatch) summary.totalPaths = parseInt(totalMatch[1]);
  if (successMatch) summary.successPaths = parseInt(successMatch[1]);
  if (completionMatch) summary.completionPaths = parseInt(completionMatch[1]);
  if (endMatch) summary.endPaths = parseInt(endMatch[1]);
  if (deadEndMatch) summary.deadEndPaths = parseInt(deadEndMatch[1]);

  return summary;
}

export function parseTestScript(content: string): TestScriptParseResult {
  try {
    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      return {
        success: false,
        error: 'HTML format detected. Please export the test script in Markdown (.md) format for reliable parsing.'
      };
    }

    const flowNameMatch = content.match(/# Flow Test Script:\s*(.+?)(?:\n|$)/i) ||
                          content.match(/# (.+?)(?:\n|$)/);
    
    const dateMatch = content.match(/\*\*Generated\*\*:\s*(.+?)(?:\n|$)/i) ||
                      content.match(/Generated[:\s]*(.+?)(?:\n|$)/i);
    const totalPathsMatch = content.match(/\*\*Total Paths\*\*:\s*(\d+)/i) ||
                            content.match(/Total Paths[:\s]*(\d+)/i);
    const timeMatch = content.match(/\*\*Estimated Testing Time\*\*:\s*(.+?)(?:\n|$)/i) ||
                      content.match(/Estimated Testing Time[:\s]*(.+?)(?:\n|$)/i);

    const flowName = flowNameMatch ? flowNameMatch[1].replace('Flow Test Script:', '').trim() : 'Unknown Flow';
    const generatedDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
    const totalPaths = totalPathsMatch ? parseInt(totalPathsMatch[1]) : 0;
    const estimatedTime = timeMatch ? timeMatch[1].trim() : 'Unknown';

    const paths: TestPath[] = [];
    const pathSections = content.split(/(?=## Path \d+ of \d+|### Path \d+ of \d+)/i);
    
    for (const section of pathSections) {
      if (section.match(/##+ Path \d+ of \d+/i)) {
        const pathInfo = extractPathInfo(section);
        const steps = parseMarkdownTableRows(section);
        
        if (steps.length > 0) {
          paths.push({
            pathNumber: pathInfo.pathNumber || paths.length + 1,
            totalPaths: pathInfo.totalPaths || totalPaths,
            pathDescription: pathInfo.pathDescription || '',
            expectedOutcome: pathInfo.expectedOutcome || 'Unknown',
            steps,
            checklist: pathInfo.checklist || []
          });
        }
      }
    }

    if (paths.length === 0) {
      return {
        success: false,
        error: 'No test paths found. Please ensure the test script is in Markdown format with "## Path X of Y" headings and tables with Step | Screen Type | Question/Content | Action | Expected Next columns.'
      };
    }

    const summary = extractSummary(content);

    return {
      success: true,
      testScript: {
        flowName,
        generatedDate,
        totalPaths: paths.length,
        estimatedTime,
        paths,
        summary
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse test script'
    };
  }
}

export function matchFlowToTestScript(flows: { name: string; slug: string }[], testScriptFlowName: string): { name: string; slug: string } | null {
  const normalizedTestName = testScriptFlowName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const flow of flows) {
    const normalizedFlowName = flow.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedFlowName === normalizedTestName || 
        normalizedFlowName.includes(normalizedTestName) || 
        normalizedTestName.includes(normalizedFlowName)) {
      return flow;
    }
  }
  
  return null;
}
