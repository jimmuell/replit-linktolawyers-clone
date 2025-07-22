interface LegalRequestData {
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  caseType: string;
  caseDescription: string;
  location: string | null;
}

interface CaseType {
  value: string;
  label: string;
  description: string;
}

export function generateConfirmationEmail(requestData: LegalRequestData, caseTypeData?: CaseType) {
  const { requestNumber, firstName, lastName, email, phoneNumber, caseType, caseDescription, location } = requestData;
  
  const caseTypeDisplay = caseTypeData?.label || caseType;
  
  const subject = `Legal Request Confirmation - ${requestNumber}`;
  
  const emailBody = `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 25px; }
    .section h3 { color: #1e40af; margin-bottom: 10px; font-size: 18px; }
    .info-grid { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .info-row { display: flex; margin-bottom: 12px; }
    .info-label { font-weight: bold; width: 140px; color: #374151; }
    .info-value { color: #1f2937; }
    .request-number { background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; margin: 20px 0; }
    .next-steps { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Legal Request Confirmation</h1>
      <p>Thank you for choosing LinkToLawyers</p>
    </div>
    
    <div class="content">
      <div class="request-number">
        <strong>Request Number: ${requestNumber}</strong>
      </div>
      
      <div class="section">
        <p>Dear ${firstName} ${lastName},</p>
        <p>Thank you for submitting your legal request. We have received your information and will begin processing your request immediately.</p>
      </div>
      
      <div class="section">
        <h3>Request Summary</h3>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${firstName} ${lastName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${email}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Phone:</div>
            <div class="info-value">${phoneNumber || 'Not provided'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Case Type:</div>
            <div class="info-value">${caseTypeDisplay}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Location:</div>
            <div class="info-value">${location || 'Not specified'}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h3>Case Description</h3>
        <div class="info-grid">
          <p style="margin: 0;">${caseDescription}</p>
        </div>
      </div>
      
      <div class="section">
        <div class="next-steps">
          <h3 style="margin-top: 0;">Next Steps</h3>
          <ol>
            <li><strong>Review Period:</strong> Our legal team will review your request within 24-48 hours</li>
            <li><strong>Attorney Matching:</strong> We'll match you with qualified attorneys based on your case type and location</li>
            <li><strong>Initial Consultation:</strong> Selected attorneys will contact you to schedule a consultation</li>
            <li><strong>Quote Comparison:</strong> You'll receive quotes from multiple attorneys to compare</li>
            <li><strong>Selection:</strong> Choose the attorney that best fits your needs and budget</li>
          </ol>
          <p><strong>Important:</strong> Keep your request number (${requestNumber}) for reference when communicating with our team.</p>
        </div>
      </div>
      
      <div class="section">
        <h3>Contact Information</h3>
        <div class="info-grid">
          <p>If you have any questions or need to update your request, please contact us:</p>
          <p><strong>Email:</strong> support@linkto.lawyers<br>
          <strong>Phone:</strong> 1-800-LINK-LAW<br>
          <strong>Hours:</strong> Monday-Friday, 9AM-6PM EST</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated confirmation email. Please do not reply to this message.</p>
        <p>&copy; 2025 LinkToLawyers. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
  
  // Generate plain text version
  const plainTextBody = `
Legal Request Confirmation - ${requestNumber}

Dear ${firstName} ${lastName},

Thank you for submitting your legal request. We have received your information and will begin processing your request immediately.

REQUEST SUMMARY:
- Request Number: ${requestNumber}
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phoneNumber || 'Not provided'}
- Case Type: ${caseTypeDisplay}
- Location: ${location || 'Not specified'}

CASE DESCRIPTION:
${caseDescription}

NEXT STEPS:
1. Review Period: Our legal team will review your request within 24-48 hours
2. Attorney Matching: We'll match you with qualified attorneys based on your case type and location
3. Initial Consultation: Selected attorneys will contact you to schedule a consultation
4. Quote Comparison: You'll receive quotes from multiple attorneys to compare
5. Selection: Choose the attorney that best fits your needs and budget

Important: Keep your request number (${requestNumber}) for reference when communicating with our team.

CONTACT INFORMATION:
If you have any questions or need to update your request, please contact us:
Email: support@linkto.lawyers
Phone: 1-800-LINK-LAW
Hours: Monday-Friday, 9AM-6PM EST

This is an automated confirmation email. Please do not reply to this message.

© 2025 LinkToLawyers. All rights reserved.
  `.trim();
  
  return {
    subject,
    html: emailBody,
    text: plainTextBody
  };
}