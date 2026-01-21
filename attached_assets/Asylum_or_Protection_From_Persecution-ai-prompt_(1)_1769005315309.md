# Flow: Asylum or Protection From Persecution

## 📋 Flow Metadata

- **Flow ID**: asylum-or-protection-from-persecution
- **Version**: 1.0
- **Total Screens**: 11
- **Total Connections**: 13
- **Estimated Completion Time**: 9 minutes
- **Created**: 2026-01-20

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

#### 1. 📝 Form - `5c09b0a4-7afc-4058-88a1-3a9345046ca5`

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

#### 2. ❓ Yes/No Question - `5a438128-5b98-41dd-b00e-f74b977bebd7`

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

#### 3. ✍️ Text Input - `3714f3ae-d7d4-474e-8b88-b61d48400677`

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

#### 4. 📝 Form - `e2376ff5-a5be-475b-9dcf-78c76128c2e3`

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

#### 5. ✅ Completion - `a1742e75-880f-4c8c-bda0-ed4535637993`

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

#### 6. ✍️ Text Input - `d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5`

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

#### 7. 🚀 Start - `bf42b980-78e0-4fdf-ad49-cdedb9e0dac2`

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

#### 8. ❓ Yes/No Question - `9c4dce3a-7a50-4d42-9985-d7ad2d180f69`

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

#### 9. ✍️ Text Input - `2f836d97-6feb-4dcb-b3e8-fff27f1521ac`

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

#### 10. ❓ Yes/No Question - `6fcafc01-c3ad-472e-a1e7-931ea80e576e`

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

#### 11. ℹ️ Info Display - `8c48ec5d-9996-40a6-9f7c-c8d38423a7b6`

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
  "5c09b0a4-7afc-4058-88a1-3a9345046ca5": { "1": "value" },
  "5a438128-5b98-41dd-b00e-f74b977bebd7": "yes" | "no",
  "3714f3ae-d7d4-474e-8b88-b61d48400677": "user text input",
  "e2376ff5-a5be-475b-9dcf-78c76128c2e3": { "1": "value" },
  "a1742e75-880f-4c8c-bda0-ed4535637993": { "additionalInfo": "optional text", "completed": true },
  "d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5": "user text input",
  "bf42b980-78e0-4fdf-ad49-cdedb9e0dac2": { "started": true, "timestamp": "ISO-8601" },
  "9c4dce3a-7a50-4d42-9985-d7ad2d180f69": "yes" | "no",
  "2f836d97-6feb-4dcb-b3e8-fff27f1521ac": "user text input",
  "6fcafc01-c3ad-472e-a1e7-931ea80e576e": "yes" | "no",
  "8c48ec5d-9996-40a6-9f7c-c8d38423a7b6": "response-value"
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
      "id": "5c09b0a4-7afc-4058-88a1-3a9345046ca5",
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
      "id": "5a438128-5b98-41dd-b00e-f74b977bebd7",
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
      "id": "3714f3ae-d7d4-474e-8b88-b61d48400677",
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
      "id": "e2376ff5-a5be-475b-9dcf-78c76128c2e3",
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
      "id": "a1742e75-880f-4c8c-bda0-ed4535637993",
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
      "id": "d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5",
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
      "id": "bf42b980-78e0-4fdf-ad49-cdedb9e0dac2",
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
      "id": "9c4dce3a-7a50-4d42-9985-d7ad2d180f69",
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
      "id": "2f836d97-6feb-4dcb-b3e8-fff27f1521ac",
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
      "id": "6fcafc01-c3ad-472e-a1e7-931ea80e576e",
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
      "id": "8c48ec5d-9996-40a6-9f7c-c8d38423a7b6",
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
      "id": "23bf146d-9c82-495a-a46e-8d43f21902f9",
      "sourceNodeId": "3714f3ae-d7d4-474e-8b88-b61d48400677",
      "targetNodeId": "a1742e75-880f-4c8c-bda0-ed4535637993",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "25e7bf8c-de40-40a5-8938-06495c2f62e6",
      "sourceNodeId": "9c4dce3a-7a50-4d42-9985-d7ad2d180f69",
      "targetNodeId": "6fcafc01-c3ad-472e-a1e7-931ea80e576e",
      "condition": "yes",
      "displayLabel": "Yes",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "e8308e9d-de73-4a12-b1ee-5dedcad1bef5",
      "sourceNodeId": "e2376ff5-a5be-475b-9dcf-78c76128c2e3",
      "targetNodeId": "2f836d97-6feb-4dcb-b3e8-fff27f1521ac",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "beccd92a-40b0-4bb3-bc87-44390dad1e53",
      "sourceNodeId": "2f836d97-6feb-4dcb-b3e8-fff27f1521ac",
      "targetNodeId": "a1742e75-880f-4c8c-bda0-ed4535637993",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "546a3280-c444-4168-aa93-95548af4711e",
      "sourceNodeId": "bf42b980-78e0-4fdf-ad49-cdedb9e0dac2",
      "targetNodeId": "9c4dce3a-7a50-4d42-9985-d7ad2d180f69",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "0163599e-6128-4d6b-8562-9b04518fda77",
      "sourceNodeId": "6fcafc01-c3ad-472e-a1e7-931ea80e576e",
      "targetNodeId": "5c09b0a4-7afc-4058-88a1-3a9345046ca5",
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
      "id": "79e8e345-ae08-40a8-924d-419390266a7f",
      "sourceNodeId": "5a438128-5b98-41dd-b00e-f74b977bebd7",
      "targetNodeId": "3714f3ae-d7d4-474e-8b88-b61d48400677",
      "condition": "no",
      "displayLabel": "No",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "e89d757f-a328-4de7-a26f-7f31e227f7ae",
      "sourceNodeId": "5a438128-5b98-41dd-b00e-f74b977bebd7",
      "targetNodeId": "e2376ff5-a5be-475b-9dcf-78c76128c2e3",
      "condition": "yes",
      "displayLabel": "Yes",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "6c5a9383-0b34-417c-8514-36e7305c0719",
      "sourceNodeId": "d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5",
      "targetNodeId": "5a438128-5b98-41dd-b00e-f74b977bebd7",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-left"
    },
    {
      "id": "dd3d1dfc-d6b3-4d33-91ba-0d524d8dc699",
      "sourceNodeId": "6fcafc01-c3ad-472e-a1e7-931ea80e576e",
      "targetNodeId": "d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5",
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
      "id": "68d5970b-a2e6-4086-99f1-8158747f45cb",
      "sourceNodeId": "5c09b0a4-7afc-4058-88a1-3a9345046ca5",
      "targetNodeId": "d2957a91-b1d6-4d9c-bdaa-4ebd3d1934b5",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-right",
      "targetHandle": "target-top"
    },
    {
      "id": "22273b35-4213-4b30-8b5f-985dea97e7b7",
      "sourceNodeId": "9c4dce3a-7a50-4d42-9985-d7ad2d180f69",
      "targetNodeId": "8c48ec5d-9996-40a6-9f7c-c8d38423a7b6",
      "condition": "no",
      "displayLabel": "No",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "0fc21031-fa4c-4e73-88e2-8aa8e66c8a26",
      "sourceNodeId": "8c48ec5d-9996-40a6-9f7c-c8d38423a7b6",
      "targetNodeId": "a1742e75-880f-4c8c-bda0-ed4535637993",
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
