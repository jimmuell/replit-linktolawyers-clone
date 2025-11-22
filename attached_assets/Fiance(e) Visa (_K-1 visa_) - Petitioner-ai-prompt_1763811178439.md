# Flow: Fiance(e) Visa ("K-1 visa") - Petitioner

## 📋 Flow Metadata

- **Flow ID**: fiance(e)-visa-("k-1-visa")---petitioner
- **Version**: 1.0
- **Total Screens**: 12
- **Total Connections**: 12
- **Estimated Completion Time**: 6 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 12 screens and 12 connections.
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

#### 1. ☑️ Multiple Choice - `771e7de0-6c42-47f4-b9ae-2d2c636414cb`

**Type**: Multiple Choice Question
**Question**: Is there an age gap between you and your fiancé(e)?
**Options** (5):
  1. "Less than 1 year" (id: `1`)
  2. "Yes, 1-5 years" (id: `2`)
  3. "Yes, 6-10 years" (id: `1763510866317`)
  4. "Yes, 11-15 years " (id: `1763510876391`)
  5. "Yes, more than 20 years" (id: `1763510889812`)

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

#### 2. ☑️ Multiple Choice - `e413e362-851e-4e17-9908-d2426a991fe1`

**Type**: Multiple Choice Question
**Question**: Have you ever applied to bring a fiancé(e) or spouse to the U.S. before?
**Options** (2):
  1. "No" (id: `1`)
  2. "Yes" (id: `2`)

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

#### 3. ☑️ Multiple Choice - `5c6ef713-e70d-4d00-aecd-1edb7c71c1c7`

**Type**: Multiple Choice Question
**Question**: Have you ever been married before?
**Options** (2):
  1. "No" (id: `1`)
  2. "Yes" (id: `2`)

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

#### 4. ✅ Completion - `8e7af73f-c330-46d3-9026-d2d6ffcaa799`

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

#### 5. 🚀 Start - `ab87db0f-2c12-4ed1-a468-c25f2286a186`

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

#### 6. ❓ Yes/No Question - `ca828344-a161-4bbd-b250-20cfd9bb3d40`

**Type**: Yes/No Question
**Question**: Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival? 
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

#### 7. ✍️ Text Input - `d5ce8879-0f49-4a09-8154-9f0c0eb5679e`

**Type**: Text Input Question
**Question**: The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.

We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible options.


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

#### 8. ❓ Yes/No Question - `bad33454-35c5-4ccf-979b-62bad696442a`

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

#### 9. ☑️ Multiple Choice - `251fc761-ca9b-4cf3-b581-278a3aa2736f`

**Type**: Multiple Choice Question
**Question**: How long have you been in a relationship with your significant other? 
**Options** (4):
  1. "Less than 6 months" (id: `1`)
  2. "6 months to 1 year " (id: `2`)
  3. "1 to 2 year " (id: `1763353422966`)
  4. "More than 2 years" (id: `1763353430508`)

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

#### 10. ☑️ Multiple Choice - `053508da-24c7-47bd-ac86-0ab1f5ae7e03`

**Type**: Multiple Choice Question
**Question**: Where is your fiance(e) currently located? 
**Options** (3):
  1. "In their home country" (id: `1`)
  2. "In another country" (id: `2`)
  3. "In the United States " (id: `1763353488455`)

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

#### 11. ❓ Yes/No Question - `a8a134d3-6ba0-4467-823c-4d43d416403a`

**Type**: Yes/No Question
**Question**: Has your fiance(e) ever applied for an immigration benefit before? 
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

#### 12. ✍️ Text Input - `1b619e8c-8062-481f-8f23-788cccadd788`

**Type**: Text Input Question
**Question**: Please briefly explain what immigration benefit your fiance(e) applied for and what happened. 

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
1. **From**: Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival? 
   **To**: The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.

We can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

2. **From**: Have you met in person within the last 2 years? 
   **To**: How long have you been in a relationship with your significant other? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: How long have you been in a relationship with your significant other? 
   **To**: Where is your fiance(e) currently located? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

4. **From**: Where is your fiance(e) currently located? 
   **To**: Has your fiance(e) ever applied for an immigration benefit before? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

5. **From**: Has your fiance(e) ever applied for an immigration benefit before? 
   **To**: Please briefly explain what immigration benefit your fiance(e) applied for and what happened. 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

6. **From**: Start
   **To**: Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

7. **From**: Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival? 
   **To**: Have you ever applied to bring a fiancé(e) or spouse to the U.S. before?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: Have you ever applied to bring a fiancé(e) or spouse to the U.S. before?
   **To**: Have you ever been married before?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: Have you ever been married before?
   **To**: Is there an age gap between you and your fiancé(e)?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: Is there an age gap between you and your fiancé(e)?
   **To**: Have you met in person within the last 2 years? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

11. **From**: Has your fiance(e) ever applied for an immigration benefit before? 
   **To**: Completion
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

12. **From**: Please briefly explain what immigration benefit your fiance(e) applied for and what happened. 
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
  flowId: "fiance(e)-visa-("k-1-visa")---petitioner",
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
  "771e7de0-6c42-47f4-b9ae-2d2c636414cb": "option-id",
  "e413e362-851e-4e17-9908-d2426a991fe1": "option-id",
  "5c6ef713-e70d-4d00-aecd-1edb7c71c1c7": "option-id",
  "8e7af73f-c330-46d3-9026-d2d6ffcaa799": { "additionalInfo": "optional text", "completed": true },
  "ab87db0f-2c12-4ed1-a468-c25f2286a186": { "started": true, "timestamp": "ISO-8601" },
  "ca828344-a161-4bbd-b250-20cfd9bb3d40": "yes" | "no",
  "d5ce8879-0f49-4a09-8154-9f0c0eb5679e": "user text input",
  "bad33454-35c5-4ccf-979b-62bad696442a": "yes" | "no",
  "251fc761-ca9b-4cf3-b581-278a3aa2736f": "option-id",
  "053508da-24c7-47bd-ac86-0ab1f5ae7e03": "option-id",
  "a8a134d3-6ba0-4467-823c-4d43d416403a": "yes" | "no",
  "1b619e8c-8062-481f-8f23-788cccadd788": "user text input"
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
  "name": "Fiance(e) Visa (\"K-1 visa\") - Petitioner",
  "description": "",
  "nodes": [
    {
      "id": "771e7de0-6c42-47f4-b9ae-2d2c636414cb",
      "type": "multiple-choice",
      "question": "Is there an age gap between you and your fiancé(e)?",
      "options": [
        {
          "id": "1",
          "label": "Less than 1 year"
        },
        {
          "id": "2",
          "label": "Yes, 1-5 years"
        },
        {
          "id": "1763510866317",
          "label": "Yes, 6-10 years"
        },
        {
          "id": "1763510876391",
          "label": "Yes, 11-15 years "
        },
        {
          "id": "1763510889812",
          "label": "Yes, more than 20 years"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 192.025,
        "y": -211.75
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
      "id": "e413e362-851e-4e17-9908-d2426a991fe1",
      "type": "multiple-choice",
      "question": "Have you ever applied to bring a fiancé(e) or spouse to the U.S. before?",
      "options": [
        {
          "id": "1",
          "label": "No"
        },
        {
          "id": "2",
          "label": "Yes"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -511.175,
        "y": -197.25
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
      "id": "5c6ef713-e70d-4d00-aecd-1edb7c71c1c7",
      "type": "multiple-choice",
      "question": "Have you ever been married before?",
      "options": [
        {
          "id": "1",
          "label": "No"
        },
        {
          "id": "2",
          "label": "Yes"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -157.175,
        "y": -191.25
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
      "id": "8e7af73f-c330-46d3-9026-d2d6ffcaa799",
      "type": "completion",
      "question": "Completion",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1993.65,
        "y": -216.75
      },
      "thankYouTitle": "Thank You!",
      "thankYouMessage": "We'll match you with an experienced attorney who handles this type of case and they'll be in touch soon.",
      "legalDisclaimer": "Legal Disclaimer: The information provided on this website and form does not constitute legal advice. Using this website or completing this form does not create an attorney-client relationship. All information you provide is kept confidential and used to help provide useful pricing information. For advice on your specific immigration situation, please consult a qualified immigration attorney.",
      "additionalInfoPrompt": "Would you like to add any more details about your case? This helps the attorney understand your case better.",
      "referencedFlowId": null,
      "formTitle": null,
      "formDescription": null
    },
    {
      "id": "ab87db0f-2c12-4ed1-a468-c25f2286a186",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1262.4,
        "y": -159
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
      "id": "ca828344-a161-4bbd-b250-20cfd9bb3d40",
      "type": "yes-no",
      "question": "Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -873,
        "y": -188
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
      "id": "d5ce8879-0f49-4a09-8154-9f0c0eb5679e",
      "type": "text",
      "question": "The K-1 fiancé(e) visa is only for U.S. citizens petitioning for their fiancé(e) to come to the U.S. to get married within 90 days of arrival. Based on your answer, you may not be eligible for this visa.\n\nWe can still try to help! Your information can be routed to an immigration attorney in our network who may be able to advise you on other possible options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -871.762186046511,
        "y": -16.024372093023
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
      "id": "bad33454-35c5-4ccf-979b-62bad696442a",
      "type": "yes-no",
      "question": "Have you met in person within the last 2 years? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 545.25,
        "y": -184.75
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
      "id": "251fc761-ca9b-4cf3-b581-278a3aa2736f",
      "type": "multiple-choice",
      "question": "How long have you been in a relationship with your significant other? ",
      "options": [
        {
          "id": "1",
          "label": "Less than 6 months"
        },
        {
          "id": "2",
          "label": "6 months to 1 year "
        },
        {
          "id": "1763353422966",
          "label": "1 to 2 year "
        },
        {
          "id": "1763353430508",
          "label": "More than 2 years"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 887.25,
        "y": -238.75
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
      "id": "053508da-24c7-47bd-ac86-0ab1f5ae7e03",
      "type": "multiple-choice",
      "question": "Where is your fiance(e) currently located? ",
      "options": [
        {
          "id": "1",
          "label": "In their home country"
        },
        {
          "id": "2",
          "label": "In another country"
        },
        {
          "id": "1763353488455",
          "label": "In the United States "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1247.25,
        "y": -218.75
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
      "id": "a8a134d3-6ba0-4467-823c-4d43d416403a",
      "type": "yes-no",
      "question": "Has your fiance(e) ever applied for an immigration benefit before? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1601.65,
        "y": -236.75
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
      "id": "1b619e8c-8062-481f-8f23-788cccadd788",
      "type": "text",
      "question": "Please briefly explain what immigration benefit your fiance(e) applied for and what happened. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1611.65,
        "y": -74.75
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
      "id": "4ac52638-18da-416a-8669-2a59542db710",
      "sourceNodeId": "ca828344-a161-4bbd-b250-20cfd9bb3d40",
      "targetNodeId": "d5ce8879-0f49-4a09-8154-9f0c0eb5679e",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "90f8ca26-8047-4ddb-bdc8-25bc6e361bc0",
      "sourceNodeId": "bad33454-35c5-4ccf-979b-62bad696442a",
      "targetNodeId": "251fc761-ca9b-4cf3-b581-278a3aa2736f",
      "condition": "any"
    },
    {
      "id": "8cb0d7ac-915a-44ca-8b27-b9790e002ac7",
      "sourceNodeId": "251fc761-ca9b-4cf3-b581-278a3aa2736f",
      "targetNodeId": "053508da-24c7-47bd-ac86-0ab1f5ae7e03",
      "condition": "any"
    },
    {
      "id": "8b9a9745-c32c-43e1-97c5-36c298cc2f75",
      "sourceNodeId": "053508da-24c7-47bd-ac86-0ab1f5ae7e03",
      "targetNodeId": "a8a134d3-6ba0-4467-823c-4d43d416403a",
      "condition": "any"
    },
    {
      "id": "8c431fe8-329a-4d31-ac3f-9e02fdfc3217",
      "sourceNodeId": "a8a134d3-6ba0-4467-823c-4d43d416403a",
      "targetNodeId": "1b619e8c-8062-481f-8f23-788cccadd788",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "86d8a532-47f2-4c0b-a3db-3b4646a72bb9",
      "sourceNodeId": "ab87db0f-2c12-4ed1-a468-c25f2286a186",
      "targetNodeId": "ca828344-a161-4bbd-b250-20cfd9bb3d40",
      "condition": "any"
    },
    {
      "id": "8456eddc-1db4-45d7-b796-045f0bdd1bd1",
      "sourceNodeId": "ca828344-a161-4bbd-b250-20cfd9bb3d40",
      "targetNodeId": "e413e362-851e-4e17-9908-d2426a991fe1",
      "condition": "any"
    },
    {
      "id": "c14667c5-0be2-43fd-89ae-6305c66503c1",
      "sourceNodeId": "e413e362-851e-4e17-9908-d2426a991fe1",
      "targetNodeId": "5c6ef713-e70d-4d00-aecd-1edb7c71c1c7",
      "condition": "any"
    },
    {
      "id": "ccc9a06e-9612-4e36-95a7-fc3b1bd7bc4c",
      "sourceNodeId": "5c6ef713-e70d-4d00-aecd-1edb7c71c1c7",
      "targetNodeId": "771e7de0-6c42-47f4-b9ae-2d2c636414cb",
      "condition": "any"
    },
    {
      "id": "f22b0599-1bf4-4258-a76a-13a7ec7004b2",
      "sourceNodeId": "771e7de0-6c42-47f4-b9ae-2d2c636414cb",
      "targetNodeId": "bad33454-35c5-4ccf-979b-62bad696442a",
      "condition": "any"
    },
    {
      "id": "164d114e-b5f6-40bd-aff4-f235f056940c",
      "sourceNodeId": "a8a134d3-6ba0-4467-823c-4d43d416403a",
      "targetNodeId": "8e7af73f-c330-46d3-9026-d2d6ffcaa799",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "91088c9c-4f07-46e4-83bb-c25afc503d2b",
      "sourceNodeId": "1b619e8c-8062-481f-8f23-788cccadd788",
      "targetNodeId": "8e7af73f-c330-46d3-9026-d2d6ffcaa799",
      "condition": "any"
    }
  ]
}
```
