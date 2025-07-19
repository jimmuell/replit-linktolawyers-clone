import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  legalRequests, 
  referralAssignments, 
  attorneys,
  attorneyFeeSchedule,
  caseTypes,
  informationRequests,
  quotes,
  cases,
  attorneyNotes,
  insertReferralAssignmentSchema,
  insertInformationRequestSchema,
  insertQuoteSchema,
  insertCaseSchema,
  insertAttorneyNoteSchema
} from "@shared/schema";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Get available referrals (unassigned legal requests)
router.get("/available", requireAuth, async (req, res) => {
  try {
    const { caseType, location, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = db
      .select({
        id: legalRequests.id,
        requestNumber: legalRequests.requestNumber,
        firstName: legalRequests.firstName,
        lastName: legalRequests.lastName,
        email: legalRequests.email,
        phoneNumber: legalRequests.phoneNumber,
        caseType: legalRequests.caseType,
        caseDescription: legalRequests.caseDescription,
        location: legalRequests.location,
        status: legalRequests.status,
        createdAt: legalRequests.createdAt,
        updatedAt: legalRequests.updatedAt,
      })
      .from(legalRequests)
      .leftJoin(referralAssignments, eq(legalRequests.id, referralAssignments.requestId))
      .where(isNull(referralAssignments.id)); // Only unassigned requests

    // Apply filters
    if (caseType && typeof caseType === 'string' && caseType !== 'all') {
      query = query.where(eq(legalRequests.caseType, caseType));
    }
    if (location && typeof location === 'string' && location !== 'all') {
      query = query.where(eq(legalRequests.location, location));
    }
    if (status && typeof status === 'string' && status !== 'all') {
      query = query.where(eq(legalRequests.status, status));
    }

    // Apply sorting
    const sortField = legalRequests[sortBy as keyof typeof legalRequests] || legalRequests.createdAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortField));
    } else {
      query = query.orderBy(desc(sortField));
    }

    const availableReferrals = await query.execute();

    res.json({ success: true, data: availableReferrals });
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

    const myReferrals = await db
      .select({
        assignmentId: referralAssignments.id,
        assignmentStatus: referralAssignments.status,
        assignedAt: referralAssignments.assignedAt,
        notes: referralAssignments.notes,
        request: {
          id: legalRequests.id,
          requestNumber: legalRequests.requestNumber,
          firstName: legalRequests.firstName,
          lastName: legalRequests.lastName,
          email: legalRequests.email,
          phoneNumber: legalRequests.phoneNumber,
          caseType: legalRequests.caseType,
          caseDescription: legalRequests.caseDescription,
          location: legalRequests.location,
          status: legalRequests.status,
          createdAt: legalRequests.createdAt,
        }
      })
      .from(referralAssignments)
      .innerJoin(legalRequests, eq(referralAssignments.requestId, legalRequests.id))
      .where(eq(referralAssignments.attorneyId, attorneyId))
      .orderBy(desc(referralAssignments.assignedAt));

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
    
    console.log('ASSIGN ENDPOINT: Looking up attorney for user ID:', userId);
    
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
    console.log('ASSIGN ENDPOINT: Using attorney ID:', attorneyId);

    // Check if request exists and is not already assigned
    const existingAssignment = await db
      .select()
      .from(referralAssignments)
      .where(eq(referralAssignments.requestId, requestId))
      .limit(1);

    if (existingAssignment.length > 0) {
      return res.status(400).json({ error: 'This referral is already assigned' });
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

// Request additional information from client
router.post("/assignment/:assignmentId/request-info", requireAuth, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const attorneyId = req.user!.id;
    
    const validatedData = insertInformationRequestSchema.parse({
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

    // Create the information request
    const [infoRequest] = await db
      .insert(informationRequests)
      .values(validatedData)
      .returning();

    // Update assignment status to info_requested
    await db
      .update(referralAssignments)
      .set({
        status: 'info_requested',
        updatedAt: new Date(),
      })
      .where(eq(referralAssignments.id, assignmentId));

    res.json({ success: true, data: infoRequest });
  } catch (error) {
    console.error('Error requesting information:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to request information' });
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
    const attorneyId = req.user!.id;
    
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
    const attorneyId = req.user!.id;

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

export default router;