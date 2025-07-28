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
  const quotesUrl = `${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/quotes/${legalRequest.requestNumber}`;
  
  return {
    requestNumber: legalRequest.requestNumber,
    firstName: legalRequest.firstName,
    lastName: legalRequest.lastName,
    email: legalRequest.email,
    phoneNumber: legalRequest.phoneNumber || 'Not provided',
    caseType: caseTypeData?.label || legalRequest.caseType,
    caseDescription: legalRequest.caseDescription,
    location: legalRequest.location || 'Not specified',
    quotesUrl: quotesUrl,
    quotesButton: `<div style="text-align: center; margin: 30px 0;">
      <a href="${quotesUrl}" 
         style="background-color: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
        View Your Quotes & Request Status
      </a>
    </div>`
  };
}

/**
 * Get template variables for attorney assignment
 */
export async function getAttorneyAssignmentVariables(
  attorney: any,
  legalRequest: any,
  caseTypeData?: any,
  feeSchedule?: any
): Promise<TemplateVariables> {
  // Format quote amount
  const formatQuoteAmount = (fee: number): string => {
    return `$${(fee / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Default quote description
  const defaultQuoteDescription = `I'll provide comprehensive immigration services for your ${caseTypeData?.label || legalRequest.caseType}. My approach includes thorough document review, strategic planning, and personalized guidance throughout the process. With ${attorney.yearsOfExperience || 8} years of experience, I'm confident in delivering excellent results within your timeline.`;

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
    location: legalRequest.location || 'Not specified',
    // Quote information variables
    quoteAmount: feeSchedule ? formatQuoteAmount(feeSchedule.fee) : '$1,250.00',
    timeline: '14 days',
    quoteDescription: feeSchedule?.notes || defaultQuoteDescription
  };
}