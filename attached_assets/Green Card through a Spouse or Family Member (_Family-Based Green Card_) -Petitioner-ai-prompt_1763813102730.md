# Flow: Green Card through a Spouse or Family Member ("Family-Based Green Card") -Petitioner

## 📋 Flow Metadata

- **Flow ID**: green-card-through-a-spouse-or-family-member-("family-based-green-card")--petitioner
- **Version**: 1.0
- **Total Screens**: 20
- **Total Connections**: 26
- **Estimated Completion Time**: 10 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 20 screens and 26 connections.
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

#### 1. 🚀 Start - `e2f31825-5ff7-4e92-9f58-93b52a6fe4f8`

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

#### 2. ❓ Yes/No Question - `6fbd1385-3788-428a-9c74-f03b52e3910d`

**Type**: Yes/No Question
**Question**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
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

#### 3. ✍️ Text Input - `1e78074a-2945-420a-8580-79729429f6b3`

**Type**: Text Input Question
**Question**: This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, or child). Based on your answer, you may not be applying for a family petition. 

We can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.


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

#### 4. ☑️ Multiple Choice - `50b727e1-bbd7-489f-a2a0-8c8983eee8a4`

**Type**: Multiple Choice Question
**Question**: What is your relationship to the person you’re sponsoring?  

Select the option that best describes your relationship. This information helps the attorney understand your situation and guide you properly.  

**Options** (6):
  1. "Spouse - I am married to the person I’m sponsoring " (id: `1`)
  2. "Parent - I am the parent of the person I’m sponsoring " (id: `2`)
  3. "Child - I am the adult child (21 years or older) of the person I’m sponsoring " (id: `1763512892200`)
  4. "Siblings - I am the sibling (brother/sister) of the person I’m sponsoring " (id: `1763512899345`)
  5. "Stepparents - I am the stepparent of the person I’m sponsoring (stepchild, under 21 years old)" (id: `1763512906247`)
  6. "Other / Not Sure " (id: `1763512922975`)

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

#### 5. ☑️ Multiple Choice - `844c1f7f-2d1d-4e49-af98-eb83dc605247`

**Type**: Multiple Choice Question
**Question**: What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)
**Options** (3):
  1. "I am a U.S. citizen " (id: `1`)
  2. "I am a lawful permanent resident (green card holder)" (id: `2`)
  3. "Other / Not Sure " (id: `1763512987663`)

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

#### 6. ☑️ Multiple Choice - `40ab1ffe-138c-4040-955f-129859f612c3`

**Type**: Multiple Choice Question
**Question**: How did you obtain U.S. citizenship? 
**Options** (2):
  1. "I was born in the U.S. " (id: `1`)
  2. "I became a U.S. citizen through naturalization. " (id: `2`)

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

#### 7. ☑️ Multiple Choice - `24bf7a1f-5ba3-4a5e-ba50-ff0a597f687a`

**Type**: Multiple Choice Question
**Question**: If naturalized, how did you obtain your green card? 
**Options** (5):
  1. "Marriage to a U.S. citizen or green card holder " (id: `1`)
  2. "Family sponsorship (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)" (id: `2`)
  3. "Employment " (id: `1763513125499`)
  4. "Asylum " (id: `1763513134232`)
  5. "Other / Not sure " (id: `1763513141431`)

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

#### 8. ☑️ Multiple Choice - `ef6c18b0-a1bb-40a0-961f-54496ae10c29`

**Type**: Multiple Choice Question
**Question**: How did you obtain your green card? (Select the option that best describes your situation) 
**Options** (5):
  1. "Marriage to a U.S. citizen or green card holder" (id: `1`)
  2. "Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)" (id: `2`)
  3. "Employment " (id: `1763513213453`)
  4. "Asylum" (id: `1763513226583`)
  5. "Other / Not sure " (id: `1763513233226`)

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

#### 9. ☑️ Multiple Choice - `63de3b68-133f-44fe-afb1-61a9478fafdc`

**Type**: Multiple Choice Question
**Question**: Has the person you are sponsoring ever stayed in the U.S. longer than you were allowed or violated the terms of your visa? 
 
(This means staying past the date on your I-94 / entry papers, working without permission or doing anything your visa did not allow)

**Options** (3):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)
  3. "Not sure" (id: `1763513420879`)

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

#### 10. ☑️ Multiple Choice - `4c513c5f-41ae-49c1-be53-cb43cd77cc24`

**Type**: Multiple Choice Question
**Question**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
**Options** (2):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)

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

#### 11. ✍️ Text Input - `00133746-c0e1-4ab3-a7d4-e8c1741c3b00`

**Type**: Text Input Question
**Question**: If yes, please briefly describe.

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

#### 12. ☑️ Multiple Choice - `ad26eede-a490-47c6-afb6-944a8cb4638f`

**Type**: Multiple Choice Question
**Question**: Is the person you are sponsoring currently married, or have they been married in the past?
**Options** (3):
  1. "No, never married" (id: `1`)
  2. "Yes, married before - ended in divorce, annulment, or spouse passed away" (id: `2`)
  3. "Yes, currently married" (id: `1763513621471`)

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

#### 13. ☑️ Multiple Choice - `422364e1-bd3c-4d67-82bc-046f4dea1c4b`

**Type**: Multiple Choice Question
**Question**: Has the person you are sponsoring ever been in immigration court or removal proceedings? 
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)
  3. "Not sure" (id: `1763513679900`)

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

#### 14. ☑️ Multiple Choice - `1b97a2c1-5ce3-47e3-879e-b72008e46e09`

**Type**: Multiple Choice Question
**Question**: How did the person you are sponsoring enter the U.S. 
**Options** (5):
  1. "Tourist Visa (B1/B2 visa)" (id: `1`)
  2. "Student Visa (F-1 visa)" (id: `2`)
  3. "Employment Visa" (id: `1763513761140`)
  4. "J1 visa" (id: `1763513771086`)
  5. "Other / Not sure" (id: `1763513782248`)

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

#### 15. ☑️ Multiple Choice - `a09b2731-d20e-4d1c-a14c-ac8112d74254`

**Type**: Multiple Choice Question
**Question**: Is the person you are sponsoring currently inside or outside the U.S.?
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

#### 16. ☑️ Multiple Choice - `032a4b9e-302c-473d-8993-cf7e8e234020`

**Type**: Multiple Choice Question
**Question**: If the person you are sponsoring is currently in the U.S., were they inspected by a U.S. border officer when they entered?
**Options** (2):
  1. "Yes - they were inspected and admitted" (id: `1`)
  2. "No - they entered without being inspected" (id: `2`)

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

#### 17. ☑️ Multiple Choice - `74d8c1b1-33ed-482e-8649-2c89a42bf614`

**Type**: Multiple Choice Question
**Question**: If the person you are sponsoring has entered the U.S. without being inspected by a U.S. border officer, how many times did this happen?
**Options** (3):
  1. "Once" (id: `1`)
  2. "More than once" (id: `2`)
  3. "Not sure" (id: `1763514387551`)

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

#### 18. ☑️ Multiple Choice - `2867cef7-9bbf-4b70-aeb8-4559eba8c3d6`

**Type**: Multiple Choice Question
**Question**: Has the person you are sponsoring ever applied for an immigration benefit? 
**Options** (2):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)

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

#### 19. ✅ End - `6e08188d-f5db-4b92-b648-807d0d56cbba`

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

#### 20. ✍️ Text Input - `16f34e9c-b794-4c60-8cf7-cd6186761d82`

**Type**: Text Input Question
**Question**: Please briefly explain the immigration benefit that they've applied for. 

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
1. **From**: If the person you are sponsoring is currently in the U.S., were they inspected by a U.S. border officer when they entered?
   **To**: If the person you are sponsoring has entered the U.S. without being inspected by a U.S. border officer, how many times did this happen?
   **Condition**: No - they entered without being inspected
   **Description**: Proceeds when user selects "No - they entered without being inspected"

2. **From**: Has the person you are sponsoring ever been in immigration court or removal proceedings? 
   **To**: Is the person you are sponsoring currently married, or have they been married in the past?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: How did you obtain U.S. citizenship? 
   **To**: If naturalized, how did you obtain your green card? 
   **Condition**: I became a U.S. citizen through naturalization. 
   **Description**: Proceeds when user selects "I became a U.S. citizen through naturalization. "

4. **From**: If naturalized, how did you obtain your green card? 
   **To**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

5. **From**: How did you obtain your green card? (Select the option that best describes your situation) 
   **To**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **Condition**: Other / Not sure 
   **Description**: Proceeds when user selects "Other / Not sure "

6. **From**: How did you obtain U.S. citizenship? 
   **To**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **Condition**: I was born in the U.S. 
   **Description**: Proceeds when user selects "I was born in the U.S. "

7. **From**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **To**: Is the person you are sponsoring currently inside or outside the U.S.?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: If yes, please briefly describe.
   **To**: Is the person you are sponsoring currently inside or outside the U.S.?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: How did the person you are sponsoring enter the U.S. 
   **To**: Has the person you are sponsoring ever stayed in the U.S. longer than you were allowed or violated the terms of your visa? 
 
(This means staying past the date on your I-94 / entry papers, working without permission or doing anything your visa did not allow)

   **Condition**: Other / Not sure
   **Description**: Proceeds when user selects "Other / Not sure"

10. **From**: Has the person you are sponsoring ever stayed in the U.S. longer than you were allowed or violated the terms of your visa? 
 
(This means staying past the date on your I-94 / entry papers, working without permission or doing anything your visa did not allow)

   **To**: Has the person you are sponsoring ever been in immigration court or removal proceedings? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

11. **From**: What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)
   **To**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **Condition**: Other / Not Sure 
   **Description**: Proceeds when user selects "Other / Not Sure "

12. **From**: If the person you are sponsoring has entered the U.S. without being inspected by a U.S. border officer, how many times did this happen?
   **To**: Has the person you are sponsoring ever been in immigration court or removal proceedings? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

13. **From**: Is the person you are sponsoring currently married, or have they been married in the past?
   **To**: Has the person you are sponsoring ever applied for an immigration benefit? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

14. **From**: Is the person you are sponsoring currently inside or outside the U.S.?
   **To**: Is the person you are sponsoring currently married, or have they been married in the past?
   **Condition**: Outside the U.S.
   **Description**: Proceeds when user selects "Outside the U.S."

15. **From**: Has the person you are sponsoring ever applied for an immigration benefit? 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

16. **From**: If the person you are sponsoring is currently in the U.S., were they inspected by a U.S. border officer when they entered?
   **To**: How did the person you are sponsoring enter the U.S. 
   **Condition**: Yes - they were inspected and admitted
   **Description**: Proceeds when user selects "Yes - they were inspected and admitted"

17. **From**: Has the person you are sponsoring ever applied for an immigration benefit? 
   **To**: Please briefly explain the immigration benefit that they've applied for. 
   **Condition**: Yes
   **Description**: Proceeds when user selects "Yes"

18. **From**: Please briefly explain the immigration benefit that they've applied for. 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

19. **From**: Start
   **To**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

20. **From**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **To**: This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, or child). Based on your answer, you may not be applying for a family petition. 

We can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

21. **From**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **To**: What is your relationship to the person you’re sponsoring?  

Select the option that best describes your relationship. This information helps the attorney understand your situation and guide you properly.  

   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

22. **From**: What is your relationship to the person you’re sponsoring?  

Select the option that best describes your relationship. This information helps the attorney understand your situation and guide you properly.  

   **To**: What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)
   **Condition**: Other / Not Sure 
   **Description**: Proceeds when user selects "Other / Not Sure "

23. **From**: What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)
   **To**: How did you obtain U.S. citizenship? 
   **Condition**: I am a U.S. citizen 
   **Description**: Proceeds when user selects "I am a U.S. citizen "

24. **From**: What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)
   **To**: How did you obtain your green card? (Select the option that best describes your situation) 
   **Condition**: I am a lawful permanent resident (green card holder)
   **Description**: Proceeds when user selects "I am a lawful permanent resident (green card holder)"

25. **From**: Have you ever sponsored someone or applied for an immigration benefit for someone before? 
   **To**: If yes, please briefly describe.
   **Condition**: Yes
   **Description**: Proceeds when user selects "Yes"

26. **From**: Is the person you are sponsoring currently inside or outside the U.S.?
   **To**: If the person you are sponsoring is currently in the U.S., were they inspected by a U.S. border officer when they entered?
   **Condition**: Inside the U.S. 
   **Description**: Proceeds when user selects "Inside the U.S. "


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
  flowId: "green-card-through-a-spouse-or-family-member-("family-based-green-card")--petitioner",
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
  "e2f31825-5ff7-4e92-9f58-93b52a6fe4f8": { "started": true, "timestamp": "ISO-8601" },
  "6fbd1385-3788-428a-9c74-f03b52e3910d": "yes" | "no",
  "1e78074a-2945-420a-8580-79729429f6b3": "user text input",
  "50b727e1-bbd7-489f-a2a0-8c8983eee8a4": "option-id",
  "844c1f7f-2d1d-4e49-af98-eb83dc605247": "option-id",
  "40ab1ffe-138c-4040-955f-129859f612c3": "option-id",
  "24bf7a1f-5ba3-4a5e-ba50-ff0a597f687a": "option-id",
  "ef6c18b0-a1bb-40a0-961f-54496ae10c29": "option-id",
  "63de3b68-133f-44fe-afb1-61a9478fafdc": "option-id",
  "4c513c5f-41ae-49c1-be53-cb43cd77cc24": "option-id",
  "00133746-c0e1-4ab3-a7d4-e8c1741c3b00": "user text input",
  "ad26eede-a490-47c6-afb6-944a8cb4638f": "option-id",
  "422364e1-bd3c-4d67-82bc-046f4dea1c4b": "option-id",
  "1b97a2c1-5ce3-47e3-879e-b72008e46e09": "option-id",
  "a09b2731-d20e-4d1c-a14c-ac8112d74254": "option-id",
  "032a4b9e-302c-473d-8993-cf7e8e234020": "option-id",
  "74d8c1b1-33ed-482e-8649-2c89a42bf614": "option-id",
  "2867cef7-9bbf-4b70-aeb8-4559eba8c3d6": "option-id",
  "6e08188d-f5db-4b92-b648-807d0d56cbba": { "additionalInfo": "optional text", "completed": true },
  "16f34e9c-b794-4c60-8cf7-cd6186761d82": "user text input"
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
  "name": "Green Card through a Spouse or Family Member (\"Family-Based Green Card\") -Petitioner",
  "description": "",
  "nodes": [
    {
      "id": "e2f31825-5ff7-4e92-9f58-93b52a6fe4f8",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -3444.4,
        "y": 274
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
      "id": "6fbd1385-3788-428a-9c74-f03b52e3910d",
      "type": "yes-no",
      "question": "Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -3077.92911627907,
        "y": 262.563441860465
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
      "id": "1e78074a-2945-420a-8580-79729429f6b3",
      "type": "text",
      "question": "This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, or child). Based on your answer, you may not be applying for a family petition. \n\nWe can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -3070.7,
        "y": 428.5
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
      "id": "50b727e1-bbd7-489f-a2a0-8c8983eee8a4",
      "type": "multiple-choice",
      "question": "What is your relationship to the person you’re sponsoring?  \n\nSelect the option that best describes your relationship. This information helps the attorney understand your situation and guide you properly.  \n",
      "options": [
        {
          "id": "1",
          "label": "Spouse - I am married to the person I’m sponsoring "
        },
        {
          "id": "2",
          "label": "Parent - I am the parent of the person I’m sponsoring "
        },
        {
          "id": "1763512892200",
          "label": "Child - I am the adult child (21 years or older) of the person I’m sponsoring "
        },
        {
          "id": "1763512899345",
          "label": "Siblings - I am the sibling (brother/sister) of the person I’m sponsoring "
        },
        {
          "id": "1763512906247",
          "label": "Stepparents - I am the stepparent of the person I’m sponsoring (stepchild, under 21 years old)"
        },
        {
          "id": "1763512922975",
          "label": "Other / Not Sure "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -2719.5,
        "y": 100.5
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
      "id": "844c1f7f-2d1d-4e49-af98-eb83dc605247",
      "type": "multiple-choice",
      "question": "What is your current U.S. immigration legal status (this refers to you - the petitioner sponsoring your relative)",
      "options": [
        {
          "id": "1",
          "label": "I am a U.S. citizen "
        },
        {
          "id": "2",
          "label": "I am a lawful permanent resident (green card holder)"
        },
        {
          "id": "1763512987663",
          "label": "Other / Not Sure "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -2342.7,
        "y": -5.49999999999994
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
      "id": "40ab1ffe-138c-4040-955f-129859f612c3",
      "type": "multiple-choice",
      "question": "How did you obtain U.S. citizenship? ",
      "options": [
        {
          "id": "1",
          "label": "I was born in the U.S. "
        },
        {
          "id": "2",
          "label": "I became a U.S. citizen through naturalization. "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1985.9,
        "y": -118.3
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
      "id": "24bf7a1f-5ba3-4a5e-ba50-ff0a597f687a",
      "type": "multiple-choice",
      "question": "If naturalized, how did you obtain your green card? ",
      "options": [
        {
          "id": "1",
          "label": "Marriage to a U.S. citizen or green card holder "
        },
        {
          "id": "2",
          "label": "Family sponsorship (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)"
        },
        {
          "id": "1763513125499",
          "label": "Employment "
        },
        {
          "id": "1763513134232",
          "label": "Asylum "
        },
        {
          "id": "1763513141431",
          "label": "Other / Not sure "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1635.1,
        "y": -13.4999999999999
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
      "id": "ef6c18b0-a1bb-40a0-961f-54496ae10c29",
      "type": "multiple-choice",
      "question": "How did you obtain your green card? (Select the option that best describes your situation) ",
      "options": [
        {
          "id": "1",
          "label": "Marriage to a U.S. citizen or green card holder"
        },
        {
          "id": "2",
          "label": "Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)"
        },
        {
          "id": "1763513213453",
          "label": "Employment "
        },
        {
          "id": "1763513226583",
          "label": "Asylum"
        },
        {
          "id": "1763513233226",
          "label": "Other / Not sure "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1981.1,
        "y": 176.5
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
      "id": "63de3b68-133f-44fe-afb1-61a9478fafdc",
      "type": "multiple-choice",
      "question": "Has the person you are sponsoring ever stayed in the U.S. longer than you were allowed or violated the terms of your visa? \n \n(This means staying past the date on your I-94 / entry papers, working without permission or doing anything your visa did not allow)\n",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No"
        },
        {
          "id": "1763513420879",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -102.7,
        "y": 56.5
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
      "id": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "type": "multiple-choice",
      "question": "Have you ever sponsored someone or applied for an immigration benefit for someone before? ",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1259.5,
        "y": 64.5000000000001
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
      "id": "00133746-c0e1-4ab3-a7d4-e8c1741c3b00",
      "type": "text",
      "question": "If yes, please briefly describe.",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -1269.1,
        "y": 264.5
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
      "id": "ad26eede-a490-47c6-afb6-944a8cb4638f",
      "type": "multiple-choice",
      "question": "Is the person you are sponsoring currently married, or have they been married in the past?",
      "options": [
        {
          "id": "1",
          "label": "No, never married"
        },
        {
          "id": "2",
          "label": "Yes, married before - ended in divorce, annulment, or spouse passed away"
        },
        {
          "id": "1763513621471",
          "label": "Yes, currently married"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 644.500000000001,
        "y": 72.4999999999999
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
      "id": "422364e1-bd3c-4d67-82bc-046f4dea1c4b",
      "type": "multiple-choice",
      "question": "Has the person you are sponsoring ever been in immigration court or removal proceedings? ",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No"
        },
        {
          "id": "1763513679900",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 262.5,
        "y": 70.5
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
      "id": "1b97a2c1-5ce3-47e3-879e-b72008e46e09",
      "type": "multiple-choice",
      "question": "How did the person you are sponsoring enter the U.S. ",
      "options": [
        {
          "id": "1",
          "label": "Tourist Visa (B1/B2 visa)"
        },
        {
          "id": "2",
          "label": "Student Visa (F-1 visa)"
        },
        {
          "id": "1763513761140",
          "label": "Employment Visa"
        },
        {
          "id": "1763513771086",
          "label": "J1 visa"
        },
        {
          "id": "1763513782248",
          "label": "Other / Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -489.499999999999,
        "y": 144.1
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
      "id": "a09b2731-d20e-4d1c-a14c-ac8112d74254",
      "type": "multiple-choice",
      "question": "Is the person you are sponsoring currently inside or outside the U.S.?",
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
        "x": -870.299999999998,
        "y": 44.1000000000004
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
      "id": "032a4b9e-302c-473d-8993-cf7e8e234020",
      "type": "multiple-choice",
      "question": "If the person you are sponsoring is currently in the U.S., were they inspected by a U.S. border officer when they entered?",
      "options": [
        {
          "id": "1",
          "label": "Yes - they were inspected and admitted"
        },
        {
          "id": "2",
          "label": "No - they entered without being inspected"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -876.299999999998,
        "y": 272.1
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
      "id": "74d8c1b1-33ed-482e-8649-2c89a42bf614",
      "type": "multiple-choice",
      "question": "If the person you are sponsoring has entered the U.S. without being inspected by a U.S. border officer, how many times did this happen?",
      "options": [
        {
          "id": "1",
          "label": "Once"
        },
        {
          "id": "2",
          "label": "More than once"
        },
        {
          "id": "1763514387551",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -882.299999999998,
        "y": 478.1
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
      "id": "2867cef7-9bbf-4b70-aeb8-4559eba8c3d6",
      "type": "multiple-choice",
      "question": "Has the person you are sponsoring ever applied for an immigration benefit? ",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1043.85,
        "y": 90.9
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
      "id": "6e08188d-f5db-4b92-b648-807d0d56cbba",
      "type": "end",
      "question": "End",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1459.85,
        "y": 142.9
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
      "id": "16f34e9c-b794-4c60-8cf7-cd6186761d82",
      "type": "text",
      "question": "Please briefly explain the immigration benefit that they've applied for. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1059.925,
        "y": 378.9
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
      "id": "f59fe00c-fb9d-4316-b76b-8a6f2c92806b",
      "sourceNodeId": "032a4b9e-302c-473d-8993-cf7e8e234020",
      "targetNodeId": "74d8c1b1-33ed-482e-8649-2c89a42bf614",
      "condition": "2",
      "label": "No - they entered without being inspected"
    },
    {
      "id": "a3a4a10b-88b0-43be-af40-e15843396b86",
      "sourceNodeId": "422364e1-bd3c-4d67-82bc-046f4dea1c4b",
      "targetNodeId": "ad26eede-a490-47c6-afb6-944a8cb4638f",
      "condition": "any"
    },
    {
      "id": "5301f49f-1389-4984-b911-a07b294ca807",
      "sourceNodeId": "40ab1ffe-138c-4040-955f-129859f612c3",
      "targetNodeId": "24bf7a1f-5ba3-4a5e-ba50-ff0a597f687a",
      "condition": "2",
      "label": "I became a U.S. citizen through naturalization. "
    },
    {
      "id": "68a84f77-0ef2-431f-b9c0-94b94a9a198b",
      "sourceNodeId": "24bf7a1f-5ba3-4a5e-ba50-ff0a597f687a",
      "targetNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "condition": "any"
    },
    {
      "id": "68365f28-5f8f-431c-b95e-c4655dec4bd8",
      "sourceNodeId": "ef6c18b0-a1bb-40a0-961f-54496ae10c29",
      "targetNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "condition": "1763513233226",
      "label": "Other / Not sure "
    },
    {
      "id": "1deed589-076e-407f-865f-e7d3eb437aa1",
      "sourceNodeId": "40ab1ffe-138c-4040-955f-129859f612c3",
      "targetNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "condition": "1",
      "label": "I was born in the U.S. "
    },
    {
      "id": "8af22ac0-4bdf-49bf-bade-85142a86c6f3",
      "sourceNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "targetNodeId": "a09b2731-d20e-4d1c-a14c-ac8112d74254",
      "condition": "any"
    },
    {
      "id": "b93113e1-af56-476c-9a81-e771425be56c",
      "sourceNodeId": "00133746-c0e1-4ab3-a7d4-e8c1741c3b00",
      "targetNodeId": "a09b2731-d20e-4d1c-a14c-ac8112d74254",
      "condition": "any"
    },
    {
      "id": "5d10f5c7-5b17-4936-8db0-037fc057a748",
      "sourceNodeId": "1b97a2c1-5ce3-47e3-879e-b72008e46e09",
      "targetNodeId": "63de3b68-133f-44fe-afb1-61a9478fafdc",
      "condition": "1763513782248",
      "label": "Other / Not sure"
    },
    {
      "id": "ac37ccd2-84c7-4453-be22-94f20aeac913",
      "sourceNodeId": "63de3b68-133f-44fe-afb1-61a9478fafdc",
      "targetNodeId": "422364e1-bd3c-4d67-82bc-046f4dea1c4b",
      "condition": "any"
    },
    {
      "id": "4e214e16-5e54-4c5c-a2ba-7721ef8ef77f",
      "sourceNodeId": "844c1f7f-2d1d-4e49-af98-eb83dc605247",
      "targetNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "condition": "1763512987663",
      "label": "Other / Not Sure "
    },
    {
      "id": "ee28ba19-969c-45e1-8086-fc0a03971de3",
      "sourceNodeId": "74d8c1b1-33ed-482e-8649-2c89a42bf614",
      "targetNodeId": "422364e1-bd3c-4d67-82bc-046f4dea1c4b",
      "condition": "any"
    },
    {
      "id": "d95c1a03-d0a9-47a8-8a31-75be4d3039f2",
      "sourceNodeId": "ad26eede-a490-47c6-afb6-944a8cb4638f",
      "targetNodeId": "2867cef7-9bbf-4b70-aeb8-4559eba8c3d6",
      "condition": "any"
    },
    {
      "id": "787e91dd-645f-4b72-837c-af5ae0aa89f6",
      "sourceNodeId": "a09b2731-d20e-4d1c-a14c-ac8112d74254",
      "targetNodeId": "ad26eede-a490-47c6-afb6-944a8cb4638f",
      "condition": "2",
      "label": "Outside the U.S."
    },
    {
      "id": "dc6cea3f-dce5-450b-aa58-591df9297f96",
      "sourceNodeId": "2867cef7-9bbf-4b70-aeb8-4559eba8c3d6",
      "targetNodeId": "6e08188d-f5db-4b92-b648-807d0d56cbba",
      "condition": "any"
    },
    {
      "id": "7494adf7-a7f8-491e-8f32-4b7d5d6698c1",
      "sourceNodeId": "032a4b9e-302c-473d-8993-cf7e8e234020",
      "targetNodeId": "1b97a2c1-5ce3-47e3-879e-b72008e46e09",
      "condition": "1",
      "label": "Yes - they were inspected and admitted"
    },
    {
      "id": "9728894e-5c52-4682-8dcf-fdd85d766bb4",
      "sourceNodeId": "2867cef7-9bbf-4b70-aeb8-4559eba8c3d6",
      "targetNodeId": "16f34e9c-b794-4c60-8cf7-cd6186761d82",
      "condition": "1",
      "label": "Yes"
    },
    {
      "id": "0b978844-d49e-4f0f-9dbf-f65356d787e1",
      "sourceNodeId": "16f34e9c-b794-4c60-8cf7-cd6186761d82",
      "targetNodeId": "6e08188d-f5db-4b92-b648-807d0d56cbba",
      "condition": "any"
    },
    {
      "id": "ed3600e9-58c8-403a-affc-9ab4e3257dba",
      "sourceNodeId": "e2f31825-5ff7-4e92-9f58-93b52a6fe4f8",
      "targetNodeId": "6fbd1385-3788-428a-9c74-f03b52e3910d",
      "condition": "any"
    },
    {
      "id": "5f1fd757-92d8-4491-a124-593360fc7248",
      "sourceNodeId": "6fbd1385-3788-428a-9c74-f03b52e3910d",
      "targetNodeId": "1e78074a-2945-420a-8580-79729429f6b3",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "1f206869-290c-4451-9c32-14a815d8cfe0",
      "sourceNodeId": "6fbd1385-3788-428a-9c74-f03b52e3910d",
      "targetNodeId": "50b727e1-bbd7-489f-a2a0-8c8983eee8a4",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "99577558-08d7-49c3-a667-5ae934a7d1b7",
      "sourceNodeId": "50b727e1-bbd7-489f-a2a0-8c8983eee8a4",
      "targetNodeId": "844c1f7f-2d1d-4e49-af98-eb83dc605247",
      "condition": "1763512922975",
      "label": "Other / Not Sure "
    },
    {
      "id": "6d6f0d49-e6f2-4495-8933-43f4e003ee2d",
      "sourceNodeId": "844c1f7f-2d1d-4e49-af98-eb83dc605247",
      "targetNodeId": "40ab1ffe-138c-4040-955f-129859f612c3",
      "condition": "1",
      "label": "I am a U.S. citizen "
    },
    {
      "id": "91035166-2aed-4122-8b30-9e451107b899",
      "sourceNodeId": "844c1f7f-2d1d-4e49-af98-eb83dc605247",
      "targetNodeId": "ef6c18b0-a1bb-40a0-961f-54496ae10c29",
      "condition": "2",
      "label": "I am a lawful permanent resident (green card holder)"
    },
    {
      "id": "ed7e95ca-403c-4169-b129-83427a0040f9",
      "sourceNodeId": "4c513c5f-41ae-49c1-be53-cb43cd77cc24",
      "targetNodeId": "00133746-c0e1-4ab3-a7d4-e8c1741c3b00",
      "condition": "1",
      "label": "Yes"
    },
    {
      "id": "b2ebbff5-fa7e-4873-91bb-512c62545828",
      "sourceNodeId": "a09b2731-d20e-4d1c-a14c-ac8112d74254",
      "targetNodeId": "032a4b9e-302c-473d-8993-cf7e8e234020",
      "condition": "1",
      "label": "Inside the U.S. "
    }
  ]
}
```
