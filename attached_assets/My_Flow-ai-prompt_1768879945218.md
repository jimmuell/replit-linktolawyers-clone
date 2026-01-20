# Flow: My Flow

## 📋 Flow Metadata

- **Flow ID**: my-flow
- **Version**: 1.0
- **Total Screens**: 5
- **Total Connections**: 5
- **Estimated Completion Time**: 4 minutes
- **Created**: 2026-01-20

## 📝 Flow Overview

This document describes a conversational flow with 5 screens and 5 connections.
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

#### 1. 🚀 Start - `8bb7c35c-efe9-42f4-979f-3dddb6140c93`

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

#### 2. 📝 Form - `6fd4ec86-f6ca-4b70-9bb3-53ddfd864b35`

**Type**: Multi-Field Form
**Title**: Contact Form

**Fields** (3):

  **1. Name** (`Text Input`) *required*
  - **ID**: `1768745315547`
  - **Placeholder**: "Enter text"
  - **Default Value**: "Jim Mueller" *(for demo/testing only)*
  - **Validation Rules**:
    - Minimum 2 characters
    - Maximum 100 characters
    - Required (cannot be empty)
  - **Error Messages**:
    - Empty: "Name is required"
    - Too short: "Please enter at least 2 characters"
    - Too long: "Please enter no more than 100 characters"
  - **Zod Schema**:
    ```typescript
    1768745315547: z.string().min(1, "Name is required").min(2, "Please enter at least 2 characters").max(100, "Please enter no more than 100 characters")
    ```

  **2. Email Address** (`Email Input`) *required*
  - **ID**: `1768745319238`
  - **Placeholder**: "example@email.com"
  - **Default Value**: "jimmuell@aol.com" *(for demo/testing only)*
  - **Validation Rules**:
    - Must be valid email format
    - Maximum 255 characters
    - Required (cannot be empty)
  - **Error Messages**:
    - Empty: "Email is required"
    - Invalid: "Please enter a valid email address"
    - Too long: "Email must be less than 255 characters"
  - **Zod Schema**:
    ```typescript
    1768745319238: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters")
    ```

  **3. Zip Code** (`Number Input`) *required*
  - **ID**: `1768745322003`
  - **Placeholder**: "0"
  - **Default Value**: "53045" *(for demo/testing only)*
  - **Validation Rules**:
  - **Error Messages**:
  - **Zod Schema**:
    ```typescript
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
  1768745315547: z.string().min(1).min(2).max(100),
  1768745319238: z.string().email("Please enter a valid email address").max(255),
});
```

#### 3. ❓ Yes/No Question - `3a816016-defb-4bef-b366-7bf841f8fe1a`

**Type**: Yes/No Question
**Question**: New Question
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

#### 4. info - `ab289ac0-a9bc-4496-8a5d-5b3a8c8b64ad`

**Type**: info
**Question**: Information

#### 5. ✅ Completion - `2161a80c-05dc-468f-be88-66e230ce6608`

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
   **To**: New Question
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: New Question
   **To**: Start
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

3. **From**: New Question
   **To**: Information
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

4. **From**: Start
   **To**: Completion
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

5. **From**: Information
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
  flowId: "my-flow",
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
  "8bb7c35c-efe9-42f4-979f-3dddb6140c93": { "started": true, "timestamp": "ISO-8601" },
  "6fd4ec86-f6ca-4b70-9bb3-53ddfd864b35": { "1768745315547": "value", "1768745319238": "value", "1768745322003": "value" },
  "3a816016-defb-4bef-b366-7bf841f8fe1a": "yes" | "no",
  "ab289ac0-a9bc-4496-8a5d-5b3a8c8b64ad": "response-value",
  "2161a80c-05dc-468f-be88-66e230ce6608": { "additionalInfo": "optional text", "completed": true }
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
  "name": "My Flow",
  "description": "",
  "nodes": [
    {
      "id": "8bb7c35c-efe9-42f4-979f-3dddb6140c93",
      "type": "start",
      "position": {
        "x": 212,
        "y": -127
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
      "id": "6fd4ec86-f6ca-4b70-9bb3-53ddfd864b35",
      "type": "form",
      "position": {
        "x": -22.5,
        "y": 73
      },
      "question": "Start",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Contact Form",
      "formDescription": null,
      "formFields": [
        {
          "id": "1768745315547",
          "type": "text",
          "label": "Name",
          "placeholder": "Enter text",
          "required": true
        },
        {
          "id": "1768745319238",
          "type": "email",
          "label": "Email Address",
          "placeholder": "example@email.com",
          "required": true
        },
        {
          "id": "1768745322003",
          "type": "number",
          "label": "Zip Code",
          "placeholder": "0",
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
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    },
    {
      "id": "3a816016-defb-4bef-b366-7bf841f8fe1a",
      "type": "yes-no",
      "position": {
        "x": 209.6884765625,
        "y": -37.4775390625
      },
      "question": "New Question",
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
      "id": "ab289ac0-a9bc-4496-8a5d-5b3a8c8b64ad",
      "type": "info",
      "position": {
        "x": 358.887429539161,
        "y": 91.8248219936709
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Information",
      "formDescription": "This is the No branch",
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
      "id": "2161a80c-05dc-468f-be88-66e230ce6608",
      "type": "completion",
      "position": {
        "x": 165.62036860012006,
        "y": 284.85992373989296
      },
      "question": "Completion",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": null,
      "formDescription": null,
      "formFields": [],
      "brandName": "",
      "welcomeDescription": "",
      "thankYouTitle": "Thank You!",
      "thankYouMessage": "We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.",
      "legalDisclaimer": "Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.",
      "additionalInfoPrompt": "Would you like to add any more details about your case? This helps the attorney understand your case better.",
      "successTitle": null,
      "successMessage": null,
      "showConfetti": false,
      "infoTitle": null,
      "infoDescription": null,
      "referencedFlowId": null
    }
  ],
  "connections": [
    {
      "id": "6f608a40-d46d-4ae1-b0c6-75c90b4f429d",
      "sourceNodeId": "8bb7c35c-efe9-42f4-979f-3dddb6140c93",
      "targetNodeId": "3a816016-defb-4bef-b366-7bf841f8fe1a",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "e5753c98-960c-4c9b-8e30-f03b5c2cb7a0",
      "sourceNodeId": "3a816016-defb-4bef-b366-7bf841f8fe1a",
      "targetNodeId": "6fd4ec86-f6ca-4b70-9bb3-53ddfd864b35",
      "condition": "yes",
      "displayLabel": "Yes",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Yes",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "c9d5579e-80a9-4fbe-8790-c2962035ee47",
      "sourceNodeId": "3a816016-defb-4bef-b366-7bf841f8fe1a",
      "targetNodeId": "ab289ac0-a9bc-4496-8a5d-5b3a8c8b64ad",
      "condition": "no",
      "displayLabel": "No",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "No",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "00634e15-71ae-46bf-b43a-b41d6353de53",
      "sourceNodeId": "6fd4ec86-f6ca-4b70-9bb3-53ddfd864b35",
      "targetNodeId": "2161a80c-05dc-468f-be88-66e230ce6608",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "6e98bc75-2034-4f8f-bd98-0f3217a10178",
      "sourceNodeId": "ab289ac0-a9bc-4496-8a5d-5b3a8c8b64ad",
      "targetNodeId": "2161a80c-05dc-468f-be88-66e230ce6608",
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
