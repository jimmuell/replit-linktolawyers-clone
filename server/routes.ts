import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertCaseTypeSchema, insertLegalRequestSchema, insertSmtpSettingsSchema, sendEmailSchema, insertAttorneySchema, insertAttorneyFeeScheduleSchema, insertRequestAttorneyAssignmentSchema, insertBlogPostSchema, insertEmailTemplateSchema, updateEmailTemplateSchema, type User } from "@shared/schema";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { getProcessedTemplate, getLegalRequestConfirmationVariables, getAttorneyAssignmentVariables } from "./emailTemplateService";
import { generateConfirmationEmail } from "../client/src/lib/emailTemplates";
import { setSession, getSession, removeSession, requireAuth } from "./middleware/auth";
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

// Email rate limiting
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 emails per windowMs
  message: { message: 'Too many emails sent, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// SMTP transporter creation
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

  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

  const requireAdmin = requireRole('admin');

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
  app.get("/api/admin/case-types", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const caseTypes = await storage.getAllCaseTypes();
      res.json(caseTypes);
    } catch (error) {
      console.error("Error fetching case types:", error);
      res.status(500).json({ error: "Failed to fetch case types" });
    }
  });

  app.post("/api/admin/case-types", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const validatedData = insertCaseTypeSchema.parse(req.body);
      const caseType = await storage.createCaseType(validatedData);
      res.json(caseType);
    } catch (error) {
      console.error("Error creating case type:", error);
      res.status(500).json({ error: "Failed to create case type" });
    }
  });

  app.put("/api/admin/case-types/:id", requireAuth, requireRole('admin'), async (req, res) => {
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

  app.delete("/api/admin/case-types/:id", requireAuth, requireRole('admin'), async (req, res) => {
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
      
      // Create transporter and send email
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
        to: recipientEmail,
        subject: finalEmailTemplate.subject,
        html: finalEmailTemplate.html,
        text: finalEmailTemplate.text || ''
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        
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
      
      // Create transporter and send email
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
        to: recipientEmail,
        subject: finalEmailTemplate.subject,
        html: finalEmailTemplate.html,
        text: finalEmailTemplate.text || ''
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        
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
  app.get("/api/legal-requests", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const legalRequests = await storage.getAllLegalRequests();
      res.json(legalRequests);
    } catch (error) {
      console.error("Error fetching legal requests:", error);
      res.status(500).json({ success: false, error: "Failed to fetch legal requests" });
    }
  });

  // Update legal request
  app.put("/api/legal-requests/:id", requireAuth, requireRole('admin'), async (req, res) => {
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
  app.delete("/api/legal-requests/:id", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLegalRequest(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting legal request:", error);
      res.status(500).json({ success: false, error: "Failed to delete legal request" });
    }
  });

  app.get("/api/admin/legal-requests", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const legalRequests = await storage.getAllLegalRequests();
      res.json({ success: true, data: legalRequests });
    } catch (error) {
      console.error("Error fetching legal requests:", error);
      res.status(500).json({ success: false, error: "Failed to fetch legal requests" });
    }
  });

  // Admin only routes
  app.get('/api/admin/users', requireAuth, requireRole('admin'), async (req, res) => {
    // This would get all users - implement as needed
    res.json({ message: 'Admin users endpoint' });
  });

  // SMTP Configuration routes
  app.get('/api/smtp/settings', requireAuth, requireRole('admin'), async (req, res) => {
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

  app.post('/api/smtp/settings', requireAuth, requireRole('admin'), async (req, res) => {
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

  // Test SMTP connection
  app.post('/api/smtp/test', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const transporter = await createTransporter();
      await transporter.verify();
      res.json({ message: 'SMTP connection successful', status: 'connected' });
    } catch (error: any) {
      console.error('SMTP test failed:', error);
      res.status(500).json({ 
        message: 'SMTP connection failed', 
        error: error?.message || 'Unknown error',
        status: 'failed'
      });
    }
  });

  // Send email route
  app.post('/api/email/send', emailLimiter, requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const validatedData = sendEmailSchema.parse(req.body);
      const transporter = await createTransporter();
      const settings = await storage.getSmtpSettings();
      
      if (!settings) {
        return res.status(400).json({ error: 'SMTP settings not configured' });
      }
      
      const mailOptions = {
        from: `${settings.fromName} <${settings.fromEmail}>`,
        to: validatedData.to,
        subject: validatedData.subject,
        text: validatedData.message,
        html: validatedData.message.replace(/\n/g, '<br>'),
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        
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
  app.get('/api/email/history', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.post('/api/attorneys', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.get('/api/attorneys', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const attorneys = await storage.getAllAttorneys();
      res.json(attorneys);
    } catch (error) {
      console.error('Error fetching attorneys:', error);
      res.status(500).json({ error: 'Failed to fetch attorneys' });
    }
  });

  // Get attorney by ID
  app.get('/api/attorneys/:id', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.put('/api/attorneys/:id', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.delete('/api/attorneys/:id', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.post('/api/attorney-fee-schedule', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.get('/api/attorney-fee-schedule', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const feeSchedules = await storage.getAllAttorneyFeeSchedules();
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error fetching attorney fee schedules:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedules' });
    }
  });

  // Get attorney fee schedule by attorney ID
  app.get('/api/attorney-fee-schedule/attorney/:attorneyId', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const feeSchedules = await storage.getAttorneyFeeScheduleByAttorney(parseInt(req.params.attorneyId));
      res.json(feeSchedules);
    } catch (error) {
      console.error('Error fetching attorney fee schedule:', error);
      res.status(500).json({ error: 'Failed to fetch attorney fee schedule' });
    }
  });

  // Get specific attorney fee schedule by attorney and case type
  app.get('/api/attorney-fee-schedule/attorney/:attorneyId/case-type/:caseTypeId', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.put('/api/attorney-fee-schedule/:id', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.delete('/api/attorney-fee-schedule/:id', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteAttorneyFeeSchedule(parseInt(req.params.id));
      res.json({ message: 'Attorney fee schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting attorney fee schedule:', error);
      res.status(500).json({ error: 'Failed to delete attorney fee schedule' });
    }
  });

  // Bulk create attorney fee schedules
  app.post('/api/attorney-fee-schedule/bulk', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.get('/api/attorneys/case-type/:caseType', requireAuth, requireRole('admin'), async (req, res) => {
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

          const mailOptions = {
            from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
            to: 'linktolawyers.us@gmail.com', // Override email address
            subject: subject,
            html: htmlContent,
            text: textContent,
          };

          const result = await transporter.sendMail(mailOptions);
          
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
  app.get('/api/requests/:requestId/attorneys', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const assignments = await storage.getRequestAttorneyAssignments(parseInt(req.params.requestId));
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching request attorney assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Assign attorneys to a request
  app.post('/api/requests/:requestId/attorneys', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.put('/api/assignments/:assignmentId', requireAuth, requireRole('admin'), async (req, res) => {
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
  app.delete('/api/assignments/:assignmentId', requireAuth, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteRequestAttorneyAssignment(parseInt(req.params.assignmentId));
      res.json({ message: 'Attorney assignment removed successfully' });
    } catch (error) {
      console.error('Error removing attorney assignment:', error);
      res.status(500).json({ error: 'Failed to remove assignment' });
    }
  });

  // Send email to assigned attorneys for a request
  app.post('/api/requests/:requestId/send-attorney-emails', requireAuth, requireRole('admin'), async (req, res) => {
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

          const mailOptions = {
            from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
            to: 'linktolawyers.us@gmail.com', // Override email address
            subject: subject,
            text: textContent,
            html: htmlContent,
          };

          await transporter.sendMail(mailOptions);

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

  const httpServer = createServer(app);
  return httpServer;
}
