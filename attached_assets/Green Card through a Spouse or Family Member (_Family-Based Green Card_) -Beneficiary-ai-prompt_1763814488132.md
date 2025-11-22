# Flow: Green Card through a Spouse or Family Member ("Family-Based Green Card") -Beneficiary

## 📋 Flow Metadata

- **Flow ID**: green-card-through-a-spouse-or-family-member-("family-based-green-card")--beneficiary
- **Version**: 1.0
- **Total Screens**: 19
- **Total Connections**: 21
- **Estimated Completion Time**: 10 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 19 screens and 21 connections.
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

#### 1. 🚀 Start - `1569431c-a550-4fbb-bd1b-373f0c3f10c1`

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

#### 2. ☑️ Multiple Choice - `e2f35ff4-20a0-4084-b543-9dac5f147357`

**Type**: Multiple Choice Question
**Question**: What is your relationship to the person who is sponsoring you?
Select the option that best describes your relationship.
**Options** (6):
  1. "Spouse – The person sponsoring me is my husband or wife" (id: `1`)
  2. "Parent – The person sponsoring me is my parent" (id: `2`)
  3. "Child – The person sponsoring me is my adult child (21 or older)" (id: `1763574163780`)
  4. "Sibling – The person sponsoring me is my brother or sister" (id: `1763574174234`)
  5. "Stepparent / Stepchild – The person sponsoring me is my stepparent or stepchild" (id: `1763574183971`)
  6. "Other / Not sure" (id: `1763574192747`)

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

#### 3. ❓ Yes/No Question - `5b06726c-a332-4dea-abf5-992dec2f4c86`

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

#### 4. ✍️ Text Input - `c4969cc7-afbd-4271-b3b8-4f73a92aa209`

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

#### 5. ☑️ Multiple Choice - `948101f2-3639-4edf-8911-41acd2e5e30b`

**Type**: Multiple Choice Question
**Question**: What is the current U.S. immigration status of the person sponsoring you?
(Select one)
**Options** (3):
  1. "U.S. Citizen" (id: `1`)
  2. "Green Card Holder (Lawful Permanent Resident) " (id: `2`)
  3. "Not sure" (id: `1763574559466`)

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

#### 6. ☑️ Multiple Choice - `61598395-edfa-4506-a4c0-59576d4875b0`

**Type**: Multiple Choice Question
**Question**: Has the person sponsoring you ever sponsored you before?
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No " (id: `2`)
  3. "Not sure" (id: `1763574993299`)

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

#### 7. ☑️ Multiple Choice - `df2e9059-0fdf-4633-ba03-3ac59ce6f82b`

**Type**: Multiple Choice Question
**Question**: Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? 
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No " (id: `2`)
  3. "Not sure" (id: `1763575029401`)

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

#### 8. ☑️ Multiple Choice - `b0fa0311-926d-403e-b405-ec5899d740b8`

**Type**: Multiple Choice Question
**Question**: Where are you currently located?
**Options** (2):
  1. "Inside the U.S." (id: `1`)
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

#### 9. ✍️ Text Input - `d4327926-ffb2-457b-805d-37b462714b53`

**Type**: Text Input Question
**Question**: Please briefly explain what type of immigration benefit you applied for.
(Example: visitor visa, employment visa, student visa, J1, etc) 

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

#### 10. ☑️ Multiple Choice - `0f505ae0-a5e1-4af2-bc81-1756a9eabac0`

**Type**: Multiple Choice Question
**Question**: If you are currently in the U.S., when you entered  were you inspected by a U.S. border officer (CBP)?
**Options** (2):
  1. "Yes - I was inspected and admitted " (id: `1`)
  2. "No - I entered without being inspected" (id: `2`)

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

#### 11. ☑️ Multiple Choice - `b7442cac-81a8-4cf5-9faf-af1f505ad364`

**Type**: Multiple Choice Question
**Question**: If you entered the U.S. without being inspected by a U.S. border officer (CBP), how many times did this happen? 
**Options** (3):
  1. "Once" (id: `1`)
  2. "More than once" (id: `2`)
  3. "Not sure" (id: `1763575584949`)

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

#### 12. ☑️ Multiple Choice - `c42c130e-e775-4c8f-bfc9-4ef5510d45ce`

**Type**: Multiple Choice Question
**Question**: How did you enter the United States?
(Choose the option that best describes your entry.)
**Options** (5):
  1. "Tourist Visa (B1/B2 visa) " (id: `1`)
  2. "Student Visa (F-1 visa)" (id: `2`)
  3. "Employment Visa " (id: `1763575663852`)
  4. "J1 visa " (id: `1763575666919`)
  5. "Other / not sure" (id: `1763575668889`)

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

#### 13. ☑️ Multiple Choice - `15a60db1-14ed-4975-b7c8-f55fdd58b893`

**Type**: Multiple Choice Question
**Question**: Have you ever stayed in the U.S. longer than you were allowed to stay or violated the terms of your visa? 

(This means staying past the date on your I-94 or working without permission or doing anything your visa does not allow). 
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)
  3. "Not sure" (id: `1763575778781`)

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

#### 14. ☑️ Multiple Choice - `ba6b571e-3b8a-4900-b038-e55f92aa432d`

**Type**: Multiple Choice Question
**Question**: Have you ever been in immigration court or removal proceedings? 
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)
  3. "Not sure" (id: `1763575837010`)

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

#### 15. ☑️ Multiple Choice - `8b398f42-72a5-4b64-b966-1c9360b54d39`

**Type**: Multiple Choice Question
**Question**: Are you currently married or have you been married in the past? 
**Options** (3):
  1. "No, never married" (id: `1`)
  2. "Yes, married before - ended in divorce, annulment or spouse passed away" (id: `2`)
  3. "Yes, currently married" (id: `1763575905349`)

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

#### 16. ✅ End - `172cf319-593d-490a-9f72-284b1a6ef91d`

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

#### 17. ✍️ Text Input - `2ac300ef-d26a-4e8c-825d-ea7df4137f7f`

**Type**: Text Input Question
**Question**: If you were sponsored before, can you briefly explain the situation?

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

#### 18. ☑️ Multiple Choice - `ed102908-c4d1-4b49-8d64-e39e531eb988`

**Type**: Multiple Choice Question
**Question**: Have you ever committed a crime or offense that might make you ineligible for a U.S. immigration benefit?
**Options** (3):
  1. "Yes" (id: `1`)
  2. "No" (id: `2`)
  3. "Not sure" (id: `1763576259927`)

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

#### 19. ✍️ Text Input - `6846c281-2521-4e8e-bbc6-bdbc9121c6d1`

**Type**: Text Input Question
**Question**: If yes, please briefly explain what happened: 

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
1. **From**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **To**: This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, or child). Based on your answer, you may not be applying for a family petition. 

We can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

2. **From**: Start
   **To**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?
   **To**: What is your relationship to the person who is sponsoring you?
Select the option that best describes your relationship.
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

4. **From**: Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? 
   **To**: Please briefly explain what type of immigration benefit you applied for.
(Example: visitor visa, employment visa, student visa, J1, etc) 
   **Condition**: Yes
   **Description**: Proceeds when user selects "Yes"

5. **From**: Please briefly explain what type of immigration benefit you applied for.
(Example: visitor visa, employment visa, student visa, J1, etc) 
   **To**: Where are you currently located?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

6. **From**: Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? 
   **To**: Where are you currently located?
   **Condition**: No 
   **Description**: Proceeds when user selects "No "

7. **From**: Has the person sponsoring you ever sponsored you before?
   **To**: Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

8. **From**: What is the current U.S. immigration status of the person sponsoring you?
(Select one)
   **To**: Has the person sponsoring you ever sponsored you before?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

9. **From**: What is your relationship to the person who is sponsoring you?
Select the option that best describes your relationship.
   **To**: What is the current U.S. immigration status of the person sponsoring you?
(Select one)
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: Where are you currently located?
   **To**: If you are currently in the U.S., when you entered  were you inspected by a U.S. border officer (CBP)?
   **Condition**: Inside the U.S.
   **Description**: Proceeds when user selects "Inside the U.S."

11. **From**: If you are currently in the U.S., when you entered  were you inspected by a U.S. border officer (CBP)?
   **To**: If you entered the U.S. without being inspected by a U.S. border officer (CBP), how many times did this happen? 
   **Condition**: No - I entered without being inspected
   **Description**: Proceeds when user selects "No - I entered without being inspected"

12. **From**: If you are currently in the U.S., when you entered  were you inspected by a U.S. border officer (CBP)?
   **To**: How did you enter the United States?
(Choose the option that best describes your entry.)
   **Condition**: Yes - I was inspected and admitted 
   **Description**: Proceeds when user selects "Yes - I was inspected and admitted "

13. **From**: How did you enter the United States?
(Choose the option that best describes your entry.)
   **To**: Have you ever stayed in the U.S. longer than you were allowed to stay or violated the terms of your visa? 

(This means staying past the date on your I-94 or working without permission or doing anything your visa does not allow). 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

14. **From**: Have you ever stayed in the U.S. longer than you were allowed to stay or violated the terms of your visa? 

(This means staying past the date on your I-94 or working without permission or doing anything your visa does not allow). 
   **To**: Have you ever been in immigration court or removal proceedings? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

15. **From**: Have you ever been in immigration court or removal proceedings? 
   **To**: Are you currently married or have you been married in the past? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

16. **From**: Has the person sponsoring you ever sponsored you before?
   **To**: If you were sponsored before, can you briefly explain the situation?
   **Condition**: Yes
   **Description**: Proceeds when user selects "Yes"

17. **From**: If you were sponsored before, can you briefly explain the situation?
   **To**: Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

18. **From**: Where are you currently located?
   **To**: Have you ever been in immigration court or removal proceedings? 
   **Condition**: Outside the U.S.
   **Description**: Proceeds when user selects "Outside the U.S."

19. **From**: Are you currently married or have you been married in the past? 
   **To**: Have you ever committed a crime or offense that might make you ineligible for a U.S. immigration benefit?
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

20. **From**: Have you ever committed a crime or offense that might make you ineligible for a U.S. immigration benefit?
   **To**: If yes, please briefly explain what happened: 
   **Condition**: Yes
   **Description**: Proceeds when user selects "Yes"

21. **From**: If yes, please briefly explain what happened: 
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
  flowId: "green-card-through-a-spouse-or-family-member-("family-based-green-card")--beneficiary",
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
  "1569431c-a550-4fbb-bd1b-373f0c3f10c1": { "started": true, "timestamp": "ISO-8601" },
  "e2f35ff4-20a0-4084-b543-9dac5f147357": "option-id",
  "5b06726c-a332-4dea-abf5-992dec2f4c86": "yes" | "no",
  "c4969cc7-afbd-4271-b3b8-4f73a92aa209": "user text input",
  "948101f2-3639-4edf-8911-41acd2e5e30b": "option-id",
  "61598395-edfa-4506-a4c0-59576d4875b0": "option-id",
  "df2e9059-0fdf-4633-ba03-3ac59ce6f82b": "option-id",
  "b0fa0311-926d-403e-b405-ec5899d740b8": "option-id",
  "d4327926-ffb2-457b-805d-37b462714b53": "user text input",
  "0f505ae0-a5e1-4af2-bc81-1756a9eabac0": "option-id",
  "b7442cac-81a8-4cf5-9faf-af1f505ad364": "option-id",
  "c42c130e-e775-4c8f-bfc9-4ef5510d45ce": "option-id",
  "15a60db1-14ed-4975-b7c8-f55fdd58b893": "option-id",
  "ba6b571e-3b8a-4900-b038-e55f92aa432d": "option-id",
  "8b398f42-72a5-4b64-b966-1c9360b54d39": "option-id",
  "172cf319-593d-490a-9f72-284b1a6ef91d": { "additionalInfo": "optional text", "completed": true },
  "2ac300ef-d26a-4e8c-825d-ea7df4137f7f": "user text input",
  "ed102908-c4d1-4b49-8d64-e39e531eb988": "option-id",
  "6846c281-2521-4e8e-bbc6-bdbc9121c6d1": "user text input"
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
  "name": "Green Card through a Spouse or Family Member (\"Family-Based Green Card\") -Beneficiary",
  "description": "",
  "nodes": [
    {
      "id": "1569431c-a550-4fbb-bd1b-373f0c3f10c1",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 248.399526714136,
        "y": 122.406626002097
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
      "id": "e2f35ff4-20a0-4084-b543-9dac5f147357",
      "type": "multiple-choice",
      "question": "What is your relationship to the person who is sponsoring you?\nSelect the option that best describes your relationship.",
      "options": [
        {
          "id": "1",
          "label": "Spouse – The person sponsoring me is my husband or wife"
        },
        {
          "id": "2",
          "label": "Parent – The person sponsoring me is my parent"
        },
        {
          "id": "1763574163780",
          "label": "Child – The person sponsoring me is my adult child (21 or older)"
        },
        {
          "id": "1763574174234",
          "label": "Sibling – The person sponsoring me is my brother or sister"
        },
        {
          "id": "1763574183971",
          "label": "Stepparent / Stepchild – The person sponsoring me is my stepparent or stepchild"
        },
        {
          "id": "1763574192747",
          "label": "Other / Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 935.29952345355,
        "y": 71.8717041262278
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
      "id": "5b06726c-a332-4dea-abf5-992dec2f4c86",
      "type": "yes-no",
      "question": "Great! This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, sibling or child). Is that your situation?",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 576.132127955494,
        "y": 101.576077885953
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
      "id": "c4969cc7-afbd-4271-b3b8-4f73a92aa209",
      "type": "text",
      "question": "This is for people getting a green card through a U.S. citizen or lawful permanent resident family member (like a spouse, parent, or child). Based on your answer, you may not be applying for a family petition. \n\nWe can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 578.21993435432,
        "y": 211.905818512426
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
      "id": "948101f2-3639-4edf-8911-41acd2e5e30b",
      "type": "multiple-choice",
      "question": "What is the current U.S. immigration status of the person sponsoring you?\n(Select one)",
      "options": [
        {
          "id": "1",
          "label": "U.S. Citizen"
        },
        {
          "id": "2",
          "label": "Green Card Holder (Lawful Permanent Resident) "
        },
        {
          "id": "1763574559466",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1301.3252551294,
        "y": 84.1039659657295
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
      "id": "61598395-edfa-4506-a4c0-59576d4875b0",
      "type": "multiple-choice",
      "question": "Has the person sponsoring you ever sponsored you before?",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No "
        },
        {
          "id": "1763574993299",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1648.10688538509,
        "y": 82.6805174776467
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
      "id": "df2e9059-0fdf-4633-ba03-3ac59ce6f82b",
      "type": "multiple-choice",
      "question": "Have you ever applied for any U.S. immigration benefit (such as a visa or a green card)? ",
      "options": [
        {
          "id": "1",
          "label": "Yes"
        },
        {
          "id": "2",
          "label": "No "
        },
        {
          "id": "1763575029401",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1997.91558958318,
        "y": 87.8086397383473
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
      "id": "b0fa0311-926d-403e-b405-ec5899d740b8",
      "type": "multiple-choice",
      "question": "Where are you currently located?",
      "options": [
        {
          "id": "1",
          "label": "Inside the U.S."
        },
        {
          "id": "2",
          "label": "Outside the U.S."
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2363.45866119901,
        "y": 120.120287114074
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
      "id": "d4327926-ffb2-457b-805d-37b462714b53",
      "type": "text",
      "question": "Please briefly explain what type of immigration benefit you applied for.\n(Example: visitor visa, employment visa, student visa, J1, etc) ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2028.57714349501,
        "y": 323.609588303343
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
      "id": "0f505ae0-a5e1-4af2-bc81-1756a9eabac0",
      "type": "multiple-choice",
      "question": "If you are currently in the U.S., when you entered  were you inspected by a U.S. border officer (CBP)?",
      "options": [
        {
          "id": "1",
          "label": "Yes - I was inspected and admitted "
        },
        {
          "id": "2",
          "label": "No - I entered without being inspected"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2686.85610580302,
        "y": -55.4864921018319
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
      "id": "b7442cac-81a8-4cf5-9faf-af1f505ad364",
      "type": "multiple-choice",
      "question": "If you entered the U.S. without being inspected by a U.S. border officer (CBP), how many times did this happen? ",
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
          "id": "1763575584949",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2733.21629551602,
        "y": 153.836788723528
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
      "id": "c42c130e-e775-4c8f-bfc9-4ef5510d45ce",
      "type": "multiple-choice",
      "question": "How did you enter the United States?\n(Choose the option that best describes your entry.)",
      "options": [
        {
          "id": "1",
          "label": "Tourist Visa (B1/B2 visa) "
        },
        {
          "id": "2",
          "label": "Student Visa (F-1 visa)"
        },
        {
          "id": "1763575663852",
          "label": "Employment Visa "
        },
        {
          "id": "1763575666919",
          "label": "J1 visa "
        },
        {
          "id": "1763575668889",
          "label": "Other / not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 3078.52946616617,
        "y": -54.0816378681047
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
      "id": "15a60db1-14ed-4975-b7c8-f55fdd58b893",
      "type": "multiple-choice",
      "question": "Have you ever stayed in the U.S. longer than you were allowed to stay or violated the terms of your visa? \n\n(This means staying past the date on your I-94 or working without permission or doing anything your visa does not allow). ",
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
          "id": "1763575778781",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 3434.8004998394,
        "y": -92.0127021787404
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
      "id": "ba6b571e-3b8a-4900-b038-e55f92aa432d",
      "type": "multiple-choice",
      "question": "Have you ever been in immigration court or removal proceedings? ",
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
          "id": "1763575837010",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 3786.01405827121,
        "y": -94.8224106461949
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
      "id": "8b398f42-72a5-4b64-b966-1c9360b54d39",
      "type": "multiple-choice",
      "question": "Are you currently married or have you been married in the past? ",
      "options": [
        {
          "id": "1",
          "label": "No, never married"
        },
        {
          "id": "2",
          "label": "Yes, married before - ended in divorce, annulment or spouse passed away"
        },
        {
          "id": "1763575905349",
          "label": "Yes, currently married"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 4183.02586472254,
        "y": -87.7981394775586
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
      "id": "172cf319-593d-490a-9f72-284b1a6ef91d",
      "type": "end",
      "question": "End",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 4913.38605443553,
        "y": -53.867075166923
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
      "id": "2ac300ef-d26a-4e8c-825d-ea7df4137f7f",
      "type": "text",
      "question": "If you were sponsored before, can you briefly explain the situation?",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1645.69279057484,
        "y": 325.393588828574
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
      "id": "ed102908-c4d1-4b49-8d64-e39e531eb988",
      "type": "multiple-choice",
      "question": "Have you ever committed a crime or offense that might make you ineligible for a U.S. immigration benefit?",
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
          "id": "1763576259927",
          "label": "Not sure"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 4531.69279057484,
        "y": -88.606411171426
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
      "id": "6846c281-2521-4e8e-bbc6-bdbc9121c6d1",
      "type": "text",
      "question": "If yes, please briefly explain what happened: ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 4523.69279057484,
        "y": 151.393588828574
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
      "id": "479f7bc8-88ba-45aa-bd6f-aeceacb88e77",
      "sourceNodeId": "5b06726c-a332-4dea-abf5-992dec2f4c86",
      "targetNodeId": "c4969cc7-afbd-4271-b3b8-4f73a92aa209",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "4d29e999-ae57-4d58-acd9-dde790dc1d99",
      "sourceNodeId": "1569431c-a550-4fbb-bd1b-373f0c3f10c1",
      "targetNodeId": "5b06726c-a332-4dea-abf5-992dec2f4c86",
      "condition": "any"
    },
    {
      "id": "62e5c397-ebde-496b-a685-17787ca04a71",
      "sourceNodeId": "5b06726c-a332-4dea-abf5-992dec2f4c86",
      "targetNodeId": "e2f35ff4-20a0-4084-b543-9dac5f147357",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "09708b8a-df9f-41d7-9bee-258ac8434565",
      "sourceNodeId": "df2e9059-0fdf-4633-ba03-3ac59ce6f82b",
      "targetNodeId": "d4327926-ffb2-457b-805d-37b462714b53",
      "condition": "1",
      "label": "Yes"
    },
    {
      "id": "a5e91c8a-7d76-4836-b3f2-4be2bb1aa34f",
      "sourceNodeId": "d4327926-ffb2-457b-805d-37b462714b53",
      "targetNodeId": "b0fa0311-926d-403e-b405-ec5899d740b8",
      "condition": "any"
    },
    {
      "id": "c8c1ad3d-4098-4581-a28a-5e334ae8f8e6",
      "sourceNodeId": "df2e9059-0fdf-4633-ba03-3ac59ce6f82b",
      "targetNodeId": "b0fa0311-926d-403e-b405-ec5899d740b8",
      "condition": "2",
      "label": "No "
    },
    {
      "id": "2591bf6c-d6fa-4a36-bcd0-184cb4832c9e",
      "sourceNodeId": "61598395-edfa-4506-a4c0-59576d4875b0",
      "targetNodeId": "df2e9059-0fdf-4633-ba03-3ac59ce6f82b",
      "condition": "any"
    },
    {
      "id": "d4344491-b873-4ce8-8e51-b0e36c3b1462",
      "sourceNodeId": "948101f2-3639-4edf-8911-41acd2e5e30b",
      "targetNodeId": "61598395-edfa-4506-a4c0-59576d4875b0",
      "condition": "any"
    },
    {
      "id": "ca4691a3-2e66-41e9-a909-f2e8b59d92a7",
      "sourceNodeId": "e2f35ff4-20a0-4084-b543-9dac5f147357",
      "targetNodeId": "948101f2-3639-4edf-8911-41acd2e5e30b",
      "condition": "any"
    },
    {
      "id": "89db9610-116c-4d92-852f-d2c4255ed628",
      "sourceNodeId": "b0fa0311-926d-403e-b405-ec5899d740b8",
      "targetNodeId": "0f505ae0-a5e1-4af2-bc81-1756a9eabac0",
      "condition": "1",
      "label": "Inside the U.S."
    },
    {
      "id": "23e7535e-380d-4787-9538-1d728dfcc928",
      "sourceNodeId": "0f505ae0-a5e1-4af2-bc81-1756a9eabac0",
      "targetNodeId": "b7442cac-81a8-4cf5-9faf-af1f505ad364",
      "condition": "2",
      "label": "No - I entered without being inspected"
    },
    {
      "id": "c657126a-da19-48cf-be6d-0d039d0c7d43",
      "sourceNodeId": "0f505ae0-a5e1-4af2-bc81-1756a9eabac0",
      "targetNodeId": "c42c130e-e775-4c8f-bfc9-4ef5510d45ce",
      "condition": "1",
      "label": "Yes - I was inspected and admitted "
    },
    {
      "id": "3eade256-0a44-44c1-81b3-132777058aa5",
      "sourceNodeId": "c42c130e-e775-4c8f-bfc9-4ef5510d45ce",
      "targetNodeId": "15a60db1-14ed-4975-b7c8-f55fdd58b893",
      "condition": "any"
    },
    {
      "id": "cee9d096-b860-42de-89f1-51dd6b4808c6",
      "sourceNodeId": "15a60db1-14ed-4975-b7c8-f55fdd58b893",
      "targetNodeId": "ba6b571e-3b8a-4900-b038-e55f92aa432d",
      "condition": "any"
    },
    {
      "id": "10a9c5e5-9638-4f24-ab23-ce07a99cf7b3",
      "sourceNodeId": "ba6b571e-3b8a-4900-b038-e55f92aa432d",
      "targetNodeId": "8b398f42-72a5-4b64-b966-1c9360b54d39",
      "condition": "any"
    },
    {
      "id": "692f1c89-6c91-4fba-a0f8-f446820126ef",
      "sourceNodeId": "61598395-edfa-4506-a4c0-59576d4875b0",
      "targetNodeId": "2ac300ef-d26a-4e8c-825d-ea7df4137f7f",
      "condition": "1",
      "label": "Yes"
    },
    {
      "id": "66e05d3a-6dc7-4de0-aa6e-d184a227c3f3",
      "sourceNodeId": "2ac300ef-d26a-4e8c-825d-ea7df4137f7f",
      "targetNodeId": "df2e9059-0fdf-4633-ba03-3ac59ce6f82b",
      "condition": "any"
    },
    {
      "id": "7c8bde08-ab2b-47a8-a933-dd7c18f4577c",
      "sourceNodeId": "b0fa0311-926d-403e-b405-ec5899d740b8",
      "targetNodeId": "ba6b571e-3b8a-4900-b038-e55f92aa432d",
      "condition": "2",
      "label": "Outside the U.S."
    },
    {
      "id": "6f2a78be-b2e0-4831-b6da-f36ca7529148",
      "sourceNodeId": "8b398f42-72a5-4b64-b966-1c9360b54d39",
      "targetNodeId": "ed102908-c4d1-4b49-8d64-e39e531eb988",
      "condition": "any"
    },
    {
      "id": "f0233851-341e-4ea0-88a5-5bdcf819367e",
      "sourceNodeId": "ed102908-c4d1-4b49-8d64-e39e531eb988",
      "targetNodeId": "6846c281-2521-4e8e-bbc6-bdbc9121c6d1",
      "condition": "1",
      "label": "Yes"
    },
    {
      "id": "5bfa2dc0-e2c0-42ac-8ecb-344548e1f16c",
      "sourceNodeId": "6846c281-2521-4e8e-bbc6-bdbc9121c6d1",
      "targetNodeId": "172cf319-593d-490a-9f72-284b1a6ef91d",
      "condition": "any"
    }
  ]
}
```
