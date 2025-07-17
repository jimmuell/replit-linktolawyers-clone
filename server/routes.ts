import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertCaseTypeSchema, insertLegalRequestSchema, insertSmtpSettingsSchema, sendEmailSchema, insertAttorneySchema, insertAttorneyFeeScheduleSchema, insertRequestAttorneyAssignmentSchema, type User } from "@shared/schema";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";

// Simple session store for demo
const sessions = new Map<string, { userId: number; role: string }>();

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
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = sessions.get(sessionId);
    next();
  };

  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

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
      sessions.set(sessionId, { userId: user.id, role: user.role });

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
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // Get current user
  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
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
      
      if (!emailTemplate || !emailTemplate.html || !emailTemplate.subject) {
        return res.status(400).json({ success: false, error: "Email template is required" });
      }
      
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
      
      // Create transporter and send email
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
        to: recipientEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text || ''
      };

      try {
        const result = await transporter.sendMail(mailOptions);
        
        // Store successful email in history
        await storage.createEmailHistory({
          toAddress: recipientEmail,
          subject: emailTemplate.subject,
          message: emailTemplate.html,
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
          subject: emailTemplate.subject,
          message: emailTemplate.html,
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
    } catch (error) {
      console.error('SMTP test failed:', error);
      res.status(500).json({ 
        message: 'SMTP connection failed', 
        error: error.message,
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
      } catch (error) {
        // Store failed email in history
        await storage.createEmailHistory({
          toAddress: validatedData.to,
          subject: validatedData.subject,
          message: validatedData.message,
          status: 'failed',
          errorMessage: error.message,
        });

        res.status(500).json({ 
          message: 'Failed to send email',
          error: error.message
        });
      }
    } catch (error) {
      console.error('Email send error:', error);
      res.status(400).json({ 
        message: 'Invalid email data',
        error: error.message
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
        try {
          // Create email content for each attorney
          const subject = `This Email is Intended for ${attorney.firstName} ${attorney.lastName}`;
          const emailContent = `
            <h2>New Legal Case Assignment</h2>
            <p>Dear ${attorney.firstName} ${attorney.lastName},</p>
            
            <p>You have been assigned to a new legal case. Please review the details below:</p>
            
            <h3>Case Information</h3>
            <ul>
              <li><strong>Request Number:</strong> ${request.requestNumber}</li>
              <li><strong>Client Name:</strong> ${request.firstName} ${request.lastName}</li>
              <li><strong>Email:</strong> ${request.email}</li>
              <li><strong>Phone:</strong> ${request.phoneNumber}</li>
              <li><strong>Case Type:</strong> ${request.caseType}</li>
              <li><strong>Status:</strong> ${request.status}</li>
              <li><strong>Submitted:</strong> ${new Date(request.createdAt).toLocaleDateString()}</li>
            </ul>
            
            <h3>Case Details</h3>
            <p><strong>Description:</strong></p>
            <p>${request.caseDescription}</p>
            
            <h3>Additional Information</h3>
            <ul>
              <li><strong>Budget:</strong> $${request.budget}</li>
              <li><strong>Timeline:</strong> ${request.timeline}</li>
              <li><strong>Priority:</strong> ${request.priority}</li>
              <li><strong>Preferred Language:</strong> ${request.preferredLanguage}</li>
            </ul>
            
            <p>Please log into the attorney portal to review this case and take appropriate action.</p>
            
            <p>Best regards,<br>LinkToLawyers Team</p>
          `;

          const mailOptions = {
            from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
            to: 'linktolawyers.us@gmail.com', // Override email address
            subject: subject,
            text: emailContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            html: emailContent,
          };

          await transporter.sendMail(mailOptions);

          // Store successful email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: subject,
            message: emailContent,
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
        } catch (error) {
          console.error(`Failed to send email to ${attorney.email}:`, error);
          
          // Store failed email in history
          await storage.createEmailHistory({
            toAddress: 'linktolawyers.us@gmail.com',
            subject: `This Email is Intended for ${attorney.firstName} ${attorney.lastName}`,
            message: '',
            status: 'failed',
            errorMessage: error.message,
          });

          emailResults.push({
            attorneyId: attorney.id,
            attorneyName: `${attorney.firstName} ${attorney.lastName}`,
            email: attorney.email,
            success: false,
            error: error.message
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

  const httpServer = createServer(app);
  return httpServer;
}
