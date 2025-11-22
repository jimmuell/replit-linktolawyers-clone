# Flow: Fiance(e) Visa ("K-1 visa") - Beneficiary

## 📋 Flow Metadata

- **Flow ID**: fiance(e)-visa-("k-1-visa")---beneficiary
- **Version**: 1.0
- **Total Screens**: 11
- **Total Connections**: 11
- **Estimated Completion Time**: 6 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 11 screens and 11 connections.
The flow is designed to guide users through a structured conversation with conditional branching.

## 🛠️ Implementation Guidelines for AI Agents

### Tech Stack Requirements
- **Frontend Framework**: React + TypeScript
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS (use semantic tokens from design system)
- **State Management**: React hooks (useState, useReducer)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: Conditional navigation based on user responses
- **Icons**: lucide-react

### Key Implementation Concepts
- Use a single component that renders different screens based on current state
- Track user responses in a state object keyed by node ID
- Implement conditional navigation using the connection rules
- Store all responses for final submission
- Maintain navigation history for back button functionality
- Show loading states during async operations
- Implement proper error handling and validation

## 🎨 UI/UX Requirements

### Visual Design
- Use gradient backgrounds (e.g., `bg-gradient-to-br from-primary/5 to-secondary/10`)
- Card-based layout with shadows for depth (`shadow-lg`, `shadow-xl`)
- Consistent spacing using Tailwind spacing scale
- Icons for visual feedback (lucide-react)
- Smooth transitions between screens (`transition-all duration-300`)
- Use semantic color tokens from design system (primary, secondary, accent)

### Responsive Design
- Mobile-first approach
- Max width for forms: `max-w-md` (28rem / 448px) on desktop
- Max width for content: `max-w-2xl` (42rem / 672px) on desktop
- Touch-friendly buttons (min height: `h-11` or 44px)
- Adequate spacing between interactive elements
- Stack elements vertically on mobile

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader friendly announcements
- High contrast text (WCAG AA compliance)
- Focus indicators on interactive elements
- Error messages associated with form fields

## 📊 Flow Structure

### Nodes (Screens)

#### 1. 🚀 Start - `eb577bda-4a4f-44d6-afc7-01fc7a016fc4`

**Type**: Start Screen
**Brand Name**: Flow App

**Implementation Details**:
- Display brand logo/name prominently at top
- Show welcome message in large, readable text
- Include a primary CTA button labeled "Start" or "Begin"
- Button should use `variant="default"` with full width on mobile
- Center content vertically and horizontally
- Use gradient background for visual appeal

**Example Button**:
```tsx
<Button onClick={() => handleNext()} size="lg" className="w-full sm:w-auto">
  Start
</Button>
```

#### 2. ✍️ Text Input - `af115126-8279-4fff-b984-1dc8a8b74c6d`

**Type**: Text Input Question
**Question**: The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.

**Validation Rules**:
- Minimum length: 2 characters
- Maximum length: 500 characters
- Required field (cannot be empty or whitespace only)
- Trim whitespace before validation

**Error Messages**:
- Empty: "This field is required"
- Too short: "Please enter at least 2 characters"
- Too long: "Please enter no more than 500 characters"

**Implementation Details**:
- Use `<Input>` or `<Textarea>` component from shadcn/ui
- Show character count if using textarea
- Display validation errors below input
- Auto-focus input on screen load
- Submit on Enter key (if using Input)

**Zod Schema**:
```typescript
z.string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(500, "Please enter no more than 500 characters")
```

#### 3. ❓ Yes/No Question - `bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c`

**Type**: Yes/No Question
**Question**: You are the fiancé(e) coming to the U.S., and your U.S. citizen fiancé(e) is sponsoring you. You plan to get married within 90 days of arriving. Is that correct?
**Yes Label**: "Yes"
**No Label**: "No"

**Implementation Details**:
- Display question text prominently (text-2xl or text-3xl)
- Render two large, touch-friendly buttons side by side (or stacked on mobile)
- Yes button: `variant="default"` (primary color)
- No button: `variant="outline"` or `variant="secondary"`
- Use `min-h-[44px]` for accessibility
- Add hover and focus states
- Include back button if not first screen

**Example Buttons**:
```tsx
<div className="flex gap-4">
  <Button onClick={() => handleAnswer('yes')} size="lg" className="flex-1">
    Yes
  </Button>
  <Button onClick={() => handleAnswer('no')} variant="outline" size="lg" className="flex-1">
    No
  </Button>
</div>
```

#### 4. ❓ Yes/No Question - `af8846d2-ec4a-4471-8b50-e628009aec9f`

**Type**: Yes/No Question
**Question**: Have you ever filed or applied for any U.S. immigration benefit
**Yes Label**: "Yes"
**No Label**: "No"

**Implementation Details**:
- Display question text prominently (text-2xl or text-3xl)
- Render two large, touch-friendly buttons side by side (or stacked on mobile)
- Yes button: `variant="default"` (primary color)
- No button: `variant="outline"` or `variant="secondary"`
- Use `min-h-[44px]` for accessibility
- Add hover and focus states
- Include back button if not first screen

**Example Buttons**:
```tsx
<div className="flex gap-4">
  <Button onClick={() => handleAnswer('yes')} size="lg" className="flex-1">
    Yes
  </Button>
  <Button onClick={() => handleAnswer('no')} variant="outline" size="lg" className="flex-1">
    No
  </Button>
</div>
```

#### 5. ✍️ Text Input - `feb87304-5379-45bc-bc2a-a6292eb9e185`

**Type**: Text Input Question
**Question**: If yes, please briefly explain the type of immigration benefit you applied for. 

**Validation Rules**:
- Minimum length: 2 characters
- Maximum length: 500 characters
- Required field (cannot be empty or whitespace only)
- Trim whitespace before validation

**Error Messages**:
- Empty: "This field is required"
- Too short: "Please enter at least 2 characters"
- Too long: "Please enter no more than 500 characters"

**Implementation Details**:
- Use `<Input>` or `<Textarea>` component from shadcn/ui
- Show character count if using textarea
- Display validation errors below input
- Auto-focus input on screen load
- Submit on Enter key (if using Input)

**Zod Schema**:
```typescript
z.string()
  .trim()
  .min(2, "Please enter at least 2 characters")
  .max(500, "Please enter no more than 500 characters")
```

#### 6. ❓ Yes/No Question - `e09e7c01-5296-448b-b935-3718e5ca2251`

**Type**: Yes/No Question
**Question**: Have you ever been married before? 
**Yes Label**: "Yes"
**No Label**: "No"

**Implementation Details**:
- Display question text prominently (text-2xl or text-3xl)
- Render two large, touch-friendly buttons side by side (or stacked on mobile)
- Yes button: `variant="default"` (primary color)
- No button: `variant="outline"` or `variant="secondary"`
- Use `min-h-[44px]` for accessibility
- Add hover and focus states
- Include back button if not first screen

**Example Buttons**:
```tsx
<div className="flex gap-4">
  <Button onClick={() => handleAnswer('yes')} size="lg" className="flex-1">
    Yes
  </Button>
  <Button onClick={() => handleAnswer('no')} variant="outline" size="lg" className="flex-1">
    No
  </Button>
</div>
```

#### 7. ☑️ Multiple Choice - `e0e3c0ce-110d-4d96-8de6-df40014f770c`

**Type**: Multiple Choice Question
**Question**: Is there an age gap between you and your fiancé(e)?
**Options** (5):
  1. "Yes, less than a year " (id: `1`)
  2. "Yes, 1-5 years" (id: `2`)
  3. "Yes, 6-10 years" (id: `1763512205064`)
  4. "Yes, 11-15 years" (id: `1763512211712`)
  5. "Yes, more than 20 years" (id: `1763512218346`)

**Implementation Details**:
- Display question text prominently
- Render clickable card buttons for each option
- Cards should have hover effect (`hover:border-primary`)
- Use radio button indicators inside cards
- Highlight selected option with primary border/background
- Include "Continue" button that's enabled only after selection
- Alternative: Use RadioGroup component from shadcn/ui

**Example Card Option**:
```tsx
<Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelected(option.id)}>
  <CardContent className="p-4 flex items-center gap-3">
    <div className="w-4 h-4 rounded-full border-2 {selected === option.id ? 'bg-primary border-primary' : 'border-muted'}" />
    <span>{option.label}</span>
  </CardContent>
</Card>
```

#### 8. ❓ Yes/No Question - `e1e221c0-8a4d-4ade-8012-339f3c75aad6`

**Type**: Yes/No Question
**Question**: Have you met in person within the last 2 years? 
**Yes Label**: "Yes"
**No Label**: "No"

**Implementation Details**:
- Display question text prominently (text-2xl or text-3xl)
- Render two large, touch-friendly buttons side by side (or stacked on mobile)
- Yes button: `variant="default"` (primary color)
- No button: `variant="outline"` or `variant="secondary"`
- Use `min-h-[44px]` for accessibility
- Add hover and focus states
- Include back button if not first screen

**Example Buttons**:
```tsx
<div className="flex gap-4">
  <Button onClick={() => handleAnswer('yes')} size="lg" className="flex-1">
    Yes
  </Button>
  <Button onClick={() => handleAnswer('no')} variant="outline" size="lg" className="flex-1">
    No
  </Button>
</div>
```

#### 9. ☑️ Multiple Choice - `78b4b2a7-3121-40dc-a773-38c80b639b04`

**Type**: Multiple Choice Question
**Question**: How long have you been in a relationship with your significant other? 
**Options** (4):
  1. "Less than 6 months " (id: `1`)
  2. "6 months to 1 year" (id: `2`)
  3. "1 to 2 years" (id: `1763512328222`)
  4. "More than 2 years" (id: `1763512334130`)

**Implementation Details**:
- Display question text prominently
- Render clickable card buttons for each option
- Cards should have hover effect (`hover:border-primary`)
- Use radio button indicators inside cards
- Highlight selected option with primary border/background
- Include "Continue" button that's enabled only after selection
- Alternative: Use RadioGroup component from shadcn/ui

**Example Card Option**:
```tsx
<Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelected(option.id)}>
  <CardContent className="p-4 flex items-center gap-3">
    <div className="w-4 h-4 rounded-full border-2 {selected === option.id ? 'bg-primary border-primary' : 'border-muted'}" />
    <span>{option.label}</span>
  </CardContent>
</Card>
```

#### 10. ☑️ Multiple Choice - `16612c82-2470-4e37-b132-790f7bb43a89`

**Type**: Multiple Choice Question
**Question**: Where are you currently located? 
**Options** (2):
  1. "Inside the U.S. " (id: `1`)
  2. "Outside the U.S." (id: `2`)

**Implementation Details**:
- Display question text prominently
- Render clickable card buttons for each option
- Cards should have hover effect (`hover:border-primary`)
- Use radio button indicators inside cards
- Highlight selected option with primary border/background
- Include "Continue" button that's enabled only after selection
- Alternative: Use RadioGroup component from shadcn/ui

**Example Card Option**:
```tsx
<Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelected(option.id)}>
  <CardContent className="p-4 flex items-center gap-3">
    <div className="w-4 h-4 rounded-full border-2 {selected === option.id ? 'bg-primary border-primary' : 'border-muted'}" />
    <span>{option.label}</span>
  </CardContent>
</Card>
```

#### 11. ✅ Completion - `ca77071f-d337-41f6-b0f2-394b42a585dc`

**Type**: Completion Screen
**Title**: Thank You!
**Message**: We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.
**Legal Disclaimer**: Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.
**Additional Info Prompt**: Would you like to add any more details about your case? This helps the attorney understand your case better.
**Additional Info Field Validation**:
- Optional field (not required)
- Maximum 1000 characters
- Multiline textarea


**Implementation Details**:
- Display success icon (CheckCircle from lucide-react)
- Show thank you title prominently (text-3xl)
- Display thank you message below title
- If legal disclaimer exists, show in smaller text with muted color
- Include optional textarea for additional information
- Textarea should have placeholder: "Would you like to add any more details about your case? This helps the attorney understand your case better."
- Include "Submit" or "Finish" button
- Show loading state during final submission
- Consider showing confetti or success animation
- After submission, either redirect or show final confirmation

**Example Layout**:
```tsx
<div className="text-center space-y-4">
  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
  <h1 className="text-3xl font-bold">Thank You!</h1>
  <p className="text-muted-foreground">We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.</p>
  <Textarea placeholder="Would you like to add any more details about your case? This helps the attorney understand your case better." className="mt-4" />
  <Button onClick={handleSubmit} size="lg">Finish</Button>
</div>
```


### 🔗 Conditional Logic (Connections)

#### Connection Conditions Explained
- **"any"**: Proceed to next screen on any user action (button click, form submit, bypass condition)
- **"yes"**: Only proceed if user selects "Yes" option
- **"no"**: Only proceed if user selects "No" option
- **"[option-id]"**: Proceed if specific option is selected in multiple choice

#### Connections List
1. **From**: Start
   **To**: You are the fiancé(e) coming to the U.S., and your U.S. citizen fiancé(e) is sponsoring you. You plan to get married within 90 days of arriving. Is that correct?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: You are the fiancé(e) coming to the U.S., and your U.S. citizen fiancé(e) is sponsoring you. You plan to get married within 90 days of arriving. Is that correct?
   **To**: The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

3. **From**: You are the fiancé(e) coming to the U.S., and your U.S. citizen fiancé(e) is sponsoring you. You plan to get married within 90 days of arriving. Is that correct?
   **To**: Have you ever filed or applied for any U.S. immigration benefit
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

4. **From**: Have you ever filed or applied for any U.S. immigration benefit
   **To**: If yes, please briefly explain the type of immigration benefit you applied for. 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

5. **From**: Have you ever filed or applied for any U.S. immigration benefit
   **To**: Have you ever been married before? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

6. **From**: If yes, please briefly explain the type of immigration benefit you applied for. 
   **To**: Have you ever been married before? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

7. **From**: Have you ever been married before? 
   **To**: Is there an age gap between you and your fiancé(e)?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: Is there an age gap between you and your fiancé(e)?
   **To**: Have you met in person within the last 2 years? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: Have you met in person within the last 2 years? 
   **To**: How long have you been in a relationship with your significant other? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: How long have you been in a relationship with your significant other? 
   **To**: Where are you currently located? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

11. **From**: Where are you currently located? 
   **To**: Completion
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)


## 🚨 Error Handling

### Form Validation Errors
- Show inline error messages below each field
- Use destructive/red color for error text and borders
- Prevent form submission until all errors are resolved
- Display field-specific error messages from Zod schema
- Clear errors when user starts typing/correcting

### Network Errors
- Show retry button on failed submissions
- Display user-friendly error messages (avoid technical jargon)
- Preserve user data when errors occur (don't clear form)
- Use toast notifications for transient errors
- Provide help text for common error scenarios

### Loading States
- Show spinner or loading indicator during API calls
- Disable submit buttons while processing (`disabled` prop)
- Change button text to "Submitting..." or show loading icon
- Prevent double submissions with button disabled state
- Show skeleton loaders for async content

## 💡 Implementation Tips

### 1. State Structure
```typescript
interface FlowState {
  currentNodeId: string;
  responses: Record<string, any>;
  nodeHistory: string[];
  isSubmitting: boolean;
  error: string | null;
}
```

### 2. Navigation Function
```typescript
function getNextNode(currentNodeId: string, userResponse: any): string | null {
  const connections = flowData.connections.filter(c => c.sourceNodeId === currentNodeId);
  
  // Check for bypass condition (any)
  const anyConnection = connections.find(c => c.condition === 'any');
  if (anyConnection) return anyConnection.targetNodeId;
  
  // Check for specific condition match
  const matchedConnection = connections.find(c => c.condition === userResponse);
  return matchedConnection?.targetNodeId || null;
}
```

### 3. Form Validation (Zod Schema)
Create schemas for each node type:
```typescript
const nodeSchemas: Record<string, z.ZodSchema> = {
  [nodeId]: z.object({
    fieldName: z.string().min(2, "Minimum 2 characters").max(100, "Maximum 100 characters"),
    email: z.string().email("Invalid email address"),
  })
};
```

### 4. Back Navigation
- Maintain `nodeHistory` array: push current node before navigating forward
- Add "Back" button on all screens except Start screen
- Pop from history and navigate: `setCurrentNode(nodeHistory[nodeHistory.length - 1])`
- Restore previous responses when going back (keep in state)

### 5. Progress Indicator
- For linear flows: Show "Step X of Y"
- For branching flows: Show number of completed screens
- Use progress bar component: `<Progress value={(currentStep / totalSteps) * 100} />`
- Update progress as user advances through flow

### 6. Data Persistence
- Save responses to localStorage on each step (for recovery)
- Submit to backend on completion screen
- Clear localStorage after successful submission
- Restore from localStorage if user refreshes page mid-flow

## 🎨 Branding Configuration

- **App Name**: "Flow App" (customizable)
- **Logo**: Display brand logo if provided
- **Primary Color**: Use semantic token `hsl(var(--primary))` from design system
- **Font**: System font stack or custom font family
- **Welcome Message**: Provide engaging welcome text

## 🔌 API Integration

### Submission Endpoint
```typescript
POST /api/flow/submit
Headers: {
  "Content-Type": "application/json"
}
Body: {
  flowId: "fiance(e)-visa-("k-1-visa")---beneficiary",
  responses: Record<string, any>,
  timestamp: string // ISO-8601 format
}
```

### Expected Response
```json
{
  "success": true,
  "submissionId": "uuid-string",
  "message": "Thank you for your submission"
}
```

## 📦 Expected Response Data Structure

```json
{
  "eb577bda-4a4f-44d6-afc7-01fc7a016fc4": { "started": true, "timestamp": "ISO-8601" },
  "af115126-8279-4fff-b984-1dc8a8b74c6d": "user text input",
  "bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c": "yes" | "no",
  "af8846d2-ec4a-4471-8b50-e628009aec9f": "yes" | "no",
  "feb87304-5379-45bc-bc2a-a6292eb9e185": "user text input",
  "e09e7c01-5296-448b-b935-3718e5ca2251": "yes" | "no",
  "e0e3c0ce-110d-4d96-8de6-df40014f770c": "option-id",
  "e1e221c0-8a4d-4ade-8012-339f3c75aad6": "yes" | "no",
  "78b4b2a7-3121-40dc-a773-38c80b639b04": "option-id",
  "16612c82-2470-4e37-b132-790f7bb43a89": "option-id",
  "ca77071f-d337-41f6-b0f2-394b42a585dc": { "additionalInfo": "optional text", "completed": true }
}
```

## 🧪 Testing Requirements

### Unit Tests
- Form validation logic (Zod schemas)
- Navigation function (`getNextNode`)
- State management (reducer/hooks)
- Utility functions

### Integration Tests
- Complete flow navigation (start to finish)
- API submission and error handling
- Back navigation and state restoration
- Form validation and error display

### Accessibility Tests
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (ARIA labels)
- Color contrast (WCAG AA)
- Focus management

## ⚡ Performance Requirements

- **Initial Load**: < 3 seconds
- **Screen Transitions**: < 300ms (smooth animations)
- **Form Submission**: < 2 seconds
- **Image Loading**: Lazy load, use optimized formats (WebP)
- **Bundle Size**: Minimize with code splitting
- **Caching**: Use localStorage for responses

## 📊 Analytics Events to Track

Track these events for analytics:
- `flow_started`: User begins the flow
- `screen_viewed`: User views a specific screen (include node ID)
- `form_submitted`: User submits a form screen
- `error_encountered`: User encounters validation or network error
- `flow_completed`: User completes entire flow
- `flow_abandoned`: User leaves mid-flow (exit event)
- `back_clicked`: User navigates back



---

## 📦 Full JSON Export

```json
{
  "name": "Fiance(e) Visa (\"K-1 visa\") - Beneficiary",
  "description": "",
  "nodes": [
    {
      "id": "eb577bda-4a4f-44d6-afc7-01fc7a016fc4",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1112.21519048253,
        "y": -354.473034120687
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "af115126-8279-4fff-b984-1dc8a8b74c6d",
      "type": "text",
      "question": "The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -806.381395229487,
        "y": -253.129430999758
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c",
      "type": "yes-no",
      "question": "You are the fiancé(e) coming to the U.S., and your U.S. citizen fiancé(e) is sponsoring you. You plan to get married within 90 days of arriving. Is that correct?",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -802.00051270865,
        "y": -378.993154339323
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "af8846d2-ec4a-4471-8b50-e628009aec9f",
      "type": "yes-no",
      "question": "Have you ever filed or applied for any U.S. immigration benefit",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -448.426378227066,
        "y": -383.360220953697
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "feb87304-5379-45bc-bc2a-a6292eb9e185",
      "type": "text",
      "question": "If yes, please briefly explain the type of immigration benefit you applied for. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -447.060243197705,
        "y": -248.977368257576
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "e09e7c01-5296-448b-b935-3718e5ca2251",
      "type": "yes-no",
      "question": "Have you ever been married before? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -67.615747305251,
        "y": -353.052186811669
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "e0e3c0ce-110d-4d96-8de6-df40014f770c",
      "type": "multiple-choice",
      "question": "Is there an age gap between you and your fiancé(e)?",
      "options": [
        {
          "id": "1",
          "label": "Yes, less than a year "
        },
        {
          "id": "2",
          "label": "Yes, 1-5 years"
        },
        {
          "id": "1763512205064",
          "label": "Yes, 6-10 years"
        },
        {
          "id": "1763512211712",
          "label": "Yes, 11-15 years"
        },
        {
          "id": "1763512218346",
          "label": "Yes, more than 20 years"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 285.609840277728,
        "y": -403.425013339712
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "e1e221c0-8a4d-4ade-8012-339f3c75aad6",
      "type": "yes-no",
      "question": "Have you met in person within the last 2 years? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 651.402293319325,
        "y": -345.295204910621
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "78b4b2a7-3121-40dc-a773-38c80b639b04",
      "type": "multiple-choice",
      "question": "How long have you been in a relationship with your significant other? ",
      "options": [
        {
          "id": "1",
          "label": "Less than 6 months "
        },
        {
          "id": "2",
          "label": "6 months to 1 year"
        },
        {
          "id": "1763512328222",
          "label": "1 to 2 years"
        },
        {
          "id": "1763512334130",
          "label": "More than 2 years"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1002.44962422281,
        "y": -394.918212106186
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "16612c82-2470-4e37-b132-790f7bb43a89",
      "type": "multiple-choice",
      "question": "Where are you currently located? ",
      "options": [
        {
          "id": "1",
          "label": "Inside the U.S. "
        },
        {
          "id": "2",
          "label": "Outside the U.S."
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1367.67495718217,
        "y": -369.39780840561
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "ca77071f-d337-41f6-b0f2-394b42a585dc",
      "type": "completion",
      "question": "Completion",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1749.43368178733,
        "y": -322.61040162122
      },
      "thankYouTitle": "Thank You!",
      "thankYouMessage": "We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.",
      "legalDisclaimer": "Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.",
      "additionalInfoPrompt": "Would you like to add any more details about your case? This helps the attorney understand your case better.",
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    }
  ],
  "connections": [
    {
      "id": "8a826a14-6707-4636-9388-c68e16c67a25",
      "sourceNodeId": "eb577bda-4a4f-44d6-afc7-01fc7a016fc4",
      "targetNodeId": "bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c",
      "condition": "any"
    },
    {
      "id": "a92928cb-1306-4876-ac98-1a7b02d25aa2",
      "sourceNodeId": "bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c",
      "targetNodeId": "af115126-8279-4fff-b984-1dc8a8b74c6d",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "f442648a-b9bb-43ba-8bde-baa9831c061d",
      "sourceNodeId": "bcb872ef-fdcb-4135-a0f1-3339bd1c5e0c",
      "targetNodeId": "af8846d2-ec4a-4471-8b50-e628009aec9f",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "542bd2ae-84c0-4cb8-9a35-e25dc1df9397",
      "sourceNodeId": "af8846d2-ec4a-4471-8b50-e628009aec9f",
      "targetNodeId": "feb87304-5379-45bc-bc2a-a6292eb9e185",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "91ce3fa5-e235-4952-873a-15d708370bf0",
      "sourceNodeId": "af8846d2-ec4a-4471-8b50-e628009aec9f",
      "targetNodeId": "e09e7c01-5296-448b-b935-3718e5ca2251",
      "condition": "any"
    },
    {
      "id": "dfc13545-3929-452e-8aaf-b9b1287c1063",
      "sourceNodeId": "feb87304-5379-45bc-bc2a-a6292eb9e185",
      "targetNodeId": "e09e7c01-5296-448b-b935-3718e5ca2251",
      "condition": "any"
    },
    {
      "id": "dc064e95-f08b-42b1-8649-f87a447921ad",
      "sourceNodeId": "e09e7c01-5296-448b-b935-3718e5ca2251",
      "targetNodeId": "e0e3c0ce-110d-4d96-8de6-df40014f770c",
      "condition": "any"
    },
    {
      "id": "a0a371cd-68b7-420f-ab42-e57ca404ad18",
      "sourceNodeId": "e0e3c0ce-110d-4d96-8de6-df40014f770c",
      "targetNodeId": "e1e221c0-8a4d-4ade-8012-339f3c75aad6",
      "condition": "any"
    },
    {
      "id": "01b44d4a-d6ac-4dd2-8201-3e3b45ec2805",
      "sourceNodeId": "e1e221c0-8a4d-4ade-8012-339f3c75aad6",
      "targetNodeId": "78b4b2a7-3121-40dc-a773-38c80b639b04",
      "condition": "any"
    },
    {
      "id": "bc90ec8b-861d-417f-8249-c772e26e2936",
      "sourceNodeId": "78b4b2a7-3121-40dc-a773-38c80b639b04",
      "targetNodeId": "16612c82-2470-4e37-b132-790f7bb43a89",
      "condition": "any"
    },
    {
      "id": "36335639-9b95-4057-8c2e-7f23832b83c8",
      "sourceNodeId": "16612c82-2470-4e37-b132-790f7bb43a89",
      "targetNodeId": "ca77071f-d337-41f6-b0f2-394b42a585dc",
      "condition": "any"
    }
  ]
}
```
