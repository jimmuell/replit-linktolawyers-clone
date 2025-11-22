# Flow: Legal Request Flow

## 📋 Flow Metadata

- **Flow ID**: legal-request-flow
- **Version**: 1.0
- **Total Screens**: 5
- **Total Connections**: 4
- **Estimated Completion Time**: 4 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 5 screens and 4 connections.
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

#### 1. ☑️ Multiple Choice - `cc347dac-e095-4038-ad6e-b2be436e9fef`

**Type**: Multiple Choice Question
**Question**: Who is requesting this legal price quote?
**Options** (2):
  1. "I am the person being sponsored and I am filling out this quote request (beneficiary)" (id: `1`)
  2. "I am the person sponsoring and filling out this quote request. (petitioner)" (id: `2`)

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

#### 2. 🚀 Start - `7605c7b0-c0e6-426e-821c-e56bf4773334`

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

#### 3. 📝 Form - `08ba463b-268f-4852-a04d-5407228f3bf2`

**Type**: Multi-Field Form
**Title**: Get Your Legal Quote
**Description**: Tell us about yourself to get started

**Fields** (2):

  **1. Full Name** (`text`) *required*
  - **ID**: `1761763412788`
  - **Placeholder**: "John Doe"
  - **Default Value**: "Jim Mueller" *(for demo/testing only)*
  - **Validation Rules**:
    - Minimum 2 characters
    - Maximum 100 characters
    - Required (cannot be empty)
  - **Error Messages**:
    - Empty: "Full Name is required"
    - Too short: "Please enter at least 2 characters"
    - Too long: "Please enter no more than 100 characters"
  - **Zod Schema**:
    ```typescript
    1761763412788: z.string().min(1, "Full Name is required").min(2, "Please enter at least 2 characters").max(100, "Please enter no more than 100 characters")
    ```

  **2. Email Address** (`email`) *required*
  - **ID**: `1761763414355`
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
    1761763414355: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters")
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
  1761763412788: z.string().min(1).min(2).max(100),
  1761763414355: z.string().email("Please enter a valid email address").max(255),
});
```

#### 4. ☑️ Multiple Choice - `d4c4c700-5690-4833-94a3-0efb9bd30636`

**Type**: Multiple Choice Question
**Question**: Please choose the closest option:(Beneficiary)
**Options** (6):
  1. "New - Green Card through a Spouse or Family Member ("Family-Based Green Card") - Beneficiary" (id: `1`)
  2. "New - Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions ")" (id: `2`)
  3. "New - U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen" (id: `1761835781131`)
  4. "New - Fiance(e) Visa ("K-1 visa") - Beneficiary" (id: `1761835781681`)
  5. "New - Asylum or Protection From Persecution" (id: `1761835782264`)
  6. "New - Other" (id: `1761835782931`)

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

#### 5. ☑️ Multiple Choice - `88fa7a2e-d685-4a02-b4aa-6c6ad97e0538`

**Type**: Multiple Choice Question
**Question**: Please choose the closest option: (Petitioner)
**Options** (6):
  1. "New - Green Card through a Spouse or Family Member ("Family-Based Green Card") - Petitioner" (id: `1`)
  2. "New - Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions ")" (id: `2`)
  3. "New - U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen" (id: `1761835781131`)
  4. "New - Fiance(e) Visa ("K-1 visa") - Petitioner" (id: `1761835781681`)
  5. "New - Asylum or Protection From Persecution" (id: `1761835782264`)
  6. "New - Other" (id: `1761835782931`)

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
   **To**: New Question
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: New Question
   **To**: Who is requesting this legal price quote?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: Who is requesting this legal price quote?
   **To**: Please choose the closest option: (Petitioner)
   **Condition**: I am the person sponsoring and filling out this quote request. (petitioner)
   **Description**: Proceeds when user selects "I am the person sponsoring and filling out this quote request. (petitioner)"

4. **From**: Who is requesting this legal price quote?
   **To**: Please choose the closest option:(Beneficiary)
   **Condition**: I am the person being sponsored and I am filling out this quote request (beneficiary)
   **Description**: Proceeds when user selects "I am the person being sponsored and I am filling out this quote request (beneficiary)"


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
  flowId: "legal-request-flow",
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
  "cc347dac-e095-4038-ad6e-b2be436e9fef": "option-id",
  "7605c7b0-c0e6-426e-821c-e56bf4773334": { "started": true, "timestamp": "ISO-8601" },
  "08ba463b-268f-4852-a04d-5407228f3bf2": { "1761763412788": "value", "1761763414355": "value" },
  "d4c4c700-5690-4833-94a3-0efb9bd30636": "option-id",
  "88fa7a2e-d685-4a02-b4aa-6c6ad97e0538": "option-id"
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
  "name": "Legal Request Flow",
  "description": "",
  "nodes": [
    {
      "id": "cc347dac-e095-4038-ad6e-b2be436e9fef",
      "type": "multiple-choice",
      "question": "Who is requesting this legal price quote?",
      "options": [
        {
          "id": "1",
          "label": "I am the person being sponsored and I am filling out this quote request (beneficiary)"
        },
        {
          "id": "2",
          "label": "I am the person sponsoring and filling out this quote request. (petitioner)"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 240.230812701448,
        "y": -448.149925497857
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
      "id": "7605c7b0-c0e6-426e-821c-e56bf4773334",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -502.339601526756,
        "y": -411.292607247127
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
      "id": "08ba463b-268f-4852-a04d-5407228f3bf2",
      "type": "form",
      "question": "New Question",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -162.136166144116,
        "y": -424.648570397825
      },
      "thankYouTitle": null,
      "thankYouMessage": null,
      "legalDisclaimer": null,
      "additionalInfoPrompt": null,
      "referencedFlowId": null,
      "formTitle": "Get Your Legal Quote",
      "formDescription": "Tell us about yourself to get started",
      "formFields": [
        {
          "id": "1761763412788",
          "type": "text",
          "label": "Full Name",
          "placeholder": "John Doe",
          "required": true,
          "defaultValue": "Jim Mueller"
        },
        {
          "id": "1761763414355",
          "type": "email",
          "label": "Email Address",
          "placeholder": "example@email.com",
          "required": true,
          "defaultValue": "jimmuell@aol.com"
        }
      ]
    },
    {
      "id": "d4c4c700-5690-4833-94a3-0efb9bd30636",
      "type": "multiple-choice",
      "question": "Please choose the closest option:(Beneficiary)",
      "options": [
        {
          "id": "1",
          "label": "New - Green Card through a Spouse or Family Member (\"Family-Based Green Card\") - Beneficiary"
        },
        {
          "id": "2",
          "label": "New - Make My 2-Year Conditional Green Card Permanent (\"Removal of Conditions \")"
        },
        {
          "id": "1761835781131",
          "label": "New - U.S. Citizenship (\"Naturalization\") - Applying to become a U.S. Citizen"
        },
        {
          "id": "1761835781681",
          "label": "New - Fiance(e) Visa (\"K-1 visa\") - Beneficiary"
        },
        {
          "id": "1761835782264",
          "label": "New - Asylum or Protection From Persecution"
        },
        {
          "id": "1761835782931",
          "label": "New - Other"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 672.57943400038,
        "y": -600.283400282886
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
      "id": "88fa7a2e-d685-4a02-b4aa-6c6ad97e0538",
      "type": "multiple-choice",
      "question": "Please choose the closest option: (Petitioner)",
      "options": [
        {
          "id": "1",
          "label": "New - Green Card through a Spouse or Family Member (\"Family-Based Green Card\") - Petitioner"
        },
        {
          "id": "2",
          "label": "New - Make My 2-Year Conditional Green Card Permanent (\"Removal of Conditions \")"
        },
        {
          "id": "1761835781131",
          "label": "New - U.S. Citizenship (\"Naturalization\") - Applying to become a U.S. Citizen"
        },
        {
          "id": "1761835781681",
          "label": "New - Fiance(e) Visa (\"K-1 visa\") - Petitioner"
        },
        {
          "id": "1761835782264",
          "label": "New - Asylum or Protection From Persecution"
        },
        {
          "id": "1761835782931",
          "label": "New - Other"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 670.289866644077,
        "y": -285.847588223867
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
      "id": "a9ddba67-b381-4b5b-a71b-162a80b48888",
      "sourceNodeId": "7605c7b0-c0e6-426e-821c-e56bf4773334",
      "targetNodeId": "08ba463b-268f-4852-a04d-5407228f3bf2",
      "condition": "any"
    },
    {
      "id": "be20f80d-0829-4a60-8aef-186365c4cefc",
      "sourceNodeId": "08ba463b-268f-4852-a04d-5407228f3bf2",
      "targetNodeId": "cc347dac-e095-4038-ad6e-b2be436e9fef",
      "condition": "any"
    },
    {
      "id": "4055e089-0975-44f8-bb17-dbfafdf2f266",
      "sourceNodeId": "cc347dac-e095-4038-ad6e-b2be436e9fef",
      "targetNodeId": "88fa7a2e-d685-4a02-b4aa-6c6ad97e0538",
      "condition": "2",
      "label": "I am the person sponsoring and filling out this quote request. (petitioner)"
    },
    {
      "id": "d9c4843d-ec53-428b-aae2-c15c1bc11dc8",
      "sourceNodeId": "cc347dac-e095-4038-ad6e-b2be436e9fef",
      "targetNodeId": "d4c4c700-5690-4833-94a3-0efb9bd30636",
      "condition": "1",
      "label": "I am the person being sponsored and I am filling out this quote request (beneficiary)"
    }
  ]
}
```
