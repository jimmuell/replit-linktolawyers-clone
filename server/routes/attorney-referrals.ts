import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  legalRequests, 
  referralAssignments, 
  attorneys,
  attorneyFeeSchedule,
  caseTypes,
  quotes,
  cases,
  attorneyNotes,
  structuredIntakes,
  caseDocuments,
  insertReferralAssignmentSchema,
  insertQuoteSchema,
  insertCaseSchema,
  insertAttorneyNoteSchema
} from "@shared/schema";
import { eq, and, isNull, desc, asc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import multer from "multer";
import { ObjectStorageService } from "../objectStorage";

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'image/heic', 'image/heif',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and image files are allowed'));
    }
    cb(null, true);
  },
});

const router = Router();

// Get available referrals (unassigned structured intake submissions)
router.get("/available", requireAuth, async (req, res) => {
  try {
    const { caseType, location, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build where conditions - only unassigned submissions
    const whereConditions = [isNull(referralAssignments.id)];
    
    if (caseType && typeof caseType === 'string' && caseType !== 'all') {
      whereConditions.push(eq(structuredIntakes.caseType, caseType));
    }
    if (location && typeof location === 'string' && location !== 'all') {
      whereConditions.push(eq(structuredIntakes.state, location));
    }
    if (status && typeof status === 'string' && status !== 'all') {
      whereConditions.push(eq(structuredIntakes.status, status));
    }

    // Apply sorting
    let orderByClause;
    if (sortBy === 'firstName') {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.firstName) : desc(structuredIntakes.firstName);
    } else if (sortBy === 'lastName') {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.lastName) : desc(structuredIntakes.lastName);
    } else if (sortBy === 'caseType') {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.caseType) : desc(structuredIntakes.caseType);
    } else if (sortBy === 'location') {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.state) : desc(structuredIntakes.state);
    } else if (sortBy === 'status') {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.status) : desc(structuredIntakes.status);
    } else {
      orderByClause = sortOrder === 'asc' ? asc(structuredIntakes.createdAt) : desc(structuredIntakes.createdAt);
    }

    const query = db
      .select({
        id: structuredIntakes.id,
        requestNumber: structuredIntakes.requestNumber,
        firstName: structuredIntakes.firstName,
        lastName: structuredIntakes.lastName,
        email: structuredIntakes.email,
        phoneNumber: structuredIntakes.phoneNumber,
        caseType: structuredIntakes.caseType,
        caseDescription: sql<string>`''`.as('caseDescription'),
        location: structuredIntakes.state,
        state: structuredIntakes.state,
        status: structuredIntakes.status,
        formResponses: structuredIntakes.formResponses,
        attorneyIntakeSummary: structuredIntakes.attorneyIntakeSummary,
        createdAt: structuredIntakes.createdAt,
        updatedAt: structuredIntakes.updatedAt,
      })
      .from(structuredIntakes)
      .leftJoin(referralAssignments, eq(structuredIntakes.id, referralAssignments.submissionId))
      .where(and(...whereConditions))
      .orderBy(orderByClause);

    const availableReferrals = await query.execute();

    // Parse formResponses from JSON string to object
    const parsedReferrals = availableReferrals.map(referral => ({
      ...referral,
      formResponses: referral.formResponses ? JSON.parse(referral.formResponses) : null
    }));

    res.json({ success: true, data: parsedReferrals });
  } catch (error) {
    console.error('Error fetching available referrals:', error);
    res.status(500).json({ error: 'Failed to fetch available referrals' });
  }
});

// Get attorney's assigned referrals
router.get("/my-referrals", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;

    // Fetch referrals from both legacy legal_requests (via request_id) and structured_intakes (via submission_id)
    const results = await db.execute(sql`
      SELECT 
        ra.id as assignment_id,
        ra.status as assignment_status,
        ra.assigned_at,
        ra.notes,
        ra.request_id,
        ra.submission_id,
        q.id as quote_id,
        q.status as quote_status,
        COALESCE(lr.id, si.id) as ref_id,
        COALESCE(lr.request_number, si.request_number) as request_number,
        COALESCE(lr.first_name, si.first_name) as first_name,
        COALESCE(lr.last_name, si.last_name) as last_name,
        COALESCE(lr.email, si.email) as email,
        COALESCE(lr.phone_number, si.phone_number) as phone_number,
        COALESCE(lr.case_type, si.case_type) as case_type,
        COALESCE(lr.case_description, '') as case_description,
        COALESCE(lr.location, si.state, '') as location,
        COALESCE(lr.status, si.status) as ref_status,
        COALESCE(lr.created_at, si.created_at) as ref_created_at
      FROM referral_assignments ra
      LEFT JOIN legal_requests lr ON ra.request_id = lr.id
      LEFT JOIN structured_intakes si ON ra.submission_id = si.id
      LEFT JOIN quotes q ON q.assignment_id = ra.id
      WHERE ra.attorney_id = ${attorneyId}
        AND (lr.id IS NOT NULL OR si.id IS NOT NULL)
      ORDER BY ra.assigned_at DESC
    `);

    const myReferrals = results.rows.map((row: any) => ({
      assignmentId: row.assignment_id,
      assignmentStatus: row.assignment_status,
      assignedAt: row.assigned_at,
      notes: row.notes,
      quoteId: row.quote_id,
      quoteStatus: row.quote_status,
      request: {
        id: row.ref_id,
        requestNumber: row.request_number,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
        caseType: row.case_type,
        caseDescription: row.case_description,
        location: row.location,
        status: row.ref_status,
        createdAt: row.ref_created_at,
      }
    }));

    res.json({ success: true, data: myReferrals });
  } catch (error) {
    console.error('Error fetching my referrals:', error);
    res.status(500).json({ error: 'Failed to fetch your referrals' });
  }
});

// Assign a referral to the current attorney
router.post("/assign/:requestId", requireAuth, async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user!.id;
    const { notes } = req.body;
    
    // Debug: console.log('ASSIGN ENDPOINT: Looking up attorney for user ID:', userId);
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;
    // Debug: console.log('ASSIGN ENDPOINT: Using attorney ID:', attorneyId);

    // Check if this attorney is already assigned to this request
    const existingAssignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.requestId, requestId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (existingAssignment.length > 0) {
      return res.status(400).json({ error: 'You are already assigned to this referral' });
    }

    // Create the assignment
    const [assignment] = await db
      .insert(referralAssignments)
      .values({
        requestId,
        attorneyId,
        status: 'assigned',
        notes: notes || null,
      })
      .returning();

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error assigning referral:', error);
    res.status(500).json({ error: 'Failed to assign referral' });
  }
});

// Update referral assignment status
router.patch("/assignment/:assignmentId/status", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const { status, notes } = req.body;
    const userId = req.user!.id;
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;

    // Verify the assignment belongs to this attorney
    const assignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or not authorized' });
    }

    // Update the assignment
    const [updatedAssignment] = await db
      .update(referralAssignments)
      .set({
        status,
        notes: notes || assignment[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(referralAssignments.id, assignmentId))
      .returning();

    res.json({ success: true, data: updatedAssignment });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment status' });
  }
});

// Submit a quote for a referral
router.post("/assignment/:assignmentId/quote", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user!.id;
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;
    
    const validatedData = insertQuoteSchema.parse({
      assignmentId,
      ...req.body
    });

    // Verify the assignment belongs to this attorney
    const assignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or not authorized' });
    }

    // Create the quote
    const [quote] = await db
      .insert(quotes)
      .values(validatedData)
      .returning();

    // Update assignment status to quoted
    await db
      .update(referralAssignments)
      .set({
        status: 'quoted',
        updatedAt: new Date(),
      })
      .where(eq(referralAssignments.id, assignmentId));

    // Update the request status to quotes_received (first quote makes it "Quotes Available")
    if (assignment[0].requestId) {
      await db
        .update(legalRequests)
        .set({
          status: 'quotes_received',
          updatedAt: new Date(),
        })
        .where(eq(legalRequests.id, assignment[0].requestId));
    }

    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error submitting quote:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid quote data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to submit quote' });
  }
});

// Add a note to a referral assignment
router.post("/assignment/:assignmentId/note", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user!.id;

    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);

    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }

    const attorneyId = attorney[0].id;
    
    const validatedData = insertAttorneyNoteSchema.parse({
      attorneyId,
      assignmentId,
      ...req.body
    });

    // Verify the assignment belongs to this attorney
    const assignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or not authorized' });
    }

    // Create the note
    const [note] = await db
      .insert(attorneyNotes)
      .values(validatedData)
      .returning();

    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Error adding note:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid note data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Get attorney fee schedule for a specific case type
router.get("/fee-schedule/:caseType", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const caseType = req.params.caseType;
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;
    
    // Get case type ID from the case type value
    const caseTypeRecord = await db
      .select({ id: caseTypes.id })
      .from(caseTypes)
      .where(eq(caseTypes.value, caseType))
      .limit(1);
      
    if (caseTypeRecord.length === 0) {
      return res.status(404).json({ error: 'Case type not found' });
    }
    
    const caseTypeId = caseTypeRecord[0].id;
    
    // Get attorney fee schedule for this case type
    const feeSchedule = await db
      .select()
      .from(attorneyFeeSchedule)
      .where(and(
        eq(attorneyFeeSchedule.attorneyId, attorneyId),
        eq(attorneyFeeSchedule.caseTypeId, caseTypeId),
        eq(attorneyFeeSchedule.isActive, true)
      ))
      .limit(1);
      
    if (feeSchedule.length === 0) {
      return res.json({ success: true, data: null }); // No fee schedule found
    }
    
    res.json({ success: true, data: feeSchedule[0] });
  } catch (error) {
    console.error('Error fetching attorney fee schedule:', error);
    res.status(500).json({ error: 'Failed to fetch fee schedule' });
  }
});

// Get notes for an assignment
router.get("/assignment/:assignmentId/notes", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user!.id;

    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);

    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }

    const attorneyId = attorney[0].id;

    // Verify the assignment belongs to this attorney
    const assignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (assignment.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or not authorized' });
    }

    // Get notes for this assignment
    const notes = await db
      .select()
      .from(attorneyNotes)
      .where(eq(attorneyNotes.assignmentId, assignmentId))
      .orderBy(desc(attorneyNotes.createdAt));

    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get quotes for a specific assignment (attorney-only)
router.get("/assignment/:assignmentId/quotes", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify this assignment belongs to the attorney
    const [assignment] = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorney.id)
      ));

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized' });
    }

    // Get quotes for this assignment
    const assignmentQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.assignmentId, assignmentId))
      .orderBy(desc(quotes.sentAt));

    res.json({ success: true, data: assignmentQuotes });
  } catch (error) {
    console.error('Error fetching assignment quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get assigned attorneys for a specific request (public endpoint for tracking)
router.get("/public/request/:requestId/attorneys", async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    
    // Get all assigned attorneys from request_attorney_assignments table (admin system)
    const assignmentResults = await db.execute(sql`
      SELECT 
        ra.id as assignment_id,
        ra.status as assignment_status,
        ra.assigned_at,
        ra.email_sent,
        ra.email_sent_at,
        a.id as attorney_id,
        a.first_name,
        a.last_name,
        a.firm_name,
        a.license_state,
        a.practice_areas,
        a.years_of_experience,
        a.is_verified,
        a.bio
      FROM request_attorney_assignments ra
      JOIN attorneys a ON ra.attorney_id = a.id
      WHERE ra.request_id = ${requestId}
      ORDER BY ra.assigned_at DESC
    `);

    // Transform the data to match the admin endpoint structure
    const transformedAssignments = assignmentResults.rows.map((row: any) => ({
      id: row.assignment_id,
      requestId: requestId,
      attorneyId: row.attorney_id,
      assignedAt: row.assigned_at,
      status: row.assignment_status,
      notes: null,
      emailSent: row.email_sent,
      emailSentAt: row.email_sent_at,
      createdAt: row.assigned_at,
      updatedAt: row.assigned_at,
      attorney: {
        id: row.attorney_id,
        firstName: row.first_name,
        lastName: row.last_name,
        firmName: row.firm_name,
        licenseState: row.license_state,
        practiceAreas: row.practice_areas,
        yearsOfExperience: row.years_of_experience,
        isVerified: row.is_verified,
        bio: row.bio,
      }
    }));
    
    // Return raw array format to match admin endpoint
    res.json(transformedAssignments);
  } catch (error) {
    console.error('Error fetching assigned attorneys for request:', error);
    res.status(500).json({ error: 'Failed to fetch assigned attorneys' });
  }
});

// Get quotes for a specific request (public endpoint for tracking)
router.get("/public/request/:requestId/quotes", async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    
    // Use a simpler approach - get quotes separately then join data
    const quoteResults = await db.execute(sql`
      SELECT 
        q.id as quote_id,
        q.service_fee,
        q.description,
        q.terms,
        q.valid_until,
        q.status as quote_status,
        q.sent_at,
        a.id as attorney_id,
        a.first_name,
        a.last_name,
        a.firm_name,
        a.license_state,
        a.practice_areas,
        a.years_of_experience,
        a.is_verified,
        a.bio,
        ra.id as assignment_id,
        ra.status as assignment_status
      FROM quotes q
      JOIN referral_assignments ra ON q.assignment_id = ra.id
      JOIN attorneys a ON ra.attorney_id = a.id
      WHERE ra.request_id = ${requestId}
      ORDER BY q.sent_at DESC
    `);

    // Transform the data to match the expected structure
    const transformedQuotes = quoteResults.rows.map((row: any) => ({
      quote: {
        id: row.quote_id,
        serviceFee: row.service_fee,
        description: row.description,
        terms: row.terms,
        validUntil: row.valid_until,
        status: row.quote_status,
        sentAt: row.sent_at,
      },
      attorney: {
        id: row.attorney_id,
        firstName: row.first_name,
        lastName: row.last_name,
        firmName: row.firm_name,
        licenseState: row.license_state,
        practiceAreas: row.practice_areas,
        experienceYears: row.years_of_experience,
        isVerified: row.is_verified,
        bio: row.bio,
      },
      assignment: {
        id: row.assignment_id,
        status: row.assignment_status,
      }
    }));
    
    res.json({ success: true, data: transformedQuotes });
  } catch (error) {
    console.error('Error fetching quotes for request:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Unassign attorney from a request
router.delete("/assignment/:assignmentId/unassign", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify this assignment belongs to the attorney
    const [assignment] = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorney.id)
      ));

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized' });
    }

    // Check if there are any quotes for this assignment
    const existingQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.assignmentId, assignmentId));

    // Delete any existing quotes first
    if (existingQuotes.length > 0) {
      await db.delete(quotes).where(eq(quotes.assignmentId, assignmentId));
    }

    // Delete the assignment
    await db.delete(referralAssignments).where(eq(referralAssignments.id, assignmentId));

    res.json({ 
      success: true, 
      message: 'Successfully unassigned from request',
      quotesDeleted: existingQuotes.length
    });
  } catch (error) {
    console.error('Error unassigning attorney:', error);
    res.status(500).json({ error: 'Failed to unassign attorney' });
  }
});

// Update/edit a quote
router.put("/assignment/:assignmentId/quote/:quoteId", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const quoteId = parseInt(req.params.quoteId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify this assignment belongs to the attorney
    const [assignment] = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorney.id)
      ));

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized' });
    }

    // Verify the quote belongs to this assignment
    const [existingQuote] = await db
      .select()
      .from(quotes)
      .where(and(
        eq(quotes.id, quoteId),
        eq(quotes.assignmentId, assignmentId)
      ));

    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Validate the update data
    const updateData = insertQuoteSchema.omit({ assignmentId: true }).parse(req.body);

    // Update the quote
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))
      .returning();

    res.json({ success: true, data: updatedQuote });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Delete a quote
router.delete("/assignment/:assignmentId/quote/:quoteId", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const quoteId = parseInt(req.params.quoteId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify this assignment belongs to the attorney
    const [assignment] = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.id, assignmentId),
        eq(referralAssignments.attorneyId, attorney.id)
      ));

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized' });
    }

    // Verify the quote belongs to this assignment
    const [existingQuote] = await db
      .select()
      .from(quotes)
      .where(and(
        eq(quotes.id, quoteId),
        eq(quotes.assignmentId, assignmentId)
      ));

    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Delete the quote
    const deletedResult = await db.delete(quotes).where(eq(quotes.id, quoteId)).returning();
    
    if (deletedResult.length === 0) {
      return res.status(404).json({ error: 'Quote not found or already deleted' });
    }

    // Update assignment status back to assigned since quote is removed
    await db
      .update(referralAssignments)
      .set({ 
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(referralAssignments.id, assignmentId));

    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// PATCH /api/attorney-referrals/quotes/:quoteId/status - Update quote status (public endpoint)
router.patch("/quotes/:quoteId/status", async (req, res) => {
  try {
    const quoteId = parseInt(req.params.quoteId);
    const { status } = req.body;

    if (!quoteId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quote ID and status are required' 
      });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status must be either "accepted" or "declined"' 
      });
    }

    // Update the quote status
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status: status,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, quoteId))
      .returning();

    if (!updatedQuote) {
      return res.status(404).json({ 
        success: false, 
        error: 'Quote not found' 
      });
    }

    const [assignment] = await db
      .select()
      .from(referralAssignments)
      .where(eq(referralAssignments.id, updatedQuote.assignmentId));

    if (status === 'accepted' && assignment) {
      await db
        .update(referralAssignments)
        .set({
          status: 'accepted',
          updatedAt: new Date(),
        })
        .where(eq(referralAssignments.id, updatedQuote.assignmentId));

      let otherAssignments: any[] = [];
      if (assignment.submissionId) {
        otherAssignments = await db
          .select()
          .from(referralAssignments)
          .where(eq(referralAssignments.submissionId, assignment.submissionId));
      } else if (assignment.requestId) {
        otherAssignments = await db
          .select()
          .from(referralAssignments)
          .where(eq(referralAssignments.requestId, assignment.requestId));
      }

      for (const otherAssignment of otherAssignments) {
        if (otherAssignment.id !== updatedQuote.assignmentId) {
          await db
            .update(quotes)
            .set({
              status: 'declined',
              respondedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(and(
              eq(quotes.assignmentId, otherAssignment.id),
              eq(quotes.status, 'pending')
            ));

          await db
            .update(referralAssignments)
            .set({
              status: 'rejected',
              updatedAt: new Date(),
            })
            .where(eq(referralAssignments.id, otherAssignment.id));
        }
      }
    } else if (status === 'declined' && assignment) {
      await db
        .update(referralAssignments)
        .set({
          status: 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(referralAssignments.id, updatedQuote.assignmentId));
    }

    res.json({ success: true, data: updatedQuote });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update quote status' 
    });
  }
});

// Start a case from an accepted quote
router.post("/cases/start", requireAuth, async (req, res) => {
  try {
    const { quoteId, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify the quote exists and is accepted
    const [quote] = await db
      .select({
        id: quotes.id,
        assignmentId: quotes.assignmentId,
        status: quotes.status,
      })
      .from(quotes)
      .innerJoin(referralAssignments, eq(quotes.assignmentId, referralAssignments.id))
      .where(and(
        eq(quotes.id, quoteId),
        eq(referralAssignments.attorneyId, attorney.id),
        eq(quotes.status, 'accepted')
      ));

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found, not accepted, or unauthorized' });
    }

    // Check if case already exists for this quote
    const [existingCase] = await db
      .select()
      .from(cases)
      .where(eq(cases.quoteId, quoteId));

    if (existingCase) {
      return res.status(400).json({ error: 'Case already exists for this quote' });
    }

    // Generate case number
    const caseCount = await db.select({ count: sql<number>`count(*)` }).from(cases);
    const caseNumber = `CS-${String(caseCount[0].count + 1).padStart(6, '0')}`;

    // Create the case
    const [newCase] = await db
      .insert(cases)
      .values({
        assignmentId: quote.assignmentId,
        quoteId: quoteId,
        caseNumber: caseNumber,
        status: 'active',
        startDate: new Date(),
        notes: notes || '',
      })
      .returning();

    res.json({ success: true, data: newCase });
  } catch (error) {
    console.error('Error starting case:', error);
    res.status(500).json({ error: 'Failed to start case' });
  }
});

// Get cases for an attorney
router.get("/cases", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Get cases for this attorney with related data (supports both legacy legal_requests and structured intakes)
    const attorneyCases = await db.execute(sql`
      SELECT 
        c.id as case_id,
        c.case_number,
        c.status as case_status,
        c.start_date,
        c.completed_date,
        c.notes as case_notes,
        c.updated_at as case_updated_at,
        c.quote_id,
        q.service_fee,
        q.description as quote_description,
        COALESCE(lr.id, si.id) as request_id,
        COALESCE(lr.request_number, si.request_number) as request_number,
        COALESCE(lr.first_name, si.first_name) as first_name,
        COALESCE(lr.last_name, si.last_name) as last_name,
        COALESCE(lr.email, si.email) as email,
        COALESCE(lr.phone_number, si.phone_number) as phone_number,
        COALESCE(lr.case_type, si.case_type) as case_type,
        lr.case_description,
        lr.location
      FROM cases c
      JOIN quotes q ON c.quote_id = q.id
      JOIN referral_assignments ra ON c.assignment_id = ra.id
      LEFT JOIN legal_requests lr ON ra.request_id = lr.id
      LEFT JOIN structured_intakes si ON ra.submission_id = si.id
      WHERE ra.attorney_id = ${attorney.id}
      ORDER BY c.start_date DESC
    `);

    // Transform the data
    const transformedCases = attorneyCases.rows.map((row: any) => ({
      caseId: row.case_id,
      caseNumber: row.case_number,
      caseStatus: row.case_status,
      startDate: row.start_date,
      completedDate: row.completed_date,
      caseNotes: row.case_notes,
      caseUpdatedAt: row.case_updated_at,
      quoteId: row.quote_id,
      serviceFee: row.service_fee,
      quoteDescription: row.quote_description,
      request: {
        id: row.request_id,
        requestNumber: row.request_number,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
        caseType: row.case_type,
        caseDescription: row.case_description || '',
        location: row.location || '',
      }
    }));

    res.json({ success: true, data: transformedCases });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Update case status or notes
router.patch("/cases/:caseId", requireAuth, async (req, res) => {
  try {
    const caseId = parseInt(req.params.caseId);
    const { status, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get attorney ID from user
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    // Verify case belongs to this attorney
    const [caseData] = await db
      .select()
      .from(cases)
      .innerJoin(referralAssignments, eq(cases.assignmentId, referralAssignments.id))
      .where(and(
        eq(cases.id, caseId),
        eq(referralAssignments.attorneyId, attorney.id)
      ));

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found or unauthorized' });
    }

    // Update case
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'completed') updateData.completedDate = new Date();

    const [updatedCase] = await db
      .update(cases)
      .set(updateData)
      .where(eq(cases.id, caseId))
      .returning();

    res.json({ success: true, data: updatedCase });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Assign a structured intake submission to the current attorney
router.post("/assign-submission/:submissionId", requireAuth, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.submissionId);
    const userId = req.user!.id;
    const { notes } = req.body;
    
    // Get the attorney ID from the attorneys table using the user ID
    const attorney = await db
      .select({ id: attorneys.id })
      .from(attorneys)
      .where(eq(attorneys.userId, userId))
      .limit(1);
      
    if (attorney.length === 0) {
      return res.status(404).json({ error: 'Attorney profile not found' });
    }
    
    const attorneyId = attorney[0].id;

    // Check if this attorney is already assigned to this submission
    const existingAssignment = await db
      .select()
      .from(referralAssignments)
      .where(and(
        eq(referralAssignments.submissionId, submissionId),
        eq(referralAssignments.attorneyId, attorneyId)
      ))
      .limit(1);

    if (existingAssignment.length > 0) {
      return res.status(400).json({ error: 'You are already assigned to this submission' });
    }

    // Create the assignment with submissionId
    const [assignment] = await db
      .insert(referralAssignments)
      .values({
        submissionId,
        attorneyId,
        status: 'assigned',
        notes: notes || null,
      })
      .returning();

    // Update the structured intake status to 'assigned'
    await db
      .update(structuredIntakes)
      .set({ status: 'assigned', updatedAt: new Date() })
      .where(eq(structuredIntakes.id, submissionId));

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error assigning submission:', error);
    res.status(500).json({ error: 'Failed to assign submission' });
  }
});

// ============ DOCUMENT UPLOAD ENDPOINTS ============

router.post("/assignment/:assignmentId/documents", requireAuth, documentUpload.single('file'), async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, req.user!.userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }
    const attorneyId = attorney.id;

    const [assignment] = await db.select().from(referralAssignments)
      .where(and(eq(referralAssignments.id, assignmentId), eq(referralAssignments.attorneyId, attorneyId)));
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const objectStorageService = new ObjectStorageService();
    let storagePath: string;

    if (objectStorageService.isLocalMode()) {
      storagePath = await objectStorageService.uploadLocalFile(req.file.buffer, req.file.mimetype);
    } else {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: req.file.buffer,
        headers: { 'Content-Type': req.file.mimetype },
      });
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(uploadURL, {
        owner: `attorney-${attorneyId}`,
        visibility: 'private' as any,
      });
      storagePath = objectPath;
    }

    const existingCase = await db.select().from(cases)
      .where(eq(cases.assignmentId, assignmentId));
    const caseId = existingCase.length > 0 ? existingCase[0].id : null;

    const [document] = await db.insert(caseDocuments).values({
      assignmentId,
      caseId,
      attorneyId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storagePath,
    }).returning();

    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.get("/assignment/:assignmentId/documents", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, req.user!.userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    const [assignment] = await db.select().from(referralAssignments)
      .where(and(eq(referralAssignments.id, assignmentId), eq(referralAssignments.attorneyId, attorney.id)));
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const docs = await db.select().from(caseDocuments)
      .where(eq(caseDocuments.assignmentId, assignmentId))
      .orderBy(desc(caseDocuments.uploadedAt));

    res.json({ success: true, data: docs });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get("/documents/:documentId/download", async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || (req.query.token as string);
    if (!sessionId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { getSession } = await import('../middleware/auth');
    const sessionData = getSession(sessionId);
    if (!sessionData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, sessionData.userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney access required' });
    }
    const attorneyId = attorney.id;

    const [doc] = await db.select().from(caseDocuments)
      .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.attorneyId, attorneyId)));
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const objectStorageService = new ObjectStorageService();
    const encodedFileName = encodeURIComponent(doc.fileName);

    if (objectStorageService.isLocalMode()) {
      const filePath = objectStorageService.getLocalFilePath(doc.storagePath);
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      res.setHeader('Content-Type', doc.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${encodedFileName}"`);
      fs.createReadStream(filePath).pipe(res);
    } else {
      const objectFile = await objectStorageService.getObjectEntityFile(doc.storagePath);
      res.setHeader('Content-Disposition', `inline; filename="${encodedFileName}"`);
      await objectStorageService.downloadObject(objectFile, res);
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

router.delete("/documents/:documentId", requireAuth, async (req, res) => {
  try {
    const documentId = parseInt(req.params.documentId);
    const [attorney] = await db.select().from(attorneys).where(eq(attorneys.userId, req.user!.userId));
    if (!attorney) {
      return res.status(403).json({ error: 'Attorney profile not found' });
    }

    const [doc] = await db.select().from(caseDocuments)
      .where(and(eq(caseDocuments.id, documentId), eq(caseDocuments.attorneyId, attorney.id)));
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.delete(caseDocuments).where(eq(caseDocuments.id, documentId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;