# Flow: Final Asylum Flow

## 📋 Flow Metadata

- **Flow ID**: final-asylum-flow
- **Version**: 1.0
- **Total Screens**: 11
- **Total Connections**: 12
- **Estimated Completion Time**: 9 minutes
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

#### 1. 🚀 Start - `43164797-4164-49b1-ba96-f1bf4136a3dc`

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

#### 2. ❓ Yes/No Question - `daf4281b-b9bf-40cf-b804-393ef125cefa`

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

#### 3. ✍️ Text Input - `80cdeba5-38c5-4633-9065-213a08384b43`

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

#### 4. ❓ Yes/No Question - `1230adf5-c7c6-4246-9df9-abd678250a1f`

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

#### 5. 📝 Form - `4ffb61a3-eb1b-4e46-86a7-cc97c29a4e3f`

**Type**: Multi-Field Form
**Title**: Briefly describe how you entered the U.S. (e.g. tourist visa, student visa, humanitarian parole, employment visa, J-1 visa or another type of visa)

**Fields** (1):

  **1. Text Field** (`text`) *required*
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

#### 6. ❓ Yes/No Question - `db582f5b-5d5c-4b3a-9f90-bc7600a7d180`

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

#### 7. ✍️ Text Input - `79ebabe2-8181-4b11-b34c-3f807e2d0bb0`

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

#### 8. 📝 Form - `ec7f1da3-5fd5-4c84-a7bc-f647c757cf2e`

**Type**: Multi-Field Form
**Title**: If yes, please explain why you are afraid to return to your home country. 
**Description**: For example: threats, violence, persecution, or other harm. 

**Fields** (1):

  **1. Text Field** (`text`) *required*
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

#### 9. ❓ Yes/No Question - `60e48409-cc0b-47b8-851a-a2e52947ba02`

**Type**: Yes/No Question
**Question**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? 
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

#### 10. ✅ End - `08b82547-f4ca-4a1f-8ed2-19eb3c644695`

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

#### 11. ✍️ Text Input - `998d9eca-00ba-4e76-914d-32dfbf95b5f8`

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


### 🔗 Conditional Logic (Connections)

#### Connection Conditions Explained
- **"any"**: Proceed to next screen on any user action (button click, form submit, bypass condition)
- **"yes"**: Only proceed if user selects "Yes" option
- **"no"**: Only proceed if user selects "No" option
- **"[option-id]"**: Proceed if specific option is selected in multiple choice

#### Connections List
1. **From**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **To**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

2. **From**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **To**: When you entered the U.S., were you inspected by a U.S. border officer?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: Start
   **To**: Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

4. **From**: When you entered the U.S., were you inspected by a U.S. border officer?
   **To**: New Question
   **Condition**: I was inspected and admitted 
   **Description**: Proceeds only when user clicks "Yes" button

5. **From**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **To**: The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. 

Based on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

6. **From**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **To**: New Question
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

7. **From**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **To**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: New Question
   **To**: Have you ever been placed in immigration court or faced removal (deportation) proceedings? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
   **To**: Are you afraid to return back to your home country? If yes, can you please explain why. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

11. **From**: When you entered the U.S., were you inspected by a U.S. border officer?
   **To**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
   **Condition**: I entered without being inspected 
   **Description**: Proceeds only when user clicks "No" button

12. **From**: New Question
   **To**: What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.
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
  flowId: "final-asylum-flow",
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
  "43164797-4164-49b1-ba96-f1bf4136a3dc": { "started": true, "timestamp": "ISO-8601" },
  "daf4281b-b9bf-40cf-b804-393ef125cefa": "yes" | "no",
  "80cdeba5-38c5-4633-9065-213a08384b43": "user text input",
  "1230adf5-c7c6-4246-9df9-abd678250a1f": "yes" | "no",
  "4ffb61a3-eb1b-4e46-86a7-cc97c29a4e3f": { "1": "value" },
  "db582f5b-5d5c-4b3a-9f90-bc7600a7d180": "yes" | "no",
  "79ebabe2-8181-4b11-b34c-3f807e2d0bb0": "user text input",
  "ec7f1da3-5fd5-4c84-a7bc-f647c757cf2e": { "1": "value" },
  "60e48409-cc0b-47b8-851a-a2e52947ba02": "yes" | "no",
  "08b82547-f4ca-4a1f-8ed2-19eb3c644695": { "additionalInfo": "optional text", "completed": true },
  "998d9eca-00ba-4e76-914d-32dfbf95b5f8": "user text input"
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
  "name": "Final Asylum Flow",
  "description": "",
  "nodes": [
    {
      "id": "43164797-4164-49b1-ba96-f1bf4136a3dc",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -910.466946493908,
        "y": -352.300713099337
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
      "id": "daf4281b-b9bf-40cf-b804-393ef125cefa",
      "type": "yes-no",
      "question": "Great! This legal service is for people in the U.S. who fear persecution or harm if they return to their home country. Does this apply to you?",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -542.252110083109,
        "y": -406.831797792734
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
      "id": "80cdeba5-38c5-4633-9065-213a08384b43",
      "type": "text",
      "question": "The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. \n\nBased on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -540.817405192378,
        "y": -151.454327242633
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
      "id": "1230adf5-c7c6-4246-9df9-abd678250a1f",
      "type": "yes-no",
      "question": "When you entered the U.S., were you inspected by a U.S. border officer?",
      "options": null,
      "yesLabel": "I was inspected and admitted ",
      "noLabel": "I entered without being inspected ",
      "position": {
        "x": -55.8871521253319,
        "y": -414.722674691754
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
      "id": "4ffb61a3-eb1b-4e46-86a7-cc97c29a4e3f",
      "type": "form",
      "question": "New Question",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 314.352578153474,
        "y": -543.22178093516
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": "Briefly describe how you entered the U.S. (e.g. tourist visa, student visa, humanitarian parole, employment visa, J-1 visa or another type of visa)",
      "formDescription": null,
      "formFields": [
        {
          "id": "1",
          "type": "text",
          "label": "Text Field",
          "placeholder": "",
          "required": true
        }
      ]
    },
    {
      "id": "db582f5b-5d5c-4b3a-9f90-bc7600a7d180",
      "type": "yes-no",
      "question": "Are you afraid to return back to your home country? If yes, can you please explain why. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 686.991749692267,
        "y": -408.571662719955
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
      "id": "79ebabe2-8181-4b11-b34c-3f807e2d0bb0",
      "type": "text",
      "question": "The U.S. asylum process is for individuals who are physically in the United States and fear returning to their home country due to persecution or a well-founded fear of persecution. \n\nBased on your answer, you may not be eligible to apply for asylum. We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible immigration options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 686.715722346165,
        "y": -218.70818633815
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
      "id": "ec7f1da3-5fd5-4c84-a7bc-f647c757cf2e",
      "type": "form",
      "question": "New Question",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1056.15000724555,
        "y": -473.083080632325
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": "If yes, please explain why you are afraid to return to your home country. ",
      "formDescription": "For example: threats, violence, persecution, or other harm. ",
      "formFields": [
        {
          "id": "1",
          "type": "text",
          "label": "Text Field",
          "placeholder": "",
          "required": true
        }
      ]
    },
    {
      "id": "60e48409-cc0b-47b8-851a-a2e52947ba02",
      "type": "yes-no",
      "question": "Have you ever been placed in immigration court or faced removal (deportation) proceedings? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1066.09108830393,
        "y": -312.037567486619
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
      "id": "08b82547-f4ca-4a1f-8ed2-19eb3c644695",
      "type": "end",
      "question": "End",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1433.985034209,
        "y": -381.625134895257
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
      "id": "998d9eca-00ba-4e76-914d-32dfbf95b5f8",
      "type": "text",
      "question": "What date did you enter or arrive in the U.S.? Please provide the date or your best guess. If you don't know the date, an approximate date is fine.",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 322.759043857546,
        "y": -345.268703937479
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
      "id": "9724e5a6-b4d0-4516-8ed6-57d7483a8541",
      "sourceNodeId": "daf4281b-b9bf-40cf-b804-393ef125cefa",
      "targetNodeId": "80cdeba5-38c5-4633-9065-213a08384b43",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "daa7b7cf-aae8-4bb1-bb13-83cd0db658df",
      "sourceNodeId": "daf4281b-b9bf-40cf-b804-393ef125cefa",
      "targetNodeId": "1230adf5-c7c6-4246-9df9-abd678250a1f",
      "condition": "any"
    },
    {
      "id": "257a742c-8ece-472e-ac90-53c951bc7433",
      "sourceNodeId": "43164797-4164-49b1-ba96-f1bf4136a3dc",
      "targetNodeId": "daf4281b-b9bf-40cf-b804-393ef125cefa",
      "condition": "any"
    },
    {
      "id": "0025f9b3-d281-48e7-93f2-0348344817f2",
      "sourceNodeId": "1230adf5-c7c6-4246-9df9-abd678250a1f",
      "targetNodeId": "4ffb61a3-eb1b-4e46-86a7-cc97c29a4e3f",
      "condition": "yes",
      "label": "I was inspected and admitted "
    },
    {
      "id": "11ea8a8f-85d8-42c1-8dab-9f575ac0ca5b",
      "sourceNodeId": "db582f5b-5d5c-4b3a-9f90-bc7600a7d180",
      "targetNodeId": "79ebabe2-8181-4b11-b34c-3f807e2d0bb0",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "fed99064-04a2-4369-a98c-fe1bc1545678",
      "sourceNodeId": "db582f5b-5d5c-4b3a-9f90-bc7600a7d180",
      "targetNodeId": "ec7f1da3-5fd5-4c84-a7bc-f647c757cf2e",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "696d06cd-80ce-4c4a-8a72-5eaed00f5971",
      "sourceNodeId": "db582f5b-5d5c-4b3a-9f90-bc7600a7d180",
      "targetNodeId": "60e48409-cc0b-47b8-851a-a2e52947ba02",
      "condition": "any"
    },
    {
      "id": "642b8f12-5d14-4065-895f-d5b4d7eb00e0",
      "sourceNodeId": "60e48409-cc0b-47b8-851a-a2e52947ba02",
      "targetNodeId": "08b82547-f4ca-4a1f-8ed2-19eb3c644695",
      "condition": "any"
    },
    {
      "id": "b8ccbc31-589c-4aee-8cb5-62ac5a7a31da",
      "sourceNodeId": "ec7f1da3-5fd5-4c84-a7bc-f647c757cf2e",
      "targetNodeId": "60e48409-cc0b-47b8-851a-a2e52947ba02",
      "condition": "any"
    },
    {
      "id": "a3879dfe-8114-43a3-889e-f3e41f760351",
      "sourceNodeId": "998d9eca-00ba-4e76-914d-32dfbf95b5f8",
      "targetNodeId": "db582f5b-5d5c-4b3a-9f90-bc7600a7d180",
      "condition": "any"
    },
    {
      "id": "8e32eb9c-30ab-494f-9b0d-91d4f4b6b547",
      "sourceNodeId": "1230adf5-c7c6-4246-9df9-abd678250a1f",
      "targetNodeId": "998d9eca-00ba-4e76-914d-32dfbf95b5f8",
      "condition": "no",
      "label": "I entered without being inspected "
    },
    {
      "id": "d0fb68df-b950-4f94-a87f-134b95a5fba6",
      "sourceNodeId": "4ffb61a3-eb1b-4e46-86a7-cc97c29a4e3f",
      "targetNodeId": "998d9eca-00ba-4e76-914d-32dfbf95b5f8",
      "condition": "any"
    }
  ]
}
```
