# Flow: Asylum or Protection From Persecution

## 📋 Flow Metadata

- **Flow ID**: asylum-or-protection-from-persecution
- **Version**: 1.0
- **Total Screens**: 11
- **Total Connections**: 13
- **Estimated Completion Time**: 9 minutes
- **Created**: 2026-02-02

## 📝 Flow Overview

This document describes a conversational flow with 11 screens and 13 connections.
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

#### 1. 📝 Form - `5d1db59d-0771-497c-a8fa-bf68ba79b1a8`

**Type**: Multi-Field Form
**Title**: Briefly describe how you entered the U.S. (e.g. tourist visa, student visa, humanitarian parole, employment visa, J-1 visa or another type of visa)

**Fields** (1):

  **1. Text Field** (`Text Input`) *required*
  - **ID**: `1`
  - **Validation Rules**:
    - Minimum 2 characters
    - Maximum 100 characters
    - Required (cannot be empty)
  - **Error Messages**:
    - Empty: "Text Field is required"
    - Too short: "Please enter at least 2 characters"
    - Too long: "Please enter no more than 100 characters"
  - **Zod Schema**:
    ```typescript
    1: z.string().min(1, "Text Field is required").min(2, "Please enter at least 2 characters").max(100, "Please enter no more than 100 characters")
    ```

**Implementation Details**:
- Use React Hook Form with `zodResolver`
- Wrap all fields in a `<form>` element
- Display validation errors inline below each field
- Disable submit button while form is invalid or submitting
- Use shadcn/ui form components: `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- Show loading spinner on submit button during submission
- Clear form or show success message after submission

**Complete Form Schema**:
```typescript
const formSchema = z.object({
  1: z.string().min(1).min(2).max(100),
});
```

#### 2. ❓ Yes/No Question - `e6503a06-206a-4d08-ac8f-7101fa3ccf81`

**Type**: Yes/No Question
**Question**: Are you afraid to return back to your home country? If yes, can you please explain why. 
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

#### 3. ✍️ Text Input - `f8d002fb-c3a1-4b5a-a034-96dcd644a068`

**Type**: Text Input Question
**Question**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.


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

#### 4. 📝 Form - `e7be9522-027c-4f22-9408-ac25014d1efe`

**Type**: Multi-Field Form
**Title**: If yes, please explain why you are afraid to return to your home country. 
**Description**: For example: threats, violence, persecution, or other harm. 

**Fields** (1):

  **1. Text Field** (`Text Input`) *required*
  - **ID**: `1`
  - **Validation Rules**:
    - Minimum 2 characters
    - Maximum 100 characters
    - Required (cannot be empty)
  - **Error Messages**:
    - Empty: "Text Field is required"
    - Too short: "Please enter at least 2 characters"
    - Too long: "Please enter no more than 100 characters"
  - **Zod Schema**:
    ```typescript
    1: z.string().min(1, "Text Field is required").min(2, "Please enter at least 2 characters").max(100, "Please enter no more than 100 characters")
    ```

**Implementation Details**:
- Use React Hook Form with `zodResolver`
- Wrap all fields in a `<form>` element
- Display validation errors inline below each field
- Disable submit button while form is invalid or submitting
- Use shadcn/ui form components: `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- Show loading spinner on submit button during submission
- Clear form or show success message after submission

**Complete Form Schema**:
```typescript
const formSchema = z.object({
  1: z.string().min(1).min(2).max(100),
});
```

#### 5. ✅ Completion - `ee54d8ec-ac4e-47cb-97b2-edc3543379a3`

**Type**: Completion Screen
**Title**: Thank You
**Message**: Will match you with an experienced attorney. 
**Legal Disclaimer**: Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.
**Additional Info Prompt**: Would you like to add any more details about your case? 
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
- Textarea should have placeholder: "Would you like to add any more details about your case? "
- Include "Submit" or "Finish" button
- Show loading state during final submission
- Consider showing confetti or success animation
- After submission, either redirect or show final confirmation

**Example Layout**:
```tsx
<div className="text-center space-y-4">
  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
  <h1 className="text-3xl font-bold">Thank You</h1>
  <p className="text-muted-foreground">Will match you with an experienced attorney. </p>
  <Textarea placeholder="Would you like to add any more details about your case? " className="mt-4" />
  <Button onClick={handleSubmit} size="lg">Finish</Button>
</div>
```

#### 6. ✍️ Text Input - `987a68fe-0279-4c06-84cd-efd438a182a1`

**Type**: Text Input Question
**Question**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.

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

#### 7. 🚀 Start - `7c0f2381-0ed5-4bc7-9070-b08767d64b13`

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

#### 8. ❓ Yes/No Question - `19adeaaf-0e06-4dba-a09e-776e069a6bfb`

**Type**: Yes/No Question
**Question**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
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

#### 9. ✍️ Text Input - `e18bc33d-8f0a-467f-ab87-c17eccd21ee5`

**Type**: Text Input Question
**Question**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? If Yes please explain further.

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

#### 10. ❓ Yes/No Question - `4880e712-026c-495c-9c4e-36fd41bb02a5`

**Type**: Yes/No Question
**Question**: When you entered the U.S., were you inspected by a U.S. border officer?
**Yes Label**: "I was inspected and admitted "
**No Label**: "I entered without being inspected "

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
    I was inspected and admitted 
  </Button>
  <Button onClick={() => handleAnswer('no')} variant="outline" size="lg" className="flex-1">
    I entered without being inspected 
  </Button>
</div>
```

#### 11. ℹ️ Info Display - `9a174c1e-34db-40be-b6ea-b70c32c47504`

**Type**: Info Display
**Title**: Information
**Description**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.

**Implementation Details**:
- Display informational content without form inputs
- Show info icon (Info from lucide-react)
- Display title prominently
- Show description in readable paragraph format
- Include "Continue" or "Next" button

**Example Layout**:
```tsx
<div className="text-center space-y-4">
  <Info className="w-12 h-12 text-primary mx-auto" />
  <h2 className="text-2xl font-semibold">Information</h2>
  <p className="text-muted-foreground">The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.</p>
  <Button onClick={handleNext}>Continue</Button>
</div>
```


### 🔗 Conditional Logic (Connections)

#### Connection Conditions Explained
- **"any"**: Proceed to next screen on any user action (button click, form submit, bypass condition)
- **"yes"**: Only proceed if user selects "Yes" option
- **"no"**: Only proceed if user selects "No" option
- **"[option-id]"**: Proceed if specific option is selected in multiple choice

#### Connections List
1. **From**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.

   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **To**: When you entered the U.S., were you inspected by a U.S. border officer?
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

3. **From**: New Question
   **To**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? If Yes please explain further.
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

4. **From**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? If Yes please explain further.
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

5. **From**: Start
   **To**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

6. **From**: When you entered the U.S., were you inspected by a U.S. border officer?
   **To**: New Question
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

7. **From**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **To**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

8. **From**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **To**: New Question
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

9. **From**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
   **To**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: When you entered the U.S., were you inspected by a U.S. border officer?
   **To**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

11. **From**: New Question
   **To**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

12. **From**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **To**: Information
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

13. **From**: Information
   **To**: End
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
  flowId: "asylum-or-protection-from-persecution",
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
  "5d1db59d-0771-497c-a8fa-bf68ba79b1a8": { "1": "value" },
  "e6503a06-206a-4d08-ac8f-7101fa3ccf81": "yes" | "no",
  "f8d002fb-c3a1-4b5a-a034-96dcd644a068": "user text input",
  "e7be9522-027c-4f22-9408-ac25014d1efe": { "1": "value" },
  "ee54d8ec-ac4e-47cb-97b2-edc3543379a3": { "additionalInfo": "optional text", "completed": true },
  "987a68fe-0279-4c06-84cd-efd438a182a1": "user text input",
  "7c0f2381-0ed5-4bc7-9070-b08767d64b13": { "started": true, "timestamp": "ISO-8601" },
  "19adeaaf-0e06-4dba-a09e-776e069a6bfb": "yes" | "no",
  "e18bc33d-8f0a-467f-ab87-c17eccd21ee5": "user text input",
  "4880e712-026c-495c-9c4e-36fd41bb02a5": "yes" | "no",
  "9a174c1e-34db-40be-b6ea-b70c32c47504": "response-value"
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

## Full JSON Export

```json
{
  "name": "Asylum or Protection From Persecution",
  "description": "",
  "nodes": [
    {
      "id": "5d1db59d-0771-497c-a8fa-bf68ba79b1a8",
      "type": "form",
      "position": {
        "x": -186.627752481099,
        "y": -1362.83348901854
      },
      "question": "New Question",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Briefly describe how you entered the U.S. (e.g. tourist visa, student visa, humanitarian parole, employment visa, J-1 visa or another type of visa)",
      "formDescription": null,
      "formFields": [
        {
          "id": "1",
          "type": "text",
          "label": "Text Field",
          "required": true
        }
      ],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": "Briefly describe how you entered the U.S. (e.g. tourist visa, student visa, humanitarian parole, employment visa, J-1 visa or another type of visa)",
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "e6503a06-206a-4d08-ac8f-7101fa3ccf81",
      "type": "yes-no",
      "position": {
        "x": 123.754731048485,
        "y": -938.589906065774
      },
      "question": "Are you afraid to return back to your home country? If yes, can you please explain why. ",
      "yesLabel": "Yes",
      "noLabel": "No",
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "f8d002fb-c3a1-4b5a-a034-96dcd644a068",
      "type": "text",
      "position": {
        "x": -27.5353383245988,
        "y": -724.45119177956
      },
      "question": "The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. \n\nBased on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.\n",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "e7be9522-027c-4f22-9408-ac25014d1efe",
      "type": "form",
      "position": {
        "x": 546.298291210744,
        "y": -934.167067165491
      },
      "question": "New Question",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "If yes, please explain why you are afraid to return to your home country. ",
      "formDescription": "For example: threats, violence, persecution, or other harm. ",
      "formFields": [
        {
          "id": "1",
          "type": "text",
          "label": "Text Field",
          "required": true
        }
      ],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": "If yes, please explain why you are afraid to return to your home country. ",
      "infoDescription": "For example: threats, violence, persecution, or other harm. ",
      "referencedFlowId": null
    },
    {
      "id": "ee54d8ec-ac4e-47cb-97b2-edc3543379a3",
      "type": "completion",
      "position": {
        "x": -397.557180013983,
        "y": -382.921687505533
      },
      "question": "End",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": "Thank You",
      "thankYouMessage": "Will match you with an experienced attorney. ",
      "legalDisclaimer": "Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.",
      "additionalInfoPrompt": "Would you like to add any more details about your case? ",
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "987a68fe-0279-4c06-84cd-efd438a182a1",
      "type": "text",
      "position": {
        "x": -335.204073262929,
        "y": -941.430410185701
      },
      "question": "What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "7c0f2381-0ed5-4bc7-9070-b08767d64b13",
      "type": "start",
      "position": {
        "x": -1531.79996318026,
        "y": -1187.74706176998
      },
      "question": "Start",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "19adeaaf-0e06-4dba-a09e-776e069a6bfb",
      "type": "yes-no",
      "position": {
        "x": -1123.39551147398,
        "y": -1182.15701358423
      },
      "question": "Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?",
      "yesLabel": "Yes",
      "noLabel": "No",
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "e18bc33d-8f0a-467f-ab87-c17eccd21ee5",
      "type": "text",
      "position": {
        "x": 367.432649457933,
        "y": -727.968549274218
      },
      "question": "Have you ever been placed in immigration court or faced removal (deportation) proceedings? If Yes please explain further.",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "4880e712-026c-495c-9c4e-36fd41bb02a5",
      "type": "yes-no",
      "position": {
        "x": -680.617092818302,
        "y": -1182.21934280182
      },
      "question": "When you entered the U.S., were you inspected by a U.S. border officer?",
      "yesLabel": "I was inspected and admitted ",
      "noLabel": "I entered without being inspected ",
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "9a174c1e-34db-40be-b6ea-b70c32c47504",
      "type": "info",
      "position": {
        "x": -1099.48422528688,
        "y": -903.244646429235
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Information",
      "formDescription": "The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. \n\nBased on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.",
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": "Information",
      "infoDescription": "The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. \n\nBased on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.",
      "referencedFlowId": null
    }
  ],
  "connections": [
    {
      "id": "bf206434-8294-4deb-89b3-0759467300b1",
      "sourceNodeId": "f8d002fb-c3a1-4b5a-a034-96dcd644a068",
      "targetNodeId": "ee54d8ec-ac4e-47cb-97b2-edc3543379a3",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "c275b25f-ee95-406d-aa1f-731970081c61",
      "sourceNodeId": "19adeaaf-0e06-4dba-a09e-776e069a6bfb",
      "targetNodeId": "4880e712-026c-495c-9c4e-36fd41bb02a5",
      "condition": "yes",
      "displayLabel": "Yes",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "3f0e8a3a-cefb-4d98-8ca2-39d5b8d4f48c",
      "sourceNodeId": "e7be9522-027c-4f22-9408-ac25014d1efe",
      "targetNodeId": "e18bc33d-8f0a-467f-ab87-c17eccd21ee5",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "3108dca9-5b54-46cc-8b31-abff264855a7",
      "sourceNodeId": "e18bc33d-8f0a-467f-ab87-c17eccd21ee5",
      "targetNodeId": "ee54d8ec-ac4e-47cb-97b2-edc3543379a3",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "4fa24ee4-0560-4337-9c11-91ccc36eda89",
      "sourceNodeId": "7c0f2381-0ed5-4bc7-9070-b08767d64b13",
      "targetNodeId": "19adeaaf-0e06-4dba-a09e-776e069a6bfb",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "213e1100-ab1c-4391-a64c-bd9f716aa3cd",
      "sourceNodeId": "4880e712-026c-495c-9c4e-36fd41bb02a5",
      "targetNodeId": "5d1db59d-0771-497c-a8fa-bf68ba79b1a8",
      "condition": "yes",
      "displayLabel": "Yes",
      "customLabel": "I was inspected and admitted ",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "85af8204-239b-462d-910a-9e2f0eafdc31",
      "sourceNodeId": "e6503a06-206a-4d08-ac8f-7101fa3ccf81",
      "targetNodeId": "f8d002fb-c3a1-4b5a-a034-96dcd644a068",
      "condition": "no",
      "displayLabel": "No",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "67b7ea27-5083-4c0d-b831-65e84459d9bc",
      "sourceNodeId": "e6503a06-206a-4d08-ac8f-7101fa3ccf81",
      "targetNodeId": "e7be9522-027c-4f22-9408-ac25014d1efe",
      "condition": "yes",
      "displayLabel": "Yes",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "cf70efac-aae0-4027-94f5-2125865b3eaf",
      "sourceNodeId": "987a68fe-0279-4c06-84cd-efd438a182a1",
      "targetNodeId": "e6503a06-206a-4d08-ac8f-7101fa3ccf81",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "760e35cb-2ebd-4a73-ad5f-532d1735af9e",
      "sourceNodeId": "4880e712-026c-495c-9c4e-36fd41bb02a5",
      "targetNodeId": "987a68fe-0279-4c06-84cd-efd438a182a1",
      "condition": "no",
      "displayLabel": "No",
      "customLabel": "I entered without being inspected ",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "e42c9a73-75b8-4f6b-808d-78253ce3a118",
      "sourceNodeId": "5d1db59d-0771-497c-a8fa-bf68ba79b1a8",
      "targetNodeId": "987a68fe-0279-4c06-84cd-efd438a182a1",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-top"
    },
    {
      "id": "31ab52e9-d06d-4b6f-93a1-d297ff82a6b1",
      "sourceNodeId": "19adeaaf-0e06-4dba-a09e-776e069a6bfb",
      "targetNodeId": "9a174c1e-34db-40be-b6ea-b70c32c47504",
      "condition": "no",
      "displayLabel": "No",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "49593371-6496-4518-ae4f-83b01ff75fa9",
      "sourceNodeId": "9a174c1e-34db-40be-b6ea-b70c32c47504",
      "targetNodeId": "ee54d8ec-ac4e-47cb-97b2-edc3543379a3",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    }
  ]
}
```
