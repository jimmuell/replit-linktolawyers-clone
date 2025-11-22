# Flow: Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions ")

## 📋 Flow Metadata

- **Flow ID**: make-my-2-year-conditional-green-card-permanent-("removal-of-conditions-")
- **Version**: 1.0
- **Total Screens**: 11
- **Total Connections**: 12
- **Estimated Completion Time**: 6 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 11 screens and 12 connections.
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

#### 1. 🚀 Start - `a031aebe-b299-4e12-9159-56d8fbe954ba`

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

#### 2. ❓ Yes/No Question - `4ee548df-a65d-4849-9b1f-6472816ef6e9`

**Type**: Yes/No Question
**Question**: Great! You got your green card through marriage and it's valid for 2 years (conditional green card), correct? 
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

#### 3. ✍️ Text Input - `7a6c0119-38c3-42b3-94c5-5c00061d2c06`

**Type**: Text Input Question
**Question**: Green cards based on marriage can be conditional (valid for 2 years) or permanent (valid for 10 years). Based on your answer, you may not have a conditional green card.

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

#### 4. ✍️ Text Input - `cfce5549-6d8a-4b7c-b340-f892868f17db`

**Type**: Text Input Question
**Question**: What is the start date on your green card? An approximate month / year is fine. 

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

#### 5. ☑️ Multiple Choice - `245eb236-71ef-4721-ab5a-c10788738930`

**Type**: Multiple Choice Question
**Question**: On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1= very little and 10 = a lot)
**Options** (10):
  1. "1 - very little " (id: `1`)
  2. "2" (id: `2`)
  3. "3" (id: `1763349441567`)
  4. "4" (id: `1763349445543`)
  5. "5" (id: `1763349448101`)
  6. "6" (id: `1763349448368`)
  7. "7" (id: `1763349448573`)
  8. "8" (id: `1763349448771`)
  9. "9" (id: `1763349448960`)
  10. "10 - A lot " (id: `1763349451805`)

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

#### 6. ☑️ Multiple Choice - `634a6104-df7e-4bc9-bc39-146e50d33135`

**Type**: Multiple Choice Question
**Question**: How will you file your application? (check on)
**Options** (3):
  1. "Together with my spouse ("joint filing")" (id: `1`)
  2. "On my own ("with waiver") " (id: `2`)
  3. "Not sure yet" (id: `1763349604485`)

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

#### 7. ☑️ Multiple Choice - `90cf1d3d-ade3-481a-99b9-45639a90aec9`

**Type**: Multiple Choice Question
**Question**: What is your current marital situation? 
**Options** (4):
  1. "Married living together " (id: `1`)
  2. "Married, but living apart " (id: `2`)
  3. "Divorced" (id: `1763349653991`)
  4. "Widow(er) " (id: `1763349654471`)

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

#### 8. ☑️ Multiple Choice - `3cefacaf-b304-4bdb-ab4b-0a4459573b87`

**Type**: Multiple Choice Question
**Question**: How involved will your spouse be in your case? 
**Options** (3):
  1. "Fully involved - will help provide documents and cooperate with the process" (id: `1`)
  2. "Somewhat involved - may help with some things, but not fully sure yet" (id: `2`)
  3. "Not involved - will not help or provide any documents" (id: `1763350276320`)

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

#### 9. ✅ End - `9ba0c208-dad5-4db6-8a6c-3b4e3dd5e303`

**Type**: Completion Screen
**Title**: Thank You
**Message**: Your responses have been recorded.

**Implementation Details**:
- Display success icon (CheckCircle from lucide-react)
- Show thank you title prominently (text-3xl)
- Display thank you message below title
- If legal disclaimer exists, show in smaller text with muted color
- Include "Submit" or "Finish" button
- Show loading state during final submission
- Consider showing confetti or success animation
- After submission, either redirect or show final confirmation

**Example Layout**:
```tsx
<div className="text-center space-y-4">
  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
  <h1 className="text-3xl font-bold">Thank You</h1>
  <p className="text-muted-foreground">Your responses have been recorded.</p>
  <Button onClick={handleSubmit} size="lg">Finish</Button>
</div>
```

#### 10. ❓ Yes/No Question - `f692fc28-d902-4843-8934-cd0f864b05fa`

**Type**: Yes/No Question
**Question**: Have you already submitted your application to remove the conditions on your green card? (Form I-751). 
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

#### 11. ☑️ Multiple Choice - `2fd13dc8-9533-41cf-ae89-731c3d64c6d6`

**Type**: Multiple Choice Question
**Question**: If yes, did you file it together with your spouse or on your own? 
**Options** (3):
  1. "Together with my spouse " (id: `1`)
  2. "On my own " (id: `1763351103099`)
  3. "Not sure" (id: `1763351320600`)

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


### 🔗 Conditional Logic (Connections)

#### Connection Conditions Explained
- **"any"**: Proceed to next screen on any user action (button click, form submit, bypass condition)
- **"yes"**: Only proceed if user selects "Yes" option
- **"no"**: Only proceed if user selects "No" option
- **"[option-id]"**: Proceed if specific option is selected in multiple choice

#### Connections List
1. **From**: Start
   **To**: Great! You got your green card through marriage and it's valid for 2 years (conditional green card), correct? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: Great! You got your green card through marriage and it's valid for 2 years (conditional green card), correct? 
   **To**: Green cards based on marriage can be conditional (valid for 2 years) or permanent (valid for 10 years). Based on your answer, you may not have a conditional green card.
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

3. **From**: What is the start date on your green card? An approximate month / year is fine. 
   **To**: On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1= very little and 10 = a lot)
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

4. **From**: On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1= very little and 10 = a lot)
   **To**: How will you file your application? (check on)
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

5. **From**: How will you file your application? (check on)
   **To**: How involved will your spouse be in your case? 
   **Condition**: On my own ("with waiver") 
   **Description**: Proceeds when user selects "On my own ("with waiver") "

6. **From**: How involved will your spouse be in your case? 
   **To**: What is your current marital situation? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

7. **From**: How will you file your application? (check on)
   **To**: What is your current marital situation? 
   **Condition**: Together with my spouse ("joint filing")
   **Description**: Proceeds when user selects "Together with my spouse ("joint filing")"

8. **From**: What is your current marital situation? 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: Great! You got your green card through marriage and it's valid for 2 years (conditional green card), correct? 
   **To**: Have you already submitted your application to remove the conditions on your green card? (Form I-751). 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

10. **From**: Have you already submitted your application to remove the conditions on your green card? (Form I-751). 
   **To**: If yes, did you file it together with your spouse or on your own? 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

11. **From**: Have you already submitted your application to remove the conditions on your green card? (Form I-751). 
   **To**: What is the start date on your green card? An approximate month / year is fine. 
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

12. **From**: If yes, did you file it together with your spouse or on your own? 
   **To**: What is the start date on your green card? An approximate month / year is fine. 
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
  flowId: "make-my-2-year-conditional-green-card-permanent-("removal-of-conditions-")",
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
  "a031aebe-b299-4e12-9159-56d8fbe954ba": { "started": true, "timestamp": "ISO-8601" },
  "4ee548df-a65d-4849-9b1f-6472816ef6e9": "yes" | "no",
  "7a6c0119-38c3-42b3-94c5-5c00061d2c06": "user text input",
  "cfce5549-6d8a-4b7c-b340-f892868f17db": "user text input",
  "245eb236-71ef-4721-ab5a-c10788738930": "option-id",
  "634a6104-df7e-4bc9-bc39-146e50d33135": "option-id",
  "90cf1d3d-ade3-481a-99b9-45639a90aec9": "option-id",
  "3cefacaf-b304-4bdb-ab4b-0a4459573b87": "option-id",
  "9ba0c208-dad5-4db6-8a6c-3b4e3dd5e303": { "additionalInfo": "optional text", "completed": true },
  "f692fc28-d902-4843-8934-cd0f864b05fa": "yes" | "no",
  "2fd13dc8-9533-41cf-ae89-731c3d64c6d6": "option-id"
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
  "name": "Make My 2-Year Conditional Green Card Permanent (\"Removal of Conditions \")",
  "description": "",
  "nodes": [
    {
      "id": "a031aebe-b299-4e12-9159-56d8fbe954ba",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -142.8,
        "y": 92
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
      "id": "4ee548df-a65d-4849-9b1f-6472816ef6e9",
      "type": "yes-no",
      "question": "Great! You got your green card through marriage and it's valid for 2 years (conditional green card), correct? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 206.54629727875,
        "y": 77.047436532236
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
      "id": "7a6c0119-38c3-42b3-94c5-5c00061d2c06",
      "type": "text",
      "question": "Green cards based on marriage can be conditional (valid for 2 years) or permanent (valid for 10 years). Based on your answer, you may not have a conditional green card.",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 207.443134122854,
        "y": 249.623420410744
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
      "id": "cfce5549-6d8a-4b7c-b340-f892868f17db",
      "type": "text",
      "question": "What is the start date on your green card? An approximate month / year is fine. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1000.72156706143,
        "y": 112.811710205372
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
      "id": "245eb236-71ef-4721-ab5a-c10788738930",
      "type": "multiple-choice",
      "question": "On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1= very little and 10 = a lot)",
      "options": [
        {
          "id": "1",
          "label": "1 - very little "
        },
        {
          "id": "2",
          "label": "2"
        },
        {
          "id": "1763349441567",
          "label": "3"
        },
        {
          "id": "1763349445543",
          "label": "4"
        },
        {
          "id": "1763349448101",
          "label": "5"
        },
        {
          "id": "1763349448368",
          "label": "6"
        },
        {
          "id": "1763349448573",
          "label": "7"
        },
        {
          "id": "1763349448771",
          "label": "8"
        },
        {
          "id": "1763349448960",
          "label": "9"
        },
        {
          "id": "1763349451805",
          "label": "10 - A lot "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1372.72156706143,
        "y": 76.811710205372
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
      "id": "634a6104-df7e-4bc9-bc39-146e50d33135",
      "type": "multiple-choice",
      "question": "How will you file your application? (check on)",
      "options": [
        {
          "id": "1",
          "label": "Together with my spouse (\"joint filing\")"
        },
        {
          "id": "2",
          "label": "On my own (\"with waiver\") "
        },
        {
          "id": "1763349604485",
          "label": "Not sure yet"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1747.96078353071,
        "y": 85.2175653080581
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
      "id": "90cf1d3d-ade3-481a-99b9-45639a90aec9",
      "type": "multiple-choice",
      "question": "What is your current marital situation? ",
      "options": [
        {
          "id": "1",
          "label": "Married living together "
        },
        {
          "id": "2",
          "label": "Married, but living apart "
        },
        {
          "id": "1763349653991",
          "label": "Divorced"
        },
        {
          "id": "1763349654471",
          "label": "Widow(er) "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2147.96078353071,
        "y": 109.217565308058
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
      "id": "3cefacaf-b304-4bdb-ab4b-0a4459573b87",
      "type": "multiple-choice",
      "question": "How involved will your spouse be in your case? ",
      "options": [
        {
          "id": "1",
          "label": "Fully involved - will help provide documents and cooperate with the process"
        },
        {
          "id": "2",
          "label": "Somewhat involved - may help with some things, but not fully sure yet"
        },
        {
          "id": "1763350276320",
          "label": "Not involved - will not help or provide any documents"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1746.98039176536,
        "y": 354.81902908373
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
      "id": "9ba0c208-dad5-4db6-8a6c-3b4e3dd5e303",
      "type": "end",
      "question": "End",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2525.96078353071,
        "y": 161.217565308058
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
      "id": "f692fc28-d902-4843-8934-cd0f864b05fa",
      "type": "yes-no",
      "question": "Have you already submitted your application to remove the conditions on your green card? (Form I-751). ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 580.180391765357,
        "y": 106.815369644551
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
      "id": "2fd13dc8-9533-41cf-ae89-731c3d64c6d6",
      "type": "multiple-choice",
      "question": "If yes, did you file it together with your spouse or on your own? ",
      "options": [
        {
          "id": "1",
          "label": "Together with my spouse "
        },
        {
          "id": "1763351103099",
          "label": "On my own "
        },
        {
          "id": "1763351320600",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 578.180391765357,
        "y": 234.815369644551
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    }
  ],
  "connections": [
    {
      "id": "9312d65b-5160-4cb9-95b8-5043164fc97f",
      "sourceNodeId": "a031aebe-b299-4e12-9159-56d8fbe954ba",
      "targetNodeId": "4ee548df-a65d-4849-9b1f-6472816ef6e9",
      "condition": "any"
    },
    {
      "id": "957185ab-b35b-49a6-8e05-32ae0f848d55",
      "sourceNodeId": "4ee548df-a65d-4849-9b1f-6472816ef6e9",
      "targetNodeId": "7a6c0119-38c3-42b3-94c5-5c00061d2c06",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "d615e6a3-7efa-403d-a59a-55de87db262f",
      "sourceNodeId": "cfce5549-6d8a-4b7c-b340-f892868f17db",
      "targetNodeId": "245eb236-71ef-4721-ab5a-c10788738930",
      "condition": "any"
    },
    {
      "id": "6f8dc215-b19c-4ec3-87f7-4f8aeca79b0a",
      "sourceNodeId": "245eb236-71ef-4721-ab5a-c10788738930",
      "targetNodeId": "634a6104-df7e-4bc9-bc39-146e50d33135",
      "condition": "any"
    },
    {
      "id": "e96ddbc3-ab86-41cd-8e4b-6cc2d05a54b6",
      "sourceNodeId": "634a6104-df7e-4bc9-bc39-146e50d33135",
      "targetNodeId": "3cefacaf-b304-4bdb-ab4b-0a4459573b87",
      "condition": "2",
      "label": "On my own (\"with waiver\") "
    },
    {
      "id": "26e49e8c-534f-448c-8414-cfedf754042d",
      "sourceNodeId": "3cefacaf-b304-4bdb-ab4b-0a4459573b87",
      "targetNodeId": "90cf1d3d-ade3-481a-99b9-45639a90aec9",
      "condition": "any"
    },
    {
      "id": "e140fc6e-574d-4b0c-926d-876c8910bdf8",
      "sourceNodeId": "634a6104-df7e-4bc9-bc39-146e50d33135",
      "targetNodeId": "90cf1d3d-ade3-481a-99b9-45639a90aec9",
      "condition": "1",
      "label": "Together with my spouse (\"joint filing\")"
    },
    {
      "id": "809902e1-cfe5-4474-b258-999ff4c76ac0",
      "sourceNodeId": "90cf1d3d-ade3-481a-99b9-45639a90aec9",
      "targetNodeId": "9ba0c208-dad5-4db6-8a6c-3b4e3dd5e303",
      "condition": "any"
    },
    {
      "id": "615f8daf-f21f-4c79-8bf1-ae525f0f58d4",
      "sourceNodeId": "4ee548df-a65d-4849-9b1f-6472816ef6e9",
      "targetNodeId": "f692fc28-d902-4843-8934-cd0f864b05fa",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "e2e5afb7-82a5-40a8-b808-883356d073e8",
      "sourceNodeId": "f692fc28-d902-4843-8934-cd0f864b05fa",
      "targetNodeId": "2fd13dc8-9533-41cf-ae89-731c3d64c6d6",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "a7949c9b-e725-4aae-8f3a-c4c255ae7798",
      "sourceNodeId": "f692fc28-d902-4843-8934-cd0f864b05fa",
      "targetNodeId": "cfce5549-6d8a-4b7c-b340-f892868f17db",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "6baa8a8f-cddf-4f9b-af7e-43a83876a95d",
      "sourceNodeId": "2fd13dc8-9533-41cf-ae89-731c3d64c6d6",
      "targetNodeId": "cfce5549-6d8a-4b7c-b340-f892868f17db",
      "condition": "any"
    }
  ]
}
```
