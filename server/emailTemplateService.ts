import { storage } from './storage';
import type { EmailTemplate } from '@shared/schema';

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ProcessedTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Process template variables in content
 */
function processTemplateVariables(content: string, variables: TemplateVariables): string {
  let processedContent = content;
  
  // Replace {{variableName}} with actual values
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const replacement = value !== null && value !== undefined ? String(value) : '';
    processedContent = processedContent.replace(regex, replacement);
  }
  
  return processedContent;
}

/**
 * Get and process email template for production use
 */
export async function getProcessedTemplate(
  templateType: string,
  variables: TemplateVariables
): Promise<ProcessedTemplate | null> {
  try {
    // Get production template by type
    const templates = await storage.getEmailTemplatesByType(templateType);
    const productionTemplate = templates.find(t => t.useInProduction && t.isActive);
    
    if (!productionTemplate) {
      console.log(`No production template found for type: ${templateType}`);
      return null;
    }
    
    // Process variables in all content
    const processedSubject = processTemplateVariables(productionTemplate.subject, variables);
    const processedHtml = processTemplateVariables(productionTemplate.htmlContent, variables);
    const processedText = productionTemplate.textContent 
      ? processTemplateVariables(productionTemplate.textContent, variables)
      : '';
    
    return {
      subject: processedSubject,
      html: processedHtml,
      text: processedText
    };
  } catch (error) {
    console.error('Error processing email template:', error);
    return null;
  }
}

/**
 * Get template variables for legal request confirmation
 */
export function getLegalRequestConfirmationVariables(legalRequest: any, caseTypeData?: any): TemplateVariables {
  return {
    requestNumber: legalRequest.requestNumber,
    firstName: legalRequest.firstName,
    lastName: legalRequest.lastName,
    email: legalRequest.email,
    phoneNumber: legalRequest.phoneNumber || 'Not provided',
    caseType: caseTypeData?.label || legalRequest.caseType,
    caseDescription: legalRequest.caseDescription,
    urgencyLevel: legalRequest.urgencyLevel || 'Not specified',
    budgetRange: legalRequest.budgetRange || 'Not specified',
    location: legalRequest.location || 'Not specified'
  };
}

/**
 * Get template variables for attorney assignment
 */
export function getAttorneyAssignmentVariables(
  attorney: any,
  legalRequest: any,
  caseTypeData?: any
): TemplateVariables {
  return {
    attorneyFirstName: attorney.firstName,
    attorneyLastName: attorney.lastName,
    requestNumber: legalRequest.requestNumber,
    clientFirstName: legalRequest.firstName,
    clientLastName: legalRequest.lastName,
    clientEmail: legalRequest.email,
    clientPhone: legalRequest.phoneNumber || 'Not provided',
    caseType: caseTypeData?.label || legalRequest.caseType,
    caseDescription: legalRequest.caseDescription,
    status: legalRequest.status || 'under_review',
    submittedDate: new Date(legalRequest.createdAt).toLocaleDateString(),
    budgetRange: legalRequest.budgetRange || 'Not specified',
    urgencyLevel: legalRequest.urgencyLevel || 'Not specified',
    location: legalRequest.location || 'Not specified'
  };
}