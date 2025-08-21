import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertUserSchema, loginSchema, insertCaseTypeSchema, insertLegalRequestSchema, insertSmtpSettingsSchema, sendEmailSchema, insertAttorneySchema, insertAttorneyFeeScheduleSchema, insertRequestAttorneyAssignmentSchema, insertBlogPostSchema, insertEmailTemplateSchema, updateEmailTemplateSchema, insertChatbotPromptSchema, type User, type ChatbotPrompt, type InsertChatbotPrompt } from "@shared/schema";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { getProcessedTemplate, getLegalRequestConfirmationVariables, getAttorneyAssignmentVariables } from "./emailTemplateService";
import { generateConfirmationEmail } from "../client/src/lib/emailTemplates";
import { setSession, getSession, removeSession, requireAuth, requireRole } from "./middleware/auth";
import attorneyReferralsRouter from "./routes/attorney-referrals";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Generate legal request number
function generateRequestNumber(): string {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `lr-${randomNumber}`;
}

// Function to create a legal request from chat conversation data
async function createLegalRequestFromConversation(conversationId: string, summaryContent: string) {
  try {
    // Get conversation to find the title which should contain the user's name
    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get all messages from the conversation to extract user information
    const messages = await storage.getMessagesByConversationId(conversationId);
    
    // Find the initial intake message to extract user details
    const intakeMessage = messages.find(msg => 
      msg.role === 'user' && 
      msg.content.includes('Hello, my name is') && 
      msg.content.includes('I need help with')
    );

    if (!intakeMessage) {
      console.log('No intake message found - skipping legal request creation');
      return;
    }

    // Extract information from the intake message
    const nameMatch = intakeMessage.content.match(/my name is ([^,and]+)/i);
    const emailMatch = intakeMessage.content.match(/my email is ([^\s,]+)/i);
    const phoneMatch = intakeMessage.content.match(/my phone number is ([^\s,]+)/i);
    const locationMatch = intakeMessage.content.match(/I am located in ([^.]+)/i);
    const caseTypeMatch = intakeMessage.content.match(/I need help with ([^.]+)/i);

    if (!nameMatch || !emailMatch || !caseTypeMatch) {
      console.log('Missing required information from intake message');
      return;
    }

    // Parse the name (assume "First Last" format)
    const fullName = nameMatch[1].trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const email = emailMatch[1].trim();
    const phoneNumber = phoneMatch ? phoneMatch[1].trim() : undefined;
    const location = locationMatch ? locationMatch[1].trim() : undefined;
    const caseType = caseTypeMatch[1].trim();

    // Parse city and state from location if available
    let city = undefined;
    let state = undefined;
    
    if (location) {
      // Handle formats like "City, State" or "City, ST"
      const locationParts = location.split(',').map(part => part.trim());
      if (locationParts.length >= 2) {
        city = locationParts[0];
        state = locationParts[1];
      } else {
        // If only one part, assume it's city
        city = locationParts[0];
      }
    }

    // Use the summary content as the case description
    const caseDescription = summaryContent;

    // Generate request number
    const requestNumber = generateRequestNumber();

    // Create the legal request
    const legalRequestData = {
      requestNumber,
      firstName,
      lastName,
      email,
      phoneNumber,
      caseType,
      caseDescription,
      location,
      city,
      state,
      agreeToTerms: true, // Assume they agree by using the chat system
      status: 'under_review'
    };

    const legalRequest = await storage.createLegalRequest(legalRequestData);
    console.log(`✅ Legal request created automatically: ${requestNumber} for ${fullName}`);

    return legalRequest;

  } catch (error) {
    console.error('Error creating legal request from conversation:', error);
    throw error;
  }
}

// Email rate limiting
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 emails per windowMs
  message: { message: 'Too many emails sent, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// SMTP transporter creation (fallback for non-Resend configurations)
async function createTransporter() {
  const settings = await storage.getSmtpSettings();
  if (!settings) {
    throw new Error('No SMTP settings found. Please configure SMTP settings first.');
  }
  
  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // Only secure for port 465
    requireTLS: settings.smtpPort === 2525 || settings.smtpPort === 587,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
}

// Email sending function that uses Resend API when configured
async function sendEmail(to: string, subject: string, html: string, text?: string) {
  const settings = await storage.getSmtpSettings();
  if (!settings) {
    throw new Error('No SMTP settings found. Please configure SMTP settings first.');
  }

  // Use Resend API if configured for Resend
  if (settings.smtpHost === 'smtp.resend.com' && process.env.RESEND_API_KEY) {
    try {
      console.log('📧 Sending email via Resend API...');
      console.log('From:', `${settings.fromName} <${settings.fromEmail}>`);
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('API Key exists:', !!process.env.RESEND_API_KEY);
      console.log('API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
      
      const data = await resend.emails.send({
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: [to],
        subject,
        html,
        text,
      });
      
      console.log('✅ Resend API response:', {
        id: data.data?.id,
        status: data.error ? 'error' : 'success',
        error: data.error
      });
      
      if (data.error) {
        throw new Error(`Resend API error: ${JSON.stringify(data.error)}`);
      }
      
      return { messageId: data.data?.id || 'resend-success', success: true };
    } catch (error: any) {
      console.error('❌ Resend API error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, 500)
      });
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
  
  // Fallback to SMTP for other providers
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
  return { messageId: info.messageId, success: true };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount attorney referrals routes
  app.use('/api/attorney-referrals', attorneyReferralsRouter);

  // Authentication middleware (local version for backwards compatibility)
  const localRequireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const session = getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = session;
    next();
  };

  const requireAdmin = requireRole(['admin']);

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: 'Registration failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      const sessionId = Math.random().toString(36).substring(2, 15);
      setSession(sessionId, { userId: user.id, role: user.role });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, sessionId });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: 'Login failed' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      removeSession(sessionId);
    }
    res.json({ success: true });
  });

  // Get current user
  app.get('/api/auth/me', localRequireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Case Types API routes
  // Public endpoint for client-side dropdown
  app.get("/api/case-types", async (req, res) => {
    try {
      const caseTypes = await storage.getAllCaseTypes();
      const language = req.query.lang as string || 'en';
      
      // Transform case types based on language
      const transformedCaseTypes = caseTypes.map(caseType => ({
        ...caseType,
        label: language === 'es' && caseType.labelEs ? caseType.labelEs : caseType.label,
        description: language === 'es' && caseType.descriptionEs ? caseType.descriptionEs : caseType.description
      }));
      
      res.json({ success: true, data: transformedCaseTypes });
    } catch (error) {
      console.error("Error fetching case types:", error);
      res.status(500).json({ success: false, error: "Failed to fetch case types" });
    }
  });

  // Admin endpoints for case type management
  app.get("/api/admin/case-types", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const caseTypes = await storage.getAllCaseTypes();
      res.json(caseTypes);
    } catch (error) {
      console.error("Error fetching case types:", error);
      res.status(500).json({ error: "Failed to fetch case types" });
    }
  });

  app.post("/api/admin/case-types", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertCaseTypeSchema.parse(req.body);
      const caseType = await storage.createCaseType(validatedData);
      res.json(caseType);
    } catch (error) {
      console.error("Error creating case type:", error);
      res.status(500).json({ error: "Failed to create case type" });
    }
  });

  app.put("/api/admin/case-types/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCaseTypeSchema.partial().parse(req.body);
      const caseType = await storage.updateCaseType(id, validatedData);
      res.json(caseType);
    } catch (error) {
      console.error("Error updating case type:", error);
      res.status(500).json({ error: "Failed to update case type" });
    }
  });

  app.delete("/api/admin/case-types/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCaseType(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting case type:", error);
      res.status(500).json({ error: "Failed to delete case type" });
    }
  });

  // Legal Request API routes
  app.post("/api/legal-requests", async (req, res) => {
    try {
      // Use the request number from the frontend, or generate one if not provided
      const requestNumber = req.body.requestNumber || generateRequestNumber();
      const validatedData = insertLegalRequestSchema.parse({
        ...req.body,
        requestNumber
      });
      
      const legalRequest = await storage.createLegalRequest(validatedData);
      res.json({ success: true, data: legalRequest });
    } catch (error) {
      console.error("Error creating legal request:", error);
      res.status(500).json({ success: false, error: "Failed to create legal request" });
    }
  });

  // Send confirmation email for legal request
  app.post("/api/legal-requests/:requestNumber/send-confirmation", async (req, res) => {
    try {
      const { requestNumber } = req.params;
      const { emailTemplate, overrideEmail } = req.body;
      
      // Get the legal request to find the recipient email
      const legalRequest = await storage.getLegalRequestByNumber(requestNumber);
      if (!legalRequest) {
        return res.status(404).json({ success: false, error: "Legal request not found" });
      }
      
      // Get SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings) {
        return res.status(500).json({ success: false, error: "SMTP not configured" });
      }
      
      // Use override email if provided, otherwise use the legal request email
      const recipientEmail = overrideEmail || legalRequest.email;
      
      let finalEmailTemplate = emailTemplate;
      
      // Try to get production template from database first
      if (!emailTemplate || !emailTemplate.html || !emailTemplate.subject) {
        // Get case type data for better template processing
        const caseTypeData = await storage.getCaseTypeByValue(legalRequest.caseType);
        
        // Get template variables for legal request confirmation
        const templateVariables = getLegalRequestConfirmationVariables(legalRequest, caseTypeData);
        
        // Get processed template from database
        const processedTemplate = await getProcessedTemplate('legal_request_confirmation', templateVariables);
        
        if (processedTemplate) {
          finalEmailTemplate = {
            subject: processedTemplate.subject,
            html: processedTemplate.html,
            text: processedTemplate.text
          };
        } else {
          // Fallback to hardcoded template
          const fallbackTemplate = generateConfirmationEmail(legalRequest, caseTypeData);
          finalEmailTemplate = {
            subject: fallbackTemplate.subject,
            html: fallbackTemplate.html,
            text: fallbackTemplate.text
          };
        }
      }
      
      try {
        const result = await sendEmail(
          recipientEmail,
          finalEmailTemplate.subject,
          finalEmailTemplate.html,
          finalEmailTemplate.text || ''
        );
        
        // Store successful email in history
        await storage.createEmailHistory({
          toAddress: recipientEmail,
          subject: finalEmailTemplate.subject,
          message: finalEmailTemplate.html,
          status: 'sent',
          errorMessage: null,
        });

        res.json({ 
          success: true, 
          message: "Confirmation email sent successfully",
          messageId: result.messageId 
        });
      } catch (emailError: any) {
        // Store failed email in history
        await storage.createEmailHistory({
          toAddress: recipientEmail,
          subject: finalEmailTemplate.subject,
          message: finalEmailTemplate.html,
          status: 'failed',
          errorMessage: emailError.message,
        });

        res.status(500).json({ 
          success: false, 
          error: `Failed to send email: ${emailError.message}` 
        });
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      res.status(500).json({ success: false, error: "Failed to send confirmation email" });
    }
  });

  // Send Spanish confirmation email for legal request
  app.post("/api/legal-requests/:requestNumber/send-confirmation-spanish", async (req, res) => {
    try {
      const { requestNumber } = req.params;
      const { overrideEmail } = req.body;
      
      // Get the legal request to find the recipient email
      const legalRequest = await storage.getLegalRequestByNumber(requestNumber);
      if (!legalRequest) {
        return res.status(404).json({ success: false, error: "Legal request not found" });
      }
      
      // Get SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings) {
        return res.status(500).json({ success: false, error: "SMTP not configured" });
      }
      
      // Use override email if provided, otherwise use the legal request email
      const recipientEmail = overrideEmail || legalRequest.email;
      
      // Get case type data for better template processing
      const caseTypeData = await storage.getCaseTypeByValue(legalRequest.caseType);
      
      // Get template variables for Spanish legal request confirmation
      const templateVariables = getLegalRequestConfirmationVariables(legalRequest, caseTypeData);
      
      // Get processed Spanish template from database
      const processedTemplate = await getProcessedTemplate('legal_request_confirmation_spanish', templateVariables);
      
      if (!processedTemplate) {
        return res.status(500).json({ success: false, error: "Spanish confirmation template not found" });
      }
      
      const finalEmailTemplate = {
        subject: processedTemplate.subject,
        html: processedTemplate.html,
        text: processedTemplate.text
      };
      
      try {
        const result = await sendEmail(
          recipientEmail,
          finalEmailTemplate.subject,
          finalEmailTemplate.html,
          finalEmailTemplate.text || ''
        );
        
        // Store successful email in history
        await storage.createEmailHistory({
          toAddress: recipientEmail,
          subject: finalEmailTemplate.subject,
          message: finalEmailTemplate.html,
          status: 'sent',
          errorMessage: null,
        });

        res.json({ 
          success: true, 
          message: "Spanish confirmation email sent successfully",
          messageId: result.messageId 
        });
      } catch (emailError: any) {
        // Store failed email in history
        await storage.createEmailHistory({
          toAddress: recipientEmail,
          subject: finalEmailTemplate.subject,
          message: finalEmailTemplate.html,
          status: 'failed',
          errorMessage: emailError.message,
        });

        res.status(500).json({ 
          success: false, 
          error: `Failed to send Spanish email: ${emailError.message}` 
        });
      }
    } catch (error) {
      console.error("Error sending Spanish confirmation email:", error);
      res.status(500).json({ success: false, error: "Failed to send Spanish confirmation email" });
    }
  });

  // Public endpoint to get all legal requests (for dropdown in track request modal)
  app.get('/api/legal-requests/public', async (req, res) => {
    try {
      console.log('Fetching public legal requests...');
      const requests = await storage.getAllLegalRequests();
      console.log('Found requests:', requests.length);
      
      // Only return basic info needed for dropdown (no sensitive data)
      const publicRequests = requests.map(req => ({
        id: req.id,
        requestNumber: req.requestNumber,
        firstName: req.firstName,
        lastName: req.lastName,
        caseType: req.caseType,
        status: req.status,
        createdAt: req.createdAt
      }));
      
      res.json({ success: true, data: publicRequests });
    } catch (error) {
      console.error('Error fetching public legal requests:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch legal requests' });
    }
  });

  app.get("/api/legal-requests/:requestNumber", async (req, res) => {
    try {
      const requestNumber = req.params.requestNumber;
      const legalRequest = await storage.getLegalRequestByNumber(requestNumber);
      
      if (!legalRequest) {
        return res.status(404).json({ success: false, error: "Legal request not found" });
      }
      
      res.json({ success: true, data: legalRequest });
    } catch (error) {
      console.error("Error fetching legal request:", error);
      res.status(500).json({ success: false, error: "Failed to fetch legal request" });
    }
  });

  // Get all legal requests (for admin)
  app.get("/api/legal-requests", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const legalRequests = await storage.getAllLegalRequests();
      res.json(legalRequests);
    } catch (error) {
      console.error("Error fetching legal requests:", error);
      res.status(500).json({ success: false, error: "Failed to fetch legal requests" });
    }
  });

  // Update legal request
  app.put("/api/legal-requests/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLegalRequestSchema.partial().parse(req.body);
      const legalRequest = await storage.updateLegalRequest(id, validatedData);
      res.json(legalRequest);
    } catch (error) {
      console.error("Error updating legal request:", error);
      res.status(500).json({ success: false, error: "Failed to update legal request" });
    }
  });

  // Delete legal request
  app.delete("/api/legal-requests/:id", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLegalRequest(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting legal request:", error);
      res.status(500).json({ success: false, error: "Failed to delete legal request" });
    }
  });

  app.get("/api/admin/legal-requests", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const legalRequests = await storage.getAllLegalRequests();
      res.json({ success: true, data: legalRequests });
    } catch (error) {
      console.error("Error fetching legal requests:", error);
      res.status(500).json({ success: false, error: "Failed to fetch legal requests" });
    }
  });

  // Admin only routes
  app.get('/api/admin/users', requireAuth, requireRole(['admin']), async (req, res) => {
    // This would get all users - implement as needed
    res.json({ message: 'Admin users endpoint' });
  });

  // SMTP Configuration routes
  app.get('/api/smtp/settings', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const settings = await storage.getSmtpSettings();
      if (!settings) {
        return res.status(404).json({ error: 'No SMTP settings found' });
      }
      // Don't send password in response
      const { password, ...settingsWithoutPassword } = settings;
      res.json(settingsWithoutPassword);
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
      res.status(500).json({ error: 'Failed to fetch SMTP settings' });
    }
  });

  app.post('/api/smtp/settings', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertSmtpSettingsSchema.parse(req.body);
      
      // Check if settings already exist
      const existingSettings = await storage.getSmtpSettings();
      let settings;
      
      if (existingSettings) {
        // Update existing settings
        settings = await storage.updateSmtpSettings(existingSettings.id, validatedData);
      } else {
        // Create new settings
        settings = await storage.createSmtpSettings(validatedData);
      }
      
      // Don't send password in response
      const { password, ...settingsWithoutPassword } = settings;
      res.json(settingsWithoutPassword);
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      res.status(500).json({ error: 'Failed to save SMTP settings' });
    }
  });

  // Test SMTP/Resend connection
  app.post('/api/smtp/test', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const settings = await storage.getSmtpSettings();
      if (!settings) {
        return res.status(400).json({ error: 'No SMTP settings found' });
      }

      // Test Resend API if configured for Resend
      if (settings.smtpHost === 'smtp.resend.com' && process.env.RESEND_API_KEY) {
        try {
          // Test by sending a simple test email to validate the API key
          const testResult = await sendEmail(
            settings.fromEmail,
            'Resend Connection Test',
            '<p>This is a test email to verify Resend API configuration.</p>',
            'This is a test email to verify Resend API configuration.'
          );
          res.json({ message: 'Resend connection successful', status: 'connected' });
        } catch (error: any) {
          res.status(500).json({ 
            message: 'Resend connection failed', 
            error: error?.message || 'Unknown error',
            status: 'failed'
          });
        }
      } else {
        // Test SMTP connection for other providers
        const transporter = await createTransporter();
        await transporter.verify();
        res.json({ message: 'SMTP connection successful', status: 'connected' });
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      res.status(500).json({ 
        message: 'Connection test failed', 
        error: error?.message || 'Unknown error',
        status: 'failed'
      });
    }
  });

  // Send email route
  app.post('/api/email/send', emailLimiter, requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = sendEmailSchema.parse(req.body);
      try {
        const result = await sendEmail(
          validatedData.to,
          validatedData.subject,
          validatedData.message.replace(/\n/g, '<br>'),
          validatedData.message
        );
        
        // Store successful email in history
        await storage.createEmailHistory({
          toAddress: validatedData.to,
          subject: validatedData.subject,
          message: validatedData.message,
          status: 'sent',
          errorMessage: null,
        });

        res.json({ 
          message: 'Email sent successfully',
          messageId: result.messageId 
        });
      } catch (error: any) {
        // Store failed email in history
        await storage.createEmailHistory({
          toAddress: validatedData.to,
          subject: validatedData.subject,
          message: validatedData.message,
          status: 'failed',
          errorMessage: error?.message || 'Unknown error',
        });

        res.status(500).json({ 
          message: 'Failed to send email',
          error: error?.message || 'Unknown error'
        });
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      res.status(400).json({ 
        message: 'Invalid email data',
        error: error?.message || 'Unknown error'
      });
    }
  });

  // Get email history
  app.get('/api/email/history', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const history = await storage.getAllEmailHistory();
      res.json(history);
    } catch (error) {
      console.error('Error fetching email history:', error);
      res.status(500).json({ error: 'Failed to fetch email history' });
    }
  });

  // Attorney Management Routes
  // Create attorney
  app.post('/api/attorneys', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const attorneyData = insertAttorneySchema.parse(req.body);
      const attorney = await storage.createAttorney(attorneyData);
      res.json(attorney);
    } catch (error) {
      console.error('Error creating attorney:', error);
      res.status(400).json({ error: 'Failed to create attorney' });
    }
  });

  // Get all attorneys
  app.get('/api/attorneys', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const attorneys = await storage.getAllAttorneys();
      res.json(attorneys);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      res.status(500).json({ error: 'Failed to fetch attorneys' });
    }
  });

  // Get attorney by ID
  app.get('/api/attorneys/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const attorney = await storage.getAttorney(parseInt(req.params.id));
      if (!attorney) {
        return res.status(404).json({ error: 'Attorney not found' });
      }
      res.json(attorney);
    } catch (error) {
      console.error('Error fetching attorney:', error);
      res.status(500).json({ error: 'Failed to fetch attorney' });
    }
  });

  // Update attorney
  app.put('/api/attorneys/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const attorneyData = insertAttorneySchema.partial().parse(req.body);
      const attorney = await storage.updateAttorney(parseInt(req.params.id), attorneyData);
      res.json(attorney);
    } catch (error) {
      console.error('Error updating attorney:', error);
      res.status(400).json({ error: 'Failed to update attorney' });
    }
  });

  // Delete attorney
  app.delete('/api/attorneys/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      await storage.deleteAttorney(parseInt(req.params.id));
      res.json({ message: 'Attorney deleted successfully' });
    } catch (error) {
      console.error('Error deleting attorney:', error);
      res.status(500).json({ error: 'Failed to delete attorney' });
    }
  });

  // Attorney Fee Schedule Routes
  // Create attorney fee schedule entry
  app.post('/api/attorney-fee-schedule', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeScheduleData = insertAttorneyFeeScheduleSchema.parse(req.body);
      const feeSchedule = await storage.createAttorneyFeeSchedule(feeScheduleData);
      res.json(feeSchedule);
    } catch (error) {
      console.error('Error creating attorney fee schedule:', error);
      res.status(400).json({ error: 'Failed to create attorney fee schedule' });
    }
  });

  // Get all attorney fee schedules
  app.get('/api/attorney-fee-schedule', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeSchedules = await storage.getAllAttorneyFeeSchedules();
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error fetching attorney fee schedules:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedules' });
    }
  });

  // Get attorney fee schedule by attorney ID
  app.get('/api/attorney-fee-schedule/attorney/:attorneyId', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeSchedules = await storage.getAttorneyFeeScheduleByAttorney(parseInt(req.params.attorneyId));
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error fetching attorney fee schedule:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedule' });
    }
  });

  // Get specific attorney fee schedule by attorney and case type
  app.get('/api/attorney-fee-schedule/attorney/:attorneyId/case-type/:caseTypeId', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeSchedule = await storage.getAttorneyFeeScheduleByAttorneyAndCaseType(
        parseInt(req.params.attorneyId),
        parseInt(req.params.caseTypeId)
      );
      if (!feeSchedule) {
        return res.status(404).json({ error: 'Fee schedule not found' });
      }
      res.json(feeSchedule);
    } catch (error) {
      console.error('Error fetching attorney fee schedule:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedule' });
    }
  });

  // Update attorney fee schedule
  app.put('/api/attorney-fee-schedule/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeScheduleData = insertAttorneyFeeScheduleSchema.partial().parse(req.body);
      const feeSchedule = await storage.updateAttorneyFeeSchedule(parseInt(req.params.id), feeScheduleData);
      res.json(feeSchedule);
    } catch (error) {
      console.error('Error updating attorney fee schedule:', error);
      res.status(400).json({ error: 'Failed to update attorney fee schedule' });
    }
  });

  // Delete attorney fee schedule
  app.delete('/api/attorney-fee-schedule/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      await storage.deleteAttorneyFeeSchedule(parseInt(req.params.id));
      res.json({ message: 'Attorney fee schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting attorney fee schedule:', error);
      res.status(500).json({ error: 'Failed to delete attorney fee schedule' });
    }
  });

  // Bulk create attorney fee schedules
  app.post('/api/attorney-fee-schedule/bulk', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const feeSchedulesData = req.body.map((item: any) => insertAttorneyFeeScheduleSchema.parse(item));
      const feeSchedules = await storage.bulkCreateAttorneyFeeSchedules(feeSchedulesData);
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error bulk creating attorney fee schedules:', error);
      res.status(400).json({ error: 'Failed to bulk create attorney fee schedules' });
    }
  });

  // ========== REQUEST ATTORNEY ASSIGNMENT ROUTES ==========

  // Get attorneys by case type for assignment
  app.get('/api/attorneys/case-type/:caseType', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const attorneys = await storage.getAttorneysByCaseType(req.params.caseType);
      res.json(attorneys);
    } catch (error) {
      console.error('Error fetching attorneys by case type:', error);
      res.status(500).json({ error: 'Failed to fetch attorneys' });
    }
  });

  // Public endpoint to get attorneys by case type (for QuotesPage)
  app.get('/api/public/attorneys/case-type/:caseType', async (req, res) => {
    try {
      const attorneys = await storage.getAttorneysByCaseType(req.params.caseType);
      res.json(attorneys);
    } catch (error) {
      console.error('Error fetching attorneys by case type:', error);
      res.status(500).json({ error: 'Failed to fetch attorneys' });
    }
  });

  // Public endpoint to get attorney fee schedules for specific attorneys and case type
  app.get('/api/public/attorney-fee-schedules/:attorneyIds/:caseType', async (req, res) => {
    try {
      const attorneyIds = req.params.attorneyIds.split(',').map(id => parseInt(id));
      const caseType = req.params.caseType;
      
      const feeSchedules = await storage.getPublicAttorneyFeeSchedules(attorneyIds, caseType);
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error fetching attorney fee schedules:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedules' });
    }
  });

  // Public endpoint to assign attorneys to a request (for QuotesPage)
  app.post('/api/public/requests/:requestId/attorneys', async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { attorneyIds } = req.body;
      
      if (!Array.isArray(attorneyIds)) {
        return res.status(400).json({ error: 'Attorney IDs must be an array' });
      }

      // Verify the request exists
      const request = await storage.getLegalRequest(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Legal request not found' });
      }

      // Update assignments for this request
      const updatedAssignments = await storage.updateRequestAttorneyAssignments(requestId, attorneyIds);
      res.json({ success: true, data: updatedAssignments });
    } catch (error) {
      console.error('Error updating attorney assignments:', error);
      res.status(500).json({ success: false, error: 'Failed to update attorney assignments' });
    }
  });



  // Public endpoint to send email to assigned attorneys for a request (for QuotesPage)
  app.post('/api/public/requests/:requestId/send-attorney-emails', async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      
      // Get the legal request details
      const request = await storage.getLegalRequest(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Legal request not found' });
      }

      // Get assigned attorneys who haven't been emailed yet
      const assignments = await storage.getRequestAttorneyAssignments(requestId);
      const unEmailedAssignments = assignments.filter(assignment => !assignment.emailSent);
      
      console.log(`Found ${assignments.length} total assignments, ${unEmailedAssignments.length} need emails`);

      if (unEmailedAssignments.length === 0) {
        console.log('All assigned attorneys have already been emailed - skipping email send');
        return res.json({ success: true, message: 'All assigned attorneys have already been emailed' });
      }

      // Get SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings) {
        return res.status(400).json({ error: 'SMTP settings not configured' });
      }

      // Get attorney details for unemailed assignments
      const attorneyDetails = await Promise.all(
        unEmailedAssignments.map(async (assignment) => {
          const attorney = await storage.getAttorney(assignment.attorneyId);
          return { assignment, attorney };
        })
      );

      // Create transporter
      const transporter = await createTransporter();

      // Send emails to all unnotified attorneys
      const emailResults = [];
      for (const { assignment, attorney } of attorneyDetails) {
        if (!attorney) {
          console.error('Attorney is undefined for assignment:', assignment.id);
          continue;
        }
        
        try {
          // Get case type data for better display
          const caseTypes = await storage.getAllCaseTypes();
          const caseTypeData = caseTypes.find(ct => ct.value === request.caseType);
          
          // Get attorney's fee schedule for this case type (if available)
          let feeSchedule = null;
          try {
            const feeSchedules = await storage.getPublicAttorneyFeeSchedules([attorney.id], request.caseType);
            feeSchedule = feeSchedules.length > 0 ? feeSchedules[0] : null;
          } catch (error) {
            console.log('No fee schedule found for attorney:', attorney.id);
          }
          
          // Get attorney assignment email template variables
          const templateVariables = await getAttorneyAssignmentVariables(attorney, request, caseTypeData, feeSchedule);
          
          // Get processed email template
          const processedTemplate = await getProcessedTemplate('notification', templateVariables);
          
          let subject: string;
          let htmlContent: string;
          let textContent: string;
          
          if (processedTemplate) {
            // Use production template
            subject = processedTemplate.subject;
            htmlContent = processedTemplate.html;
            textContent = processedTemplate.text;
          } else {
            // Fallback to basic template if no production template is available
            subject = `New Legal Case Assignment - ${request.requestNumber}`;
            htmlContent = `
              <h2>New Legal Case Assignment</h2>
              <p>Dear ${attorney.firstName} ${attorney.lastName},</p>
              <p>You have been assigned to a new legal case.</p>
              <p><strong>Request Number:</strong> ${request.requestNumber}</p>
              <p><strong>Client:</strong> ${request.firstName} ${request.lastName}</p>
              <p><strong>Case Type:</strong> ${caseTypeData?.label || request.caseType}</p>
              <p><strong>Location:</strong> ${request.location}</p>
              <p>Please review the case details and contact the client to schedule a consultation.</p>
            `;
            textContent = `New Legal Case Assignment - ${request.requestNumber}\n\nDear ${attorney.firstName} ${attorney.lastName},\n\nYou have been assigned to a new legal case.\n\nRequest Number: ${request.requestNumber}\nClient: ${request.firstName} ${request.lastName}\nCase Type: ${caseTypeData?.label || request.caseType}\nLocation: ${request.location}\n\nPlease review the case details and contact the client to schedule a consultation.`;
          }

          const result = await sendEmail(
            'linktolawyers.us@gmail.com', // Override email address
            subject,
            htmlContent,
            textContent
          );
          
          // Store successful email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: subject,
            message: htmlContent,
            status: 'sent',
          });

          // Mark assignment as emailed
          await storage.updateRequestAttorneyAssignmentEmail(assignment.id, true);

          emailResults.push({
            attorneyId: attorney.id,
            attorneyName: `${attorney.firstName} ${attorney.lastName}`,
            email: attorney.email,
            status: 'sent',
            messageId: result.messageId
          });

        } catch (emailError: any) {
          console.error(`Error sending email to attorney ${attorney.id}:`, emailError);
          
          // Store failed email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: `New Legal Case Assignment - ${request.requestNumber}`,
            message: 'Failed to send email',
            status: 'failed',
            errorMessage: emailError?.message || 'Unknown error',
          });

          emailResults.push({
            attorneyId: attorney.id,
            attorneyName: `${attorney.firstName} ${attorney.lastName}`,
            email: attorney.email,
            status: 'failed',
            error: emailError?.message || 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        message: `Emails sent to ${emailResults.filter(r => r.status === 'sent').length} of ${emailResults.length} attorneys`,
        results: emailResults
      });

    } catch (error) {
      console.error('Error sending attorney assignment emails:', error);
      res.status(500).json({ success: false, error: 'Failed to send attorney assignment emails' });
    }
  });

  // Get attorney assignments for a request
  app.get('/api/requests/:requestId/attorneys', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const assignments = await storage.getRequestAttorneyAssignments(parseInt(req.params.requestId));
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching request attorney assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Assign attorneys to a request
  app.post('/api/requests/:requestId/attorneys', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { attorneyIds } = req.body;
      
      if (!Array.isArray(attorneyIds)) {
        return res.status(400).json({ error: 'Attorney IDs must be an array' });
      }

      // Update assignments for this request
      const updatedAssignments = await storage.updateRequestAttorneyAssignments(requestId, attorneyIds);
      res.json(updatedAssignments);
    } catch (error) {
      console.error('Error updating attorney assignments:', error);
      res.status(500).json({ error: 'Failed to update attorney assignments' });
    }
  });

  // Update attorney assignment status
  app.put('/api/assignments/:assignmentId', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const assignmentData = insertRequestAttorneyAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateRequestAttorneyAssignment(parseInt(req.params.assignmentId), assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error('Error updating attorney assignment:', error);
      res.status(400).json({ error: 'Failed to update assignment' });
    }
  });

  // Remove attorney assignment
  app.delete('/api/assignments/:assignmentId', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      await storage.deleteRequestAttorneyAssignment(parseInt(req.params.assignmentId));
      res.json({ message: 'Attorney assignment removed successfully' });
    } catch (error) {
      console.error('Error removing attorney assignment:', error);
      res.status(500).json({ error: 'Failed to remove assignment' });
    }
  });

  // Send email to assigned attorneys for a request
  app.post('/api/requests/:requestId/send-attorney-emails', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      
      // Get the legal request details
      const request = await storage.getLegalRequest(requestId);
      if (!request) {
        return res.status(404).json({ error: 'Legal request not found' });
      }

      // Get assigned attorneys who haven't been emailed yet
      const assignments = await storage.getRequestAttorneyAssignments(requestId);
      const unEmailedAssignments = assignments.filter(assignment => !assignment.emailSent);

      if (unEmailedAssignments.length === 0) {
        return res.json({ message: 'All assigned attorneys have already been emailed' });
      }

      // Get SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings) {
        return res.status(400).json({ error: 'SMTP settings not configured' });
      }

      // Get attorney details for unemailed assignments
      const attorneyDetails = await Promise.all(
        unEmailedAssignments.map(async (assignment) => {
          const attorney = await storage.getAttorney(assignment.attorneyId);
          return { assignment, attorney };
        })
      );

      // Create transporter
      const transporter = await createTransporter();

      // Send emails to all unnotified attorneys
      const emailResults = [];
      for (const { assignment, attorney } of attorneyDetails) {
        if (!attorney) {
          console.error('Attorney is undefined for assignment:', assignment.id);
          continue;
        }
        
        try {
          // Get case type data for better display
          const caseTypes = await storage.getAllCaseTypes();
          const caseTypeData = caseTypes.find(ct => ct.value === request.caseType);
          
          // Get attorney's fee schedule for this case type (if available)
          let feeSchedule = null;
          try {
            const feeSchedules = await storage.getPublicAttorneyFeeSchedules([attorney.id], request.caseType);
            feeSchedule = feeSchedules.length > 0 ? feeSchedules[0] : null;
          } catch (error) {
            console.log('No fee schedule found for attorney:', attorney.id);
          }
          
          // Get attorney assignment email template variables
          const templateVariables = await getAttorneyAssignmentVariables(attorney, request, caseTypeData, feeSchedule);
          
          // Get processed email template
          const processedTemplate = await getProcessedTemplate('notification', templateVariables);
          
          let subject: string;
          let htmlContent: string;
          let textContent: string;
          
          if (processedTemplate) {
            // Use production template
            subject = processedTemplate.subject;
            htmlContent = processedTemplate.html;
            textContent = processedTemplate.text;
          } else {
            // Fallback to basic template if no production template is available
            subject = `New Legal Case Assignment - ${request.requestNumber}`;
            htmlContent = `
              <h2>New Legal Case Assignment</h2>
              <p>Dear ${attorney.firstName} ${attorney.lastName},</p>
              <p>You have been assigned to a new legal case.</p>
              <p><strong>Request Number:</strong> ${request.requestNumber}</p>
              <p><strong>Client:</strong> ${request.firstName} ${request.lastName}</p>
              <p><strong>Case Type:</strong> ${request.caseType}</p>
              <p><strong>Description:</strong> ${request.caseDescription}</p>
              <p>Please review the case details and contact the client if needed.</p>
            `;
            textContent = htmlContent.replace(/<[^>]*>/g, ''); // Strip HTML for text version
          }

          await sendEmail(
            'linktolawyers.us@gmail.com', // Override email address
            subject,
            htmlContent,
            textContent
          );

          // Store successful email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: subject,
            message: htmlContent,
            status: 'sent',
            errorMessage: null,
          });

          // Mark email as sent
          await storage.updateRequestAttorneyAssignmentEmail(assignment.id, true);
          
          emailResults.push({
            attorneyId: attorney.id,
            attorneyName: `${attorney.firstName} ${attorney.lastName}`,
            email: attorney.email,
            success: true
          });
        } catch (error: any) {
          console.error(`Failed to send email to ${attorney?.email || 'unknown'}:`, error);
          
          // Store failed email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: `New Legal Case Assignment - ${request.requestNumber}`,
            message: '',
            status: 'failed',
            errorMessage: error?.message || 'Unknown error',
          });

          emailResults.push({
            attorneyId: attorney?.id || 0,
            attorneyName: `${attorney?.firstName || 'Unknown'} ${attorney?.lastName || 'Attorney'}`,
            email: attorney?.email || 'unknown',
            success: false,
            error: error?.message || 'Unknown error'
          });
        }
      }

      res.json({
        message: 'Email sending process completed',
        results: emailResults,
        totalSent: emailResults.filter(r => r.success).length,
        totalFailed: emailResults.filter(r => !r.success).length
      });

    } catch (error) {
      console.error('Error sending attorney emails:', error);
      res.status(500).json({ error: 'Failed to send attorney emails' });
    }
  });

  // Blog Posts API Routes
  // Get all blog posts (admin only)
  app.get("/api/blog-posts", requireAuth, requireAdmin, async (req, res) => {
    try {
      const blogPosts = await storage.getAllBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  // Get published blog posts (public)
  app.get("/api/blog-posts/published", async (req, res) => {
    try {
      const publishedPosts = await storage.getPublishedBlogPosts();
      res.json(publishedPosts);
    } catch (error) {
      console.error('Error fetching published blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch published blog posts' });
    }
  });

  // Get blog post by ID (admin only)
  app.get("/api/blog-posts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const blogPost = await storage.getBlogPost(Number(id));
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });

  // Get blog post by slug (public)
  app.get("/api/blog-posts/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const blogPost = await storage.getBlogPostBySlug(slug);
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });

  // Create blog post (admin only)
  app.post("/api/blog-posts", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Convert publishedAt string to Date object if it exists
      const requestData = {
        ...req.body,
        publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : null
      };
      
      const result = insertBlogPostSchema.safeParse(requestData);
      if (!result.success) {
        console.log('Validation errors:', JSON.stringify(result.error.issues, null, 2));
        return res.status(400).json({ error: 'Invalid blog post data', details: result.error.issues });
      }

      // Set translation status to pending if post is being published
      const postData = {
        ...result.data,
        authorId: req.user?.id || 1,
        translationStatus: result.data.isPublished ? 'pending' : null
      };

      const blogPost = await storage.createBlogPost(postData);
      
      // Trigger background translation if published
      if (blogPost.isPublished) {
        const { triggerPostTranslation } = await import('./backgroundTranslation');
        triggerPostTranslation(blogPost.id).catch(console.error);
      }

      res.status(201).json(blogPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });

  // Update blog post (admin only)
  app.put("/api/blog-posts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the current blog post to check if it's being published for the first time
      const currentPost = await storage.getBlogPost(Number(id));
      if (!currentPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      // Convert publishedAt string to Date object if it exists
      const requestData = {
        ...req.body,
        publishedAt: req.body.publishedAt ? new Date(req.body.publishedAt) : null
      };
      
      const result = insertBlogPostSchema.partial().safeParse(requestData);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid blog post data', details: result.error.issues });
      }

      // Check if post is being published for the first time or content changed
      const isBeingPublished = !currentPost.isPublished && result.data.isPublished;
      const contentChanged = result.data.title !== undefined || result.data.content !== undefined || result.data.excerpt !== undefined;
      
      // Set translation status if needed
      let updateData = result.data;
      if (isBeingPublished || (contentChanged && currentPost.isPublished)) {
        updateData = {
          ...result.data,
          translationStatus: 'pending'
        };
      }

      const blogPost = await storage.updateBlogPost(Number(id), updateData);
      
      // Trigger background translation if published and needs translation
      if (blogPost.isPublished && (isBeingPublished || contentChanged)) {
        const { triggerPostTranslation } = await import('./backgroundTranslation');
        triggerPostTranslation(blogPost.id).catch(console.error);
      }

      res.json(blogPost);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  });

  // Delete blog post (admin only)
  app.delete("/api/blog-posts/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });

  // ========== SPANISH BLOG TRANSLATION ROUTES ==========

  // Get published blog posts with Spanish translations (database-stored)
  app.get("/api/blog-posts/published/spanish", async (req, res) => {
    try {
      const blogPosts = await storage.getPublishedBlogPosts();
      
      const spanishPosts = blogPosts.map(post => {
        // Use stored Spanish translation if available, otherwise show fallback
        if (post.spanishTitle && post.spanishContent && post.translationStatus === 'completed') {
          return {
            ...post,
            title: post.spanishTitle,
            content: post.spanishContent,
            excerpt: post.spanishExcerpt || post.excerpt,
            slug: post.slug + '-es' // Add Spanish suffix to slug
          };
        } else {
          // Show fallback if translation not ready
          return {
            ...post,
            title: `[Traducción en proceso] ${post.title}`,
            content: `<p><em>Esta publicación está siendo traducida automáticamente. Por favor, inténtelo de nuevo en unos minutos.</em></p><hr>${post.content}`,
            excerpt: post.excerpt,
            slug: post.slug + '-es'
          };
        }
      });
      
      res.json(spanishPosts);
    } catch (error) {
      console.error('Error fetching Spanish blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch Spanish blog posts' });
    }
  });

  // Get single blog post by slug with Spanish translation (database-stored)
  app.get("/api/blog-posts/slug/:slug/spanish", async (req, res) => {
    try {
      let { slug } = req.params;
      
      // Remove Spanish suffix if present to get original slug
      const originalSlug = slug.endsWith('-es') ? slug.slice(0, -3) : slug;
      
      const blogPost = await storage.getBlogPostBySlug(originalSlug);
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      if (!blogPost.isPublished) {
        return res.status(404).json({ error: 'Blog post not published' });
      }

      // Use stored Spanish translation if available
      if (blogPost.spanishTitle && blogPost.spanishContent && blogPost.translationStatus === 'completed') {
        const translatedPost = {
          ...blogPost,
          title: blogPost.spanishTitle,
          content: blogPost.spanishContent,
          excerpt: blogPost.spanishExcerpt || blogPost.excerpt,
          slug: blogPost.slug + '-es'
        };
        
        res.json(translatedPost);
      } else {
        // Show fallback if translation not ready
        res.json({
          ...blogPost,
          title: `[Traducción en proceso] ${blogPost.title}`,
          content: `<p><em>Esta publicación está siendo traducida automáticamente. Por favor, inténtelo de nuevo en unos minutos.</em></p><hr>${blogPost.content}`,
          excerpt: blogPost.excerpt,
          slug: blogPost.slug + '-es'
        });
      }
    } catch (error) {
      console.error('Error fetching Spanish blog post by slug:', error);
      res.status(500).json({ error: 'Failed to fetch Spanish blog post' });
    }
  });

  // ========== IMAGE UPLOAD ROUTES ==========
  
  // Image serving with proper caching headers for performance
  app.get("/images/:imagePath(*)", async (req, res) => {
    try {
      const imagePath = `/objects/${req.params.imagePath}`;
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(imagePath);
      
      // Set aggressive caching for images
      res.set({
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
        'ETag': `"${Date.now()}"`, // Simple ETag based on timestamp
        'Vary': 'Accept-Encoding'
      });

      // Check if client has cached version
      if (req.headers['if-none-match'] === res.get('ETag')) {
        return res.sendStatus(304);
      }

      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Image serving error:', error);
      res.status(404).json({ error: 'Image not found' });
    }
  });
  
  // Enhanced image upload endpoint with comprehensive validation and optimization
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Enhanced server-side validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          error: `Invalid file type: ${req.file.mimetype}. Allowed types: ${allowedTypes.join(', ')}` 
        });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          error: `File too large: ${Math.round(req.file.size / 1024 / 1024 * 100) / 100}MB. Maximum size is 10MB` 
        });
      }

      // Get alt text from form data for SEO and accessibility
      const altText = req.body.altText?.trim() || '';

      const objectStorageService = new ObjectStorageService();
      
      // Generate organized filename with timestamp and random suffix for uniqueness
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      
      // Get upload URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Upload the file to object storage (signed URLs don't allow custom headers)
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: req.file.buffer,
        headers: {
          'Content-Type': req.file.mimetype,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => 'Unknown error');
        console.error('Object storage upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
          fileSize: req.file.size,
          fileName: req.file.originalname
        });
        throw new Error(`Upload to storage failed: ${uploadResponse.status} - ${uploadResponse.statusText}`);
      }

      // Set ACL policy to make image publicly accessible
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: "admin",
          visibility: "public", // Blog images should be publicly accessible
        }
      );

      // Return a path that points to our image serving endpoint
      const imageUrl = `/images${objectPath.replace('/objects', '')}`;
      
      // Log successful upload for monitoring and analytics
      console.log(`Image uploaded successfully: ${sanitizedName}`, {
        size: `${Math.round(req.file.size / 1024 * 100) / 100}KB`,
        type: req.file.mimetype,
        hasAltText: Boolean(altText),
        path: objectPath,
        altText: altText || 'No alt text provided'
      });
      
      res.json({ 
        imageUrl,
        metadata: {
          originalName: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          altText: altText || null,
          dimensions: null // Could be enhanced with image analysis
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error during upload. Please check your connection and try again.';
        } else if (error.message.includes('storage')) {
          errorMessage = 'Storage service error. Please try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });
  
  // Get upload URL for blog images (admin only)
  app.post("/api/images/upload", requireAuth, requireAdmin, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // Set image ACL policy after upload (admin only)
  app.put("/api/images/policy", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { imageURL } = req.body;
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageURL,
        {
          owner: req.user?.id?.toString() || "admin",
          visibility: "public", // Blog images should be publicly accessible
        }
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting image policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded images (public)
  app.get("/images/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        `/objects/${req.params.objectPath}`,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving image:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // ========== EMAIL TEMPLATE ROUTES ==========
  
  // Get all email templates (admin only)
  app.get("/api/email-templates", requireAuth, requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  });

  // Get email template by ID (admin only)
  app.get("/api/email-templates/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getEmailTemplate(Number(id));
      if (!template) {
        return res.status(404).json({ error: 'Email template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching email template:', error);
      res.status(500).json({ error: 'Failed to fetch email template' });
    }
  });

  // Get email templates by type (admin only)
  app.get("/api/email-templates/type/:type", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      const templates = await storage.getEmailTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      console.error('Error fetching email templates by type:', error);
      res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  });

  // Get legal document templates (public access for specific document types)
  app.get("/api/legal-documents/:type", async (req, res) => {
    try {
      const { type } = req.params;
      
      // Only allow access to specific legal document types
      const allowedTypes = [
        'terms_and_conditions',
        'terms_and_conditions_spanish', 
        'privacy_policy',
        'privacy_policy_spanish'
      ];
      
      if (!allowedTypes.includes(type)) {
        return res.status(404).json({ error: 'Legal document not found' });
      }
      
      const templates = await storage.getEmailTemplatesByType(type);
      // Only return active templates and limit to content fields for security
      const publicTemplates = templates
        .filter(template => template.isActive)
        .map(template => ({
          id: template.id,
          name: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          templateType: template.templateType
        }));
      
      res.json(publicTemplates);
    } catch (error) {
      console.error('Error fetching legal document:', error);
      res.status(500).json({ error: 'Failed to fetch legal document' });
    }
  });

  // Create email template (admin only)
  app.post("/api/email-templates", requireAuth, requireAdmin, async (req, res) => {
    try {
      const result = insertEmailTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid email template data', details: result.error.issues });
      }

      const template = await storage.createEmailTemplate(result.data);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ error: 'Failed to create email template' });
    }
  });

  // Update email template (admin only)
  app.put("/api/email-templates/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateEmailTemplateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid email template data', details: result.error.issues });
      }

      const template = await storage.updateEmailTemplate(Number(id), result.data);
      res.json(template);
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ error: 'Failed to update email template' });
    }
  });

  // Delete email template (admin only)
  app.delete("/api/email-templates/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmailTemplate(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting email template:', error);
      res.status(500).json({ error: 'Failed to delete email template' });
    }
  });

  // Chatbot Prompts Management Routes
  // Get all chatbot prompts (admin only)
  app.get('/api/chatbot-prompts', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const prompts = await storage.getAllChatbotPrompts();
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching chatbot prompts:', error);
      res.status(500).json({ error: 'Failed to fetch chatbot prompts' });
    }
  });

  // Get active chatbot prompt (public endpoint for chatbot)
  app.get('/api/chatbot-prompts/active', async (req, res) => {
    try {
      const language = req.query.lang as string || 'en';
      
      // Get active prompt for the specified language
      const activePrompt = await storage.getActiveChatbotPromptByLanguage(language);
      
      if (!activePrompt) {
        return res.status(404).json({ error: `No active prompt found for language: ${language}` });
      }
      res.json(activePrompt);
    } catch (error) {
      console.error('Error fetching active chatbot prompt:', error);
      res.status(500).json({ error: 'Failed to fetch active prompt' });
    }
  });

  // Create new chatbot prompt (admin only)
  app.post('/api/chatbot-prompts', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const validatedData = insertChatbotPromptSchema.parse(req.body);
      
      // If this prompt is being set as active, deactivate all others first
      if (validatedData.isActive) {
        await storage.deactivateAllChatbotPrompts();
      }
      
      const prompt = await storage.createChatbotPrompt(validatedData);
      res.json(prompt);
    } catch (error) {
      console.error('Error creating chatbot prompt:', error);
      res.status(500).json({ error: 'Failed to create chatbot prompt' });
    }
  });

  // Update chatbot prompt (admin only)
  app.put('/api/chatbot-prompts/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertChatbotPromptSchema.partial().parse(req.body);
      
      // If this prompt is being set as active, deactivate all others first
      if (validatedData.isActive) {
        await storage.deactivateAllChatbotPrompts();
      }
      
      const prompt = await storage.updateChatbotPrompt(id, validatedData);
      res.json(prompt);
    } catch (error) {
      console.error('Error updating chatbot prompt:', error);
      res.status(500).json({ error: 'Failed to update chatbot prompt' });
    }
  });

  // Activate a specific chatbot prompt (admin only)
  app.put('/api/chatbot-prompts/:id/activate', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the prompt to find its language
      const promptToActivate = await storage.getChatbotPrompt(id);
      if (!promptToActivate) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      
      // Deactivate all prompts for the same language first
      await storage.deactivateChatbotPromptsByLanguage(promptToActivate.language);
      
      // Activate the specified prompt
      const prompt = await storage.updateChatbotPrompt(id, { isActive: true });
      res.json(prompt);
    } catch (error) {
      console.error('Error activating chatbot prompt:', error);
      res.status(500).json({ error: 'Failed to activate chatbot prompt' });
    }
  });

  // Delete chatbot prompt (admin only)
  app.delete('/api/chatbot-prompts/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChatbotPrompt(id);
      res.json({ message: 'Chatbot prompt deleted successfully' });
    } catch (error) {
      console.error('Error deleting chatbot prompt:', error);
      res.status(500).json({ error: 'Failed to delete chatbot prompt' });
    }
  });

  // Chatbot OpenAI Response Endpoint
  app.post('/api/chatbot/response', async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      // Import OpenAI at the top if not already done
      const { default: OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Prepare messages for OpenAI
      const openaiMessages = [
        {
          role: 'system',
          content: systemPrompt || 'You are a helpful legal assistant chatbot.'
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Using the latest model
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 
        'I apologize, but I\'m unable to provide a response right now. Please try again.';

      res.json({ response });
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      
      if (error?.error?.type === 'insufficient_quota') {
        res.status(429).json({ 
          error: 'API quota exceeded. Please check your OpenAI account.' 
        });
      } else if (error?.status === 401) {
        res.status(401).json({ 
          error: 'Invalid OpenAI API key. Please check your configuration.' 
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to get response from AI service. Please try again.' 
        });
      }
    }
  });

  // Enhanced Chat System API Routes

  // Helper function to build system prompt with current date context
  async function buildSystemPromptWithDate(conversationId?: string): Promise<string> {
    // Try to detect language from conversation context
    let language = 'en'; // default to English
    
    if (conversationId) {
      try {
        const messages = await storage.getMessagesByConversationId(conversationId);
        // Look for Spanish intake messages to detect language
        const hasSpanishIntake = messages.some(msg => 
          msg.content.includes('Hola, mi nombre es') || 
          msg.content.includes('Necesito ayuda con') ||
          msg.content.includes('estoy ubicado en')
        );
        
        if (hasSpanishIntake) {
          language = 'es';
        }
      } catch (error) {
        console.log('Could not detect language from conversation, using default English');
      }
    }
    
    const activePrompt = await storage.getActiveChatbotPromptByLanguage(language);
    const baseSystemPrompt = activePrompt?.prompt || "You are a helpful legal assistant chatbot for LinkToLawyers. Help users understand immigration law, guide them through our services, and answer questions about their legal needs. Be professional, informative, and helpful.";
    
    // Add current date context to system prompt
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `${baseSystemPrompt}

IMPORTANT CONTEXT: Today's date is ${dateString} (${currentDate.toISOString().split('T')[0]}). Use this as your reference for any date-related questions or calculations.`;
  }

  // Conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const { title = "New Conversation" } = req.body;
      const conversation = await storage.createConversation({ title });
      res.json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(400).json({ error: "Failed to create conversation" });
    }
  });

  // Messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversationId(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { content, role = "user" } = req.body;
      const message = await storage.createMessage({
        conversationId: req.params.conversationId,
        content,
        role,
      });
      res.json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(400).json({ error: "Failed to create message" });
    }
  });

  // Intake data submission endpoint
  app.post("/api/chat/intake", async (req, res) => {
    try {
      const { fullName, email, caseTypes, phoneNumber, city, state, language } = req.body;
      
      if (!fullName || !email || !caseTypes || caseTypes.length === 0) {
        return res.status(400).json({ error: "Missing required intake information" });
      }

      // Detect language from request or default to English
      const userLanguage = language || 'en';

      // Create a new conversation
      const conversation = await storage.createConversation({ title: `${fullName} - Immigration Intake` });
      
      // Get active prompt for system context based on language
      const activePrompt = await storage.getActiveChatbotPromptByLanguage(userLanguage);
      const baseSystemPrompt = activePrompt?.prompt || "You are a helpful legal assistant chatbot for LinkToLawyers.";
      
      // Create intake message with the user's information
      const caseTypeText = caseTypes.map((type: string) => {
        switch(type) {
          case 'family': return 'Family Immigration';
          case 'asylum': return 'Asylum';
          case 'naturalization': return 'Naturalization / Citizenship';
          default: return type;
        }
      }).join(', ');

      // Build intake message with optional fields
      let intakeMessage = `Hello, my name is ${fullName} and my email is ${email}`;
      
      if (phoneNumber) {
        intakeMessage += ` and my phone number is ${phoneNumber}`;
      }
      
      if (city && state) {
        intakeMessage += `. I am located in ${city}, ${state}`;
      } else if (city) {
        intakeMessage += `. I am located in ${city}`;
      } else if (state) {
        intakeMessage += `. I am located in ${state}`;
      }
      
      intakeMessage += `. I need help with ${caseTypeText}.`;
      
      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        content: intakeMessage,
        role: "user"
      });

      // Generate AI response with intake context
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Enhanced system prompt with intake context
        const systemPrompt = `${baseSystemPrompt}

        The user has just completed an intake form with the following information:
        - Name: ${fullName}
        - Email: ${email}
        ${phoneNumber ? `- Phone: ${phoneNumber}` : ''}
        ${city || state ? `- Location: ${[city, state].filter(Boolean).join(', ')}` : ''}
        - Case Type(s): ${caseTypeText}

        IMPORTANT: The user has already provided their case type as "${caseTypeText}". Do NOT ask them to choose a case type again.

        Please provide a personalized, helpful response that:
        1. Acknowledges their information professionally (name, email, and specific case type)
        2. Addresses their specific case type needs directly
        3. Explains how you can assist them with their ${caseTypeText} case
        4. Asks relevant follow-up questions about their specific ${caseTypeText} situation

        Be warm, professional, and knowledgeable about immigration law. Since they already told you their case type, proceed directly to helping them with that specific area.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: intakeMessage }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        const aiResponse = completion.choices[0]?.message?.content;

        if (aiResponse) {
          // Save AI response
          await storage.createMessage({
            conversationId: conversation.id,
            content: aiResponse,
            role: "assistant"
          });
        }

        res.json({ 
          conversationId: conversation.id,
          message: "Intake information processed successfully"
        });

      } catch (aiError) {
        console.error('Error generating AI response:', aiError);
        // Still return success even if AI response fails - user message was saved
        res.json({ 
          conversationId: conversation.id,
          message: "Intake information processed successfully"
        });
      }

    } catch (error) {
      console.error('Error processing intake:', error);
      res.status(500).json({ error: "Failed to process intake information" });
    }
  });

  // Streaming chat completion
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { conversationId, message } = req.body;

      if (!conversationId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Get conversation messages
      const messages = await storage.getMessagesByConversationId(conversationId);
      
      // Get system prompt with current date context
      const systemPrompt = await buildSystemPromptWithDate(conversationId);

      // Build OpenAI messages array
      const openaiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        })),
        { role: "user" as const, content: message }
      ];

      // Import OpenAI
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Get streaming response
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: openaiMessages,
        stream: true,
        max_tokens: 2000,
        temperature: 0.7,
      });
      
      let fullResponse = "";
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(content);
        }
      }

      res.end();

      // Save complete AI response as message
      if (fullResponse.trim()) {
        await storage.createMessage({
          conversationId,
          content: fullResponse,
          role: "assistant"
        });

        // Update conversation timestamp
        await storage.updateConversation(conversationId, { updatedAt: new Date() });

        // Check if this response contains an "Attorney Intake Summary" to trigger legal request creation
        if (fullResponse.includes("Attorney Intake Summary") || fullResponse.includes("Case Summary:")) {
          try {
            const legalRequest = await createLegalRequestFromConversation(conversationId, fullResponse);
            if (legalRequest) {
              // Legal request created successfully - the frontend can show the toast
              // by checking the latest legal request for this conversation context
              console.log(`📋 Legal request notification: ${legalRequest.requestNumber} ready for client notification`);
            }
          } catch (error) {
            console.error('Error creating legal request from conversation:', error);
            // Don't fail the chat response if legal request creation fails
          }
        }
      }

    } catch (error: any) {
      console.error("Streaming chat error:", error);
      res.status(500).json({ error: "Failed to get streaming AI response" });
    }
  });

  // Check if legal request was created from conversation
  app.get("/api/conversations/:conversationId/legal-request", async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Get conversation messages to find the intake message
      const messages = await storage.getMessagesByConversationId(conversationId);
      
      // Find the initial intake message to extract user email
      const intakeMessage = messages.find(msg => 
        msg.role === 'user' && 
        msg.content.includes('Hello, my name is') && 
        msg.content.includes('I need help with')
      );

      if (!intakeMessage) {
        return res.json({ hasLegalRequest: false });
      }

      // Extract email from the intake message
      const emailMatch = intakeMessage.content.match(/my email is ([^\s.]+)/i);
      if (!emailMatch) {
        return res.json({ hasLegalRequest: false });
      }

      const email = emailMatch[1].trim();

      // Get all legal requests to find ones for this email created recently (last 5 minutes)
      const allLegalRequests = await storage.getAllLegalRequests();
      const recentLegalRequest = allLegalRequests.find(lr => 
        lr.email === email && 
        new Date(lr.createdAt).getTime() > Date.now() - (5 * 60 * 1000) // last 5 minutes
      );

      if (recentLegalRequest) {
        res.json({ 
          hasLegalRequest: true, 
          requestNumber: recentLegalRequest.requestNumber,
          clientName: `${recentLegalRequest.firstName} ${recentLegalRequest.lastName}`
        });
      } else {
        res.json({ hasLegalRequest: false });
      }

    } catch (error) {
      console.error('Error checking legal request status:', error);
      res.status(500).json({ error: "Failed to check legal request status" });
    }
  });

  // Send email from chat conversation
  app.post("/api/chat/send-email", async (req, res) => {
    try {
      const { conversationId, intakeMessage } = req.body;

      if (!conversationId || !intakeMessage) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Extract user information from intake message
      const nameMatch = intakeMessage.match(/my name is ([^,and]+)/i);
      const emailMatch = intakeMessage.match(/my email is ([^\s,]+)/i);
      const phoneMatch = intakeMessage.match(/my phone number is ([^\s,]+)/i);
      const locationMatch = intakeMessage.match(/I am located in ([^,]+)/i);
      const caseTypeMatch = intakeMessage.match(/I need help with ([^,]+)/i);

      if (!nameMatch || !emailMatch) {
        return res.status(400).json({ error: "Unable to extract user information from conversation" });
      }

      const customerName = nameMatch[1].trim();
      const customerEmail = emailMatch[1].trim();
      const phoneNumber = phoneMatch ? phoneMatch[1].trim() : '';
      const location = locationMatch ? locationMatch[1].trim() : '';
      const caseType = caseTypeMatch ? caseTypeMatch[1].trim() : '';

      // Look for recent legal request for this email
      const allLegalRequests = await storage.getAllLegalRequests();
      const recentLegalRequest = allLegalRequests.find(lr => 
        lr.email === customerEmail && 
        new Date(lr.createdAt).getTime() > Date.now() - (10 * 60 * 1000) // last 10 minutes
      );

      // Generate tracking link if legal request exists
      let trackingLink = '';
      let requestNumber = '';
      if (recentLegalRequest) {
        requestNumber = recentLegalRequest.requestNumber;
        trackingLink = `https://link-to-lawyers-clone-jamesmueller.replit.app/quotes/${requestNumber}`;
      }

      // Create email HTML using the provided template structure
      const emailHtml = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've received your request</title>
  <style>
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-white { background-color: #ffffff; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-blue-600 { background-color: #2563eb; }
    .text-white { color: #ffffff; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-500 { color: #6b7280; }
    .text-blue-600 { color: #2563eb; }
    .text-blue-700 { color: #1d4ed8; }
    .text-green-700 { color: #15803d; }
    .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .rounded-8 { border-radius: 8px; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .no-underline { text-decoration: none; }
    .text-center { text-align: center; }
    .py-40 { padding-top: 40px; padding-bottom: 40px; }
    .p-40 { padding: 40px; }
    .p-24 { padding: 24px; }
    .px-32 { padding-left: 32px; padding-right: 32px; }
    .py-12 { padding-top: 12px; padding-bottom: 12px; }
    .mb-24 { margin-bottom: 24px; }
    .mb-32 { margin-bottom: 32px; }
    .mb-16 { margin-bottom: 16px; }
    .mb-8 { margin-bottom: 8px; }
    .my-32 { margin-top: 32px; margin-bottom: 32px; }
    .ml-16 { margin-left: 16px; }
    .max-w-600 { max-width: 600px; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .text-24 { font-size: 24px; }
    .text-16 { font-size: 16px; }
    .text-14 { font-size: 14px; }
    .text-12 { font-size: 12px; }
    .leading-24 { line-height: 24px; }
    .border-gray-200 { border-color: #e5e7eb; }
  </style>
</head>
<body class="bg-gray-100 font-sans py-40">
  <div class="bg-white rounded-8 shadow-sm max-w-600 mx-auto p-40">
    
    <!-- Header -->
    <div>
      <h1 class="text-24 font-bold text-gray-800 mb-24 text-center">
        We've Sent Your Request – What to Expect Next
      </h1>
    </div>

    ${trackingLink ? `
    <!-- View Request Button -->
    <div class="text-center mb-32">
      <a href="${trackingLink}" class="bg-blue-600 text-white px-32 py-12 rounded-8 text-16 font-semibold no-underline" style="display: inline-block; color: #ffffff; text-decoration: none;">
        View Your Request (${requestNumber})
      </a>
    </div>
    ` : ''}

    <!-- Main Content -->
    <div>
      <p class="text-16 text-gray-800 mb-16 leading-24">
        Hi ${customerName},
      </p>

      <p class="text-16 text-gray-800 mb-24 leading-24">
        Thanks for using our AI Immigration Assistant! We've documented your case information and are connecting you with qualified law firms.
      </p>

      ${requestNumber ? `
      <p class="text-16 text-gray-800 mb-24 leading-24">
        Your request has been assigned number <strong>${requestNumber}</strong> for tracking purposes.
      </p>
      ` : ''}

      <p class="text-16 text-gray-800 mb-24 leading-24">
        We've shared your information with qualified law firms who specialize in ${caseType || 'immigration matters'}, and they'll be reaching out to you directly.
      </p>
    </div>

    <!-- Case Information Summary -->
    <div class="bg-blue-50 p-24 rounded-8 mb-24">
      <p class="text-16 text-gray-800 mb-16 leading-24 font-semibold">
        Your Case Information Summary:
      </p>
      
      <p class="text-16 text-gray-800 mb-8 leading-24 ml-16">
        • Name: ${customerName}
      </p>
      
      <p class="text-16 text-gray-800 mb-8 leading-24 ml-16">
        • Email: ${customerEmail}
      </p>
      
      ${phoneNumber ? `
      <p class="text-16 text-gray-800 mb-8 leading-24 ml-16">
        • Phone: ${phoneNumber}
      </p>
      ` : ''}
      
      ${location ? `
      <p class="text-16 text-gray-800 mb-8 leading-24 ml-16">
        • Location: ${location}
      </p>
      ` : ''}
      
      <p class="text-16 text-gray-800 mb-16 leading-24 ml-16">
        • Case Type: ${caseType || 'Immigration'}
      </p>
    </div>

    <!-- Platform Guidelines -->
    <div>
      <p class="text-16 text-gray-800 mb-24 leading-24">
        As part of our platform guidelines, firms are expected to provide either a good-faith price estimate or follow-up questions to help tailor a quote for you.
      </p>

      <p class="text-16 text-gray-800 mb-16 leading-24 font-semibold text-green-700">
        Your privacy matters:
      </p>
      <p class="text-16 text-gray-800 mb-24 leading-24">
        All information you provide is treated as confidential. You're welcome to withhold personal details until you're ready to move forward.
      </p>

      <p class="text-16 text-gray-800 mb-16 leading-24 font-semibold text-blue-700">
        You're in control:
      </p>
      <p class="text-16 text-gray-800 mb-24 leading-24">
        It's entirely your decision whether to respond to any particular law firm. Research the firm and make sure you feel confident before proceeding.
      </p>
    </div>

    <!-- Closing -->
    <div>
      <p class="text-16 text-gray-800 mb-32 leading-24">
        Thanks again for using LinkToLawyers — we're here to make finding legal help more transparent and accessible.
      </p>

      <p class="text-16 text-gray-800 mb-8 leading-24">
        Best regards,
      </p>
      <p class="text-16 text-gray-800 mb-32 leading-24 font-semibold">
        LinkToLawyers Team
      </p>
    </div>

    <hr class="border-gray-200 my-32" style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

    <!-- Footer -->
    <div>
      <p class="text-14 text-gray-600 text-center mb-8" style="margin: 0; margin-bottom: 8px;">
        <a href="https://link-to-lawyers-clone-JamesMueller.replit.app" class="text-blue-600 no-underline">
          link-to-lawyers-clone-JamesMueller.replit.app
        </a>
      </p>
      <p class="text-14 text-gray-600 text-center mb-16" style="margin: 0; margin-bottom: 16px;">
        <a href="mailto:info@linktolawyers.com" class="text-blue-600 no-underline">
          info@linktolawyers.com
        </a>
      </p>
      <p class="text-12 text-gray-500 text-center" style="margin: 0;">
        © 2025 LinkToLawyers. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

      // Send email using the existing sendEmail function that handles SMTP settings
      console.log(`📧 Sending chat confirmation email to ${customerEmail}${requestNumber ? ` for ${requestNumber}` : ''}...`);
      
      const emailSubject = `Your Legal Request Confirmation${requestNumber ? ` - ${requestNumber}` : ''}`;
      
      const result = await sendEmail(
        customerEmail,
        emailSubject,
        emailHtml,
        '' // text version - could be added later
      );

      console.log(`📧 Chat confirmation email sent successfully to ${customerEmail}${requestNumber ? ` for ${requestNumber}` : ''}`);

      res.json({ 
        success: true, 
        recipientEmail: customerEmail,
        requestNumber: requestNumber,
        emailId: result.messageId
      });

    } catch (error) {
      console.error('Error sending chat email:', error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Send email template from chat
  app.post("/api/chat/send-template", async (req, res) => {
    try {
      const { conversationId, intakeMessage, templateId, fullConversation, detectedLanguage } = req.body;

      if (!conversationId || !intakeMessage) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Detect if this is a Spanish conversation using multiple methods
      let isSpanishConversation = false;

      // Method 1: Use detected language from client
      if (detectedLanguage === 'es') {
        isSpanishConversation = true;
      }

      // Method 2: Check full conversation if provided
      if (!isSpanishConversation && fullConversation) {
        isSpanishConversation = fullConversation.some((msg: { role: string; content: string }) => 
          msg.content.includes('mi nombre es') || 
          msg.content.includes('mi correo electrónico es') ||
          msg.content.includes('estoy ubicado en') ||
          msg.content.includes('Necesito ayuda con') ||
          msg.content.includes('Hola Jim Mueller') ||
          msg.content.includes('gracias por compartir') ||
          msg.content.includes('inmigración familiar') ||
          msg.content.includes('¿Estás dentro de EE.UU.') ||
          msg.content.includes('situación') ||
          msg.content.includes('Vamos a empezar')
        );
      }

      // Method 3: Fallback to intake message only
      if (!isSpanishConversation) {
        isSpanishConversation = intakeMessage.includes('mi nombre es') || 
                                 intakeMessage.includes('mi correo electrónico es') ||
                                 intakeMessage.includes('estoy ubicado en') ||
                                 intakeMessage.includes('Necesito ayuda con');
      }

      console.log('Server Spanish detection (enhanced):', {
        isSpanishConversation,
        detectedLanguage,
        hasFullConversation: !!fullConversation,
        conversationMessages: fullConversation ? fullConversation.length : 0,
        spanishInConversation: fullConversation ? fullConversation.filter((msg: { role: string; content: string }) => 
          msg.content.includes('gracias') || 
          msg.content.includes('Hola') || 
          msg.content.includes('inmigración') ||
          msg.content.includes('situación')
        ).length : 0
      });

      // Extract user information from intake message or full conversation
      let nameMatch, emailMatch, phoneMatch, locationMatch, caseTypeMatch;
      let sourceMessage = intakeMessage;

      // Try to find user information in the intake message first
      if (isSpanishConversation) {
        nameMatch = intakeMessage.match(/mi nombre es ([^,y]+)/i);
        emailMatch = intakeMessage.match(/mi correo electrónico es ([^\s,]+)/i);
        phoneMatch = intakeMessage.match(/mi número de teléfono es ([^\s,]+)/i);
        locationMatch = intakeMessage.match(/estoy ubicado en ([^,]+)/i);
        caseTypeMatch = intakeMessage.match(/Necesito ayuda con ([^,]+)/i);
      } else {
        nameMatch = intakeMessage.match(/my name is ([^,and]+)/i);
        emailMatch = intakeMessage.match(/my email is ([^\s,]+)/i);
        phoneMatch = intakeMessage.match(/my phone number is ([^\s,]+)/i);
        locationMatch = intakeMessage.match(/I am located in ([^,]+)/i);
        caseTypeMatch = intakeMessage.match(/I need help with ([^,]+)/i);
      }

      // If not found in intake message, try to find in full conversation
      if ((!nameMatch || !emailMatch) && fullConversation) {
        console.log('Looking for user info in full conversation...');
        for (const msg of fullConversation) {
          if (msg.role === 'user') {
            // Try both English and Spanish patterns
            const engName = msg.content.match(/my name is ([^,and]+)/i);
            const engEmail = msg.content.match(/my email is ([^\s,]+)/i);
            const engPhone = msg.content.match(/my phone number is ([^\s,]+)/i);
            const engLocation = msg.content.match(/I am located in ([^,]+)/i);
            const engCaseType = msg.content.match(/I need help with ([^,]+)/i);

            const spName = msg.content.match(/mi nombre es ([^,y]+)/i);
            const spEmail = msg.content.match(/mi correo electrónico es ([^\s,]+)/i);
            const spPhone = msg.content.match(/mi número de teléfono es ([^\s,]+)/i);
            const spLocation = msg.content.match(/estoy ubicado en ([^,]+)/i);
            const spCaseType = msg.content.match(/Necesito ayuda con ([^,]+)/i);

            if ((engName && engEmail) || (spName && spEmail)) {
              nameMatch = engName || spName;
              emailMatch = engEmail || spEmail;
              phoneMatch = engPhone || spPhone;
              locationMatch = engLocation || spLocation;
              caseTypeMatch = engCaseType || spCaseType;
              sourceMessage = msg.content;
              break;
            }
          }
        }
      }

      console.log('User info extraction:', {
        foundName: !!nameMatch,
        foundEmail: !!emailMatch,
        sourceWasIntake: sourceMessage === intakeMessage,
        extractedName: nameMatch ? nameMatch[1].trim() : 'Not found',
        extractedEmail: emailMatch ? emailMatch[1].trim() : 'Not found'
      });

      if (!nameMatch || !emailMatch) {
        return res.status(400).json({ error: "Unable to extract user information from conversation" });
      }

      const customerName = nameMatch[1].trim();
      const customerEmail = emailMatch[1].trim();
      const phoneNumber = phoneMatch ? phoneMatch[1].trim() : '';
      const location = locationMatch ? locationMatch[1].trim() : '';
      const caseType = caseTypeMatch ? caseTypeMatch[1].trim() : '';

      // Get the appropriate email template based on language
      let template;
      if (templateId) {
        template = await storage.getEmailTemplate(templateId);
      } else {
        // Get language-specific template
        const allTemplates = await storage.getAllEmailTemplates();
        const activeTemplates = allTemplates.filter(t => t.isActive);
        if (activeTemplates.length === 0) {
          return res.status(404).json({ error: "No active email templates found" });
        }
        
        // Find appropriate template based on language
        console.log('Template selection debug:', {
          isSpanishConversation,
          availableTemplates: activeTemplates.map(t => ({ id: t.id, name: t.name })),
          intakeMessagePreview: intakeMessage.substring(0, 100)
        });

        if (isSpanishConversation) {
          template = activeTemplates.find(t => t.name === 'Chat Confirmation Spanish') ||
                     activeTemplates.find(t => t.name.toLowerCase().includes('spanish'));
          console.log('Spanish template selected:', template ? template.name : 'None found');
        } else {
          template = activeTemplates.find(t => t.name === 'Chat Confirmation');
          console.log('English template selected:', template ? template.name : 'None found');
        }
        
        // Fallback to most recent template if language-specific not found
        if (!template) {
          template = activeTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          console.log('Fallback template used:', template ? template.name : 'None found');
        }
      }

      if (!template) {
        return res.status(404).json({ error: "Email template not found" });
      }

      // Process template variables
      let processedHtml = template.htmlContent || '';
      let processedSubject = template.subject || '';

      // Look for recent legal request for this email
      const allLegalRequests = await storage.getAllLegalRequests();
      const recentLegalRequest = allLegalRequests.find(lr => 
        lr.email === customerEmail && 
        new Date(lr.createdAt).getTime() > Date.now() - (10 * 60 * 1000) // last 10 minutes
      );

      // Generate tracking link and request number if legal request exists
      let quotesUrl = '';
      let requestNumber = '';
      let quotesButton = '';
      if (recentLegalRequest) {
        requestNumber = recentLegalRequest.requestNumber;
        const baseUrl = 'https://link-to-lawyers-clone-jamesmueller.replit.app';
        quotesUrl = `${baseUrl}/quotes/${requestNumber}`;
        quotesButton = `<div style="text-align: center; margin: 30px 0;">
          <a href="${quotesUrl}" 
             style="background-color: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            View Your Quotes & Request Status
          </a>
        </div>`;
      }

      // Replace common variables
      const variables = {
        '{{name}}': customerName,
        '{{customerName}}': customerName,
        '{{email}}': customerEmail,
        '{{phone}}': phoneNumber,
        '{{phoneNumber}}': phoneNumber,
        '{{location}}': location,
        '{{caseType}}': caseType,
        '{{date}}': new Date().toLocaleDateString(),
        '{{time}}': new Date().toLocaleTimeString(),
        '{{requestNumber}}': requestNumber,
        '{{quotesUrl}}': quotesUrl,
        '{{quotesButton}}': quotesButton,
      };

      Object.entries(variables).forEach(([variable, value]) => {
        processedHtml = processedHtml.replace(new RegExp(variable, 'g'), value);
        processedSubject = processedSubject.replace(new RegExp(variable, 'g'), value);
      });

      // Send email using the existing sendEmail function
      console.log(`📧 Sending template "${template.name}" email to ${customerEmail}...`);
      
      const result = await sendEmail(
        customerEmail,
        processedSubject,
        processedHtml,
        template.textContent || '' // Use text content if available
      );

      console.log(`📧 Template email sent successfully to ${customerEmail}`);

      res.json({ 
        success: true, 
        recipientEmail: customerEmail,
        templateName: template.name,
        emailId: result.messageId
      });

    } catch (error) {
      console.error('Error sending template email:', error);
      res.status(500).json({ error: "Failed to send template email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
