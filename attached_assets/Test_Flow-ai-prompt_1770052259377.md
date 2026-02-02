# Flow: Test Flow

## 📋 Flow Metadata

- **Flow ID**: test-flow
- **Version**: 1.0
- **Total Screens**: 7
- **Total Connections**: 9
- **Estimated Completion Time**: 4 minutes
- **Created**: 2026-02-02

## 📝 Flow Overview

This document describes a conversational flow with 7 screens and 9 connections.
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

#### 1. 🚀 Start - `77fb2b8c-d73c-40d2-bcde-e1cba531948f`

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

#### 2. ☑️ Multiple Choice - `c62e5f7c-3cf8-4078-9419-485baf3e58f3`

**Type**: Multiple Choice Question
**Question**: What is your favorite color? 
**Options** (4):
  1. "Red" (id: `1`)
  2. "Blue" (id: `2`)
  3. "Yellow" (id: `1770051283349`)
  4. "Green" (id: `1770051283613`)

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

#### 3. ℹ️ Info Display - `a8bba495-c71e-4838-bbf0-8839b9577ee9`

**Type**: Info Display
**Title**: Red
**Description**: Enter your informational message here...

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
  <h2 className="text-2xl font-semibold">Red</h2>
  <p className="text-muted-foreground">Enter your informational message here...</p>
  <Button onClick={handleNext}>Continue</Button>
</div>
```

#### 4. ℹ️ Info Display - `d3b8537e-79c3-4260-9bfc-f0a50248b55d`

**Type**: Info Display
**Title**: Blue
**Description**: Enter your informational message here...

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
  <h2 className="text-2xl font-semibold">Blue</h2>
  <p className="text-muted-foreground">Enter your informational message here...</p>
  <Button onClick={handleNext}>Continue</Button>
</div>
```

#### 5. ℹ️ Info Display - `01865673-c74d-452d-920e-92ec00f8c277`

**Type**: Info Display
**Title**: Yellow
**Description**: Enter your informational message here...

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
  <h2 className="text-2xl font-semibold">Yellow</h2>
  <p className="text-muted-foreground">Enter your informational message here...</p>
  <Button onClick={handleNext}>Continue</Button>
</div>
```

#### 6. ℹ️ Info Display - `c0337278-9620-470a-bb5d-e854bc9c3804`

**Type**: Info Display
**Title**: Green
**Description**: Enter your informational message here...

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
  <h2 className="text-2xl font-semibold">Green</h2>
  <p className="text-muted-foreground">Enter your informational message here...</p>
  <Button onClick={handleNext}>Continue</Button>
</div>
```

#### 7. 🎉 Success - `154d39cd-9259-4581-958f-def933175296`

**Type**: Success Screen
**Title**: Congratulations!
**Message**: You have completed the flow.
**Show Confetti**: Yes

**Implementation Details**:
- Display success/trophy icon (Trophy or PartyPopper from lucide-react)
- Show success title prominently (text-3xl) with celebration styling
- Display success message below title
- If showConfetti is true, trigger confetti animation on screen load
- Use celebratory colors (gold, green, primary)
- This is a terminal node - no further navigation

**Example Layout**:
```tsx
<div className="text-center space-y-4">
  {showConfetti && <Confetti />}
  <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
  <h1 className="text-3xl font-bold">Congratulations!</h1>
  <p className="text-muted-foreground">You have completed the flow.</p>
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
   **To**: What is your favorite color? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

2. **From**: What is your favorite color? 
   **To**: Information
   **Condition**: Red
   **Description**: Proceeds when user selects "Red"

3. **From**: What is your favorite color? 
   **To**: Information
   **Condition**: Blue
   **Description**: Proceeds when user selects "Blue"

4. **From**: What is your favorite color? 
   **To**: Information
   **Condition**: Yellow
   **Description**: Proceeds when user selects "Yellow"

5. **From**: What is your favorite color? 
   **To**: Information
   **Condition**: Green
   **Description**: Proceeds when user selects "Green"

6. **From**: Information
   **To**: Success
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

7. **From**: Information
   **To**: Success
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: Information
   **To**: Success
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: Information
   **To**: Success
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
  flowId: "test-flow",
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
  "77fb2b8c-d73c-40d2-bcde-e1cba531948f": { "started": true, "timestamp": "ISO-8601" },
  "c62e5f7c-3cf8-4078-9419-485baf3e58f3": "option-id",
  "a8bba495-c71e-4838-bbf0-8839b9577ee9": "response-value",
  "d3b8537e-79c3-4260-9bfc-f0a50248b55d": "response-value",
  "01865673-c74d-452d-920e-92ec00f8c277": "response-value",
  "c0337278-9620-470a-bb5d-e854bc9c3804": "response-value",
  "154d39cd-9259-4581-958f-def933175296": "response-value"
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
  "name": "Test Flow",
  "description": "",
  "nodes": [
    {
      "id": "77fb2b8c-d73c-40d2-bcde-e1cba531948f",
      "type": "start",
      "position": {
        "x": 177,
        "y": -118
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
      "id": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "type": "multiple-choice",
      "position": {
        "x": 173.6884765625,
        "y": 10.2890625
      },
      "question": "What is your favorite color? ",
      "yesLabel": null,
      "noLabel": null,
      "options": [
        {
          "id": "1",
          "label": "Red"
        },
        {
          "id": "2",
          "label": "Blue"
        },
        {
          "id": "1770051283349",
          "label": "Yellow"
        },
        {
          "id": "1770051283613",
          "label": "Green"
        }
      ],
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
      "id": "a8bba495-c71e-4838-bbf0-8839b9577ee9",
      "type": "info",
      "position": {
        "x": -383.639257817371,
        "y": 245.382170613404
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Red",
      "formDescription": "Enter your informational message here...",
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
      "infoTitle": "Red",
      "infoDescription": "Enter your informational message here...",
      "referencedFlowId": null
    },
    {
      "id": "d3b8537e-79c3-4260-9bfc-f0a50248b55d",
      "type": "info",
      "position": {
        "x": 24.7945392212865,
        "y": 332.036650721417
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Blue",
      "formDescription": "Enter your informational message here...",
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
      "infoTitle": "Blue",
      "infoDescription": "Enter your informational message here...",
      "referencedFlowId": null
    },
    {
      "id": "01865673-c74d-452d-920e-92ec00f8c277",
      "type": "info",
      "position": {
        "x": 378.553530363806,
        "y": 331.170400947997
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Yellow",
      "formDescription": "Enter your informational message here...",
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
      "infoTitle": "Yellow",
      "infoDescription": "Enter your informational message here...",
      "referencedFlowId": null
    },
    {
      "id": "c0337278-9620-470a-bb5d-e854bc9c3804",
      "type": "info",
      "position": {
        "x": 717.883763968028,
        "y": 236.481935908017
      },
      "question": "Information",
      "yesLabel": null,
      "noLabel": null,
      "options": null,
      "formTitle": "Green",
      "formDescription": "Enter your informational message here...",
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
      "infoTitle": "Green",
      "infoDescription": "Enter your informational message here...",
      "referencedFlowId": null
    },
    {
      "id": "154d39cd-9259-4581-958f-def933175296",
      "type": "success",
      "position": {
        "x": 219.384862697562,
        "y": 611.975446247262
      },
      "question": "Success",
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
    }
  ],
  "connections": [
    {
      "id": "e0dc3248-d903-4adb-8d7a-19cb481ad83e",
      "sourceNodeId": "77fb2b8c-d73c-40d2-bcde-e1cba531948f",
      "targetNodeId": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "condition": "any",
      "displayLabel": "Any",
      "abbreviatedLabel": "Any",
      "isEndConnection": false,
      "label": "Any",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "76ad4cdd-b6f1-4dd3-9808-8dcf3b684512",
      "sourceNodeId": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "targetNodeId": "a8bba495-c71e-4838-bbf0-8839b9577ee9",
      "condition": "1",
      "displayLabel": "Red",
      "abbreviatedLabel": "A",
      "isEndConnection": false,
      "label": "Red",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "aff0dd62-00d2-49c0-a165-1134db26b53c",
      "sourceNodeId": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "targetNodeId": "d3b8537e-79c3-4260-9bfc-f0a50248b55d",
      "condition": "2",
      "displayLabel": "Blue",
      "abbreviatedLabel": "B",
      "isEndConnection": false,
      "label": "Blue",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "2cb9ed9e-c7d3-4768-b2da-dd95bce53f19",
      "sourceNodeId": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "targetNodeId": "01865673-c74d-452d-920e-92ec00f8c277",
      "condition": "1770051283349",
      "displayLabel": "Yellow",
      "abbreviatedLabel": "C",
      "isEndConnection": false,
      "label": "Yellow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "c0b678d3-8370-452e-8659-53ecefb6f3a5",
      "sourceNodeId": "c62e5f7c-3cf8-4078-9419-485baf3e58f3",
      "targetNodeId": "c0337278-9620-470a-bb5d-e854bc9c3804",
      "condition": "1770051283613",
      "displayLabel": "Green",
      "abbreviatedLabel": "D",
      "isEndConnection": false,
      "label": "Green",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "5dd42e67-801f-4194-ad32-918538d2d2f1",
      "sourceNodeId": "a8bba495-c71e-4838-bbf0-8839b9577ee9",
      "targetNodeId": "154d39cd-9259-4581-958f-def933175296",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "20bd6e3a-8734-4385-8fd6-7a75257707f6",
      "sourceNodeId": "d3b8537e-79c3-4260-9bfc-f0a50248b55d",
      "targetNodeId": "154d39cd-9259-4581-958f-def933175296",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "3dfc529e-58bc-4dfe-959c-a530471ad4d6",
      "sourceNodeId": "01865673-c74d-452d-920e-92ec00f8c277",
      "targetNodeId": "154d39cd-9259-4581-958f-def933175296",
      "condition": "any",
      "displayLabel": "Any → End Flow",
      "abbreviatedLabel": "End",
      "isEndConnection": true,
      "label": "Any → End Flow",
      "sourceHandle": "source-bottom",
      "targetHandle": "target-top"
    },
    {
      "id": "7e3d3304-1f4f-49c0-b8e3-864d42bce301",
      "sourceNodeId": "c0337278-9620-470a-bb5d-e854bc9c3804",
      "targetNodeId": "154d39cd-9259-4581-958f-def933175296",
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
