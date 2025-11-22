# Flow: U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen

## 📋 Flow Metadata

- **Flow ID**: u.s.-citizenship-("naturalization")---applying-to-become-a-u.s.-citizen
- **Version**: 1.0
- **Total Screens**: 20
- **Total Connections**: 31
- **Estimated Completion Time**: 10 minutes
- **Created**: 2025-11-22

## 📝 Flow Overview

This document describes a conversational flow with 20 screens and 31 connections.
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

#### 1. 🚀 Start - `e13b551d-234d-46a9-98ce-fbc16c0085ab`

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

#### 2. ❓ Yes/No Question - `e6e1c3ef-61f7-4c2c-a1c1-e329628fc395`

**Type**: Yes/No Question
**Question**: Are you applying to become a U.S. citizen (naturalization)? 
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

#### 3. ✍️ Text Input - `c3214df7-363b-4709-91a4-17b840fa84a2`

**Type**: Text Input Question
**Question**: U.S. citizenship (naturalization) is for green card holders who meet certain requirements. Based on your answer, you may not be applying for citizenship.

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

#### 4. ☑️ Multiple Choice - `c7b1d6b6-d437-4d31-98e8-b3601b83e6dd`

**Type**: Multiple Choice Question
**Question**: How did you obtain your green card? Please select the option that best applies. 
**Options** (5):
  1. "Marriage to a U.S. citizen or green card holder" (id: `1`)
  2. "Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)" (id: `2`)
  3. "Employment " (id: `1763265490668`)
  4. "Asylum" (id: `1763265490860`)
  5. "Other / Not sure " (id: `1763265525359`)

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

#### 5. ☑️ Multiple Choice - `eb750c94-d51c-43d7-a0d1-e7beb37d1852`

**Type**: Multiple Choice Question
**Question**: Was your green card based on marriage to a:
**Options** (2):
  1. "U.S. citizen spouse" (id: `1`)
  2. "Lawful permanent resident (green card) spouse" (id: `2`)

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

#### 6. ☑️ Multiple Choice - `6e8bf088-9189-4dd2-989c-a78ab8096659`

**Type**: Multiple Choice Question
**Question**: Are you still married to the same U.S. citizen spouse who sponsored you? 
**Options** (3):
  1. "Yes, living together" (id: `1`)
  2. "Yes, but not living together" (id: `2`)
  3. "No, divorced or separated " (id: `1763265902604`)

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

#### 7. ❓ Yes/No Question - `74394955-df3d-46f8-8bc2-d064eabcafd2`

**Type**: Yes/No Question
**Question**: In the last 5 years, have you lived in the U.S. at least half the time
**Yes Label**: "Yes"
**No Label**: "No / Not Yet"

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
    No / Not Yet
  </Button>
</div>
```

#### 8. ❓ Yes/No Question - `0a6d1679-7262-4685-8d98-301b1ddec6bd`

**Type**: Yes/No Question
**Question**: In the last 5 years, have you lived in the U.S. at least half the time
**Yes Label**: "Yes"
**No Label**: "No / Not Yet "

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
    No / Not Yet 
  </Button>
</div>
```

#### 9. ❓ Yes/No Question - `1ce1b136-5e0d-4524-8620-9040eb5bf71a`

**Type**: Yes/No Question
**Question**: In the last 5 years, have you lived in the U.S. at least half the time
**Yes Label**: "Yes"
**No Label**: "No / Not Yet "

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
    No / Not Yet 
  </Button>
</div>
```

#### 10. ❓ Yes/No Question - `d57de77f-b3b8-4702-94e5-b8c1b4a72abf`

**Type**: Yes/No Question
**Question**: In the last 5 years, have you lived in the U.S. at least half the time
**Yes Label**: "Yes"
**No Label**: "No / Not Yet "

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
    No / Not Yet 
  </Button>
</div>
```

#### 11. ✍️ Text Input - `d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac`

**Type**: Text Input Question
**Question**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 

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

#### 12. ❓ Yes/No Question - `bc27582e-31fe-40cb-9cba-5b93c30d16c3`

**Type**: Yes/No Question
**Question**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
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

#### 13. ❓ Yes/No Question - `b38404ed-6742-45fc-8ff4-f7943c9522af`

**Type**: Yes/No Question
**Question**: If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time (a year and a half)? 
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

#### 14. ❓ Yes/No Question - `cbee61db-3b66-4fe2-bcd5-15e115ae5dd6`

**Type**: Yes/No Question
**Question**: For the last 3 years, have you and your spouse lived together in the same home? 
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

#### 15. ☑️ Multiple Choice - `9dc67065-aff8-4ddd-a10b-bfabbba1851c`

**Type**: Multiple Choice Question
**Question**: How did your spouse become a U.S. citizen? 
**Options** (2):
  1. "Born in the U.S. " (id: `1`)
  2. "Became a U.S. citizen through naturalization" (id: `2`)

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

#### 16. ✍️ Text Input - `05f9415c-ce25-426f-87dc-e45bbb9d90f5`

**Type**: Text Input Question
**Question**: If your spouse became a U.S. citizen through naturalization, please give the month and year or your best estimate if you're not sure. 

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

#### 17. ❓ Yes/No Question - `b10eaa00-d288-45f8-ae79-6f46ead37c4e`

**Type**: Yes/No Question
**Question**: Since receiving your green card, have you done anything that might affect your eligibility for U.S. citizenship, such as being convicted of a crime ( for example DUI, or theft), falsely claiming U.S. citizenship, etc? 
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

#### 18. ✍️ Text Input - `94b9a5fa-c4b9-436c-9229-2e7057ed6bf8`

**Type**: Text Input Question
**Question**: If yes, please explain. 

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

#### 19. ✅ End - `5ddaac05-39c0-4a29-8d0f-42513d4d67d2`

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

#### 20. ✍️ Text Input - `10dac275-d4d0-4394-8a4a-fbce5e50216c`

**Type**: Text Input Question
**Question**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 

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
1. **From**: Are you applying to become a U.S. citizen (naturalization)? 
   **To**: U.S. citizenship (naturalization) is for green card holders who meet certain requirements. Based on your answer, you may not be applying for citizenship.

We can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.

   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

2. **From**: Start
   **To**: Are you applying to become a U.S. citizen (naturalization)? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

3. **From**: Are you applying to become a U.S. citizen (naturalization)? 
   **To**: How did you obtain your green card? Please select the option that best applies. 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

4. **From**: How did you obtain your green card? Please select the option that best applies. 
   **To**: Was your green card based on marriage to a:
   **Condition**: Marriage to a U.S. citizen or green card holder
   **Description**: Proceeds when user selects "Marriage to a U.S. citizen or green card holder"

5. **From**: How did you obtain your green card? Please select the option that best applies. 
   **To**: In the last 5 years, have you lived in the U.S. at least half the time
   **Condition**: Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)
   **Description**: Proceeds when user selects "Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)"

6. **From**: How did you obtain your green card? Please select the option that best applies. 
   **To**: In the last 5 years, have you lived in the U.S. at least half the time
   **Condition**: Employment 
   **Description**: Proceeds when user selects "Employment "

7. **From**: How did you obtain your green card? Please select the option that best applies. 
   **To**: In the last 5 years, have you lived in the U.S. at least half the time
   **Condition**: Asylum
   **Description**: Proceeds when user selects "Asylum"

8. **From**: How did you obtain your green card? Please select the option that best applies. 
   **To**: In the last 5 years, have you lived in the U.S. at least half the time
   **Condition**: Other / Not sure 
   **Description**: Proceeds when user selects "Other / Not sure "

9. **From**: In the last 5 years, have you lived in the U.S. at least half the time
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

10. **From**: In the last 5 years, have you lived in the U.S. at least half the time
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

11. **From**: In the last 5 years, have you lived in the U.S. at least half the time
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

12. **From**: In the last 5 years, have you lived in the U.S. at least half the time
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

13. **From**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **To**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

14. **From**: Since receiving your green card, have you done anything that might affect your eligibility for U.S. citizenship, such as being convicted of a crime ( for example DUI, or theft), falsely claiming U.S. citizenship, etc? 
   **To**: If yes, please explain. 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

15. **From**: Are you still married to the same U.S. citizen spouse who sponsored you? 
   **To**: For the last 3 years, have you and your spouse lived together in the same home? 
   **Condition**: Yes, living together
   **Description**: Proceeds when user selects "Yes, living together"

16. **From**: How did your spouse become a U.S. citizen? 
   **To**: If your spouse became a U.S. citizen through naturalization, please give the month and year or your best estimate if you're not sure. 
   **Condition**: Became a U.S. citizen through naturalization
   **Description**: Proceeds when user selects "Became a U.S. citizen through naturalization"

17. **From**: How did your spouse become a U.S. citizen? 
   **To**: Are you still married to the same U.S. citizen spouse who sponsored you? 
   **Condition**: Born in the U.S. 
   **Description**: Proceeds when user selects "Born in the U.S. "

18. **From**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
   **To**: Since receiving your green card, have you done anything that might affect your eligibility for U.S. citizenship, such as being convicted of a crime ( for example DUI, or theft), falsely claiming U.S. citizenship, etc? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

19. **From**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **To**: For the last 3 years, have you and your spouse lived together in the same home? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

20. **From**: For the last 3 years, have you and your spouse lived together in the same home? 
   **To**: If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time (a year and a half)? 
   **Condition**: Yes
   **Description**: Proceeds only when user clicks "Yes" button

21. **From**: For the last 3 years, have you and your spouse lived together in the same home? 
   **To**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
   **Condition**: No
   **Description**: Proceeds only when user clicks "No" button

22. **From**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
   **To**: If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time (a year and a half)? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

23. **From**: Since receiving your green card, have you done anything that might affect your eligibility for U.S. citizenship, such as being convicted of a crime ( for example DUI, or theft), falsely claiming U.S. citizenship, etc? 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

24. **From**: If yes, please explain. 
   **To**: End
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

25. **From**: Was your green card based on marriage to a:
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Lawful permanent resident (green card) spouse
   **Description**: Proceeds when user selects "Lawful permanent resident (green card) spouse"

26. **From**: Are you still married to the same U.S. citizen spouse who sponsored you? 
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Yes, but not living together
   **Description**: Proceeds when user selects "Yes, but not living together"

27. **From**: Are you still married to the same U.S. citizen spouse who sponsored you? 
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: No, divorced or separated 
   **Description**: Proceeds when user selects "No, divorced or separated "

28. **From**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **To**: Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

29. **From**: If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time (a year and a half)? 
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

30. **From**: If your spouse became a U.S. citizen through naturalization, please give the month and year or your best estimate if you're not sure. 
   **To**: What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. 
   **Condition**: Any user action (bypass)
   **Description**: Proceeds on any user action (bypass condition)

31. **From**: Was your green card based on marriage to a:
   **To**: How did your spouse become a U.S. citizen? 
   **Condition**: U.S. citizen spouse
   **Description**: Proceeds when user selects "U.S. citizen spouse"


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
  flowId: "u.s.-citizenship-("naturalization")---applying-to-become-a-u.s.-citizen",
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
  "e13b551d-234d-46a9-98ce-fbc16c0085ab": { "started": true, "timestamp": "ISO-8601" },
  "e6e1c3ef-61f7-4c2c-a1c1-e329628fc395": "yes" | "no",
  "c3214df7-363b-4709-91a4-17b840fa84a2": "user text input",
  "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd": "option-id",
  "eb750c94-d51c-43d7-a0d1-e7beb37d1852": "option-id",
  "6e8bf088-9189-4dd2-989c-a78ab8096659": "option-id",
  "74394955-df3d-46f8-8bc2-d064eabcafd2": "yes" | "no",
  "0a6d1679-7262-4685-8d98-301b1ddec6bd": "yes" | "no",
  "1ce1b136-5e0d-4524-8620-9040eb5bf71a": "yes" | "no",
  "d57de77f-b3b8-4702-94e5-b8c1b4a72abf": "yes" | "no",
  "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac": "user text input",
  "bc27582e-31fe-40cb-9cba-5b93c30d16c3": "yes" | "no",
  "b38404ed-6742-45fc-8ff4-f7943c9522af": "yes" | "no",
  "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6": "yes" | "no",
  "9dc67065-aff8-4ddd-a10b-bfabbba1851c": "option-id",
  "05f9415c-ce25-426f-87dc-e45bbb9d90f5": "user text input",
  "b10eaa00-d288-45f8-ae79-6f46ead37c4e": "yes" | "no",
  "94b9a5fa-c4b9-436c-9229-2e7057ed6bf8": "user text input",
  "5ddaac05-39c0-4a29-8d0f-42513d4d67d2": { "additionalInfo": "optional text", "completed": true },
  "10dac275-d4d0-4394-8a4a-fbce5e50216c": "user text input"
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
  "name": "U.S. Citizenship (\"Naturalization\") - Applying to become a U.S. Citizen",
  "description": "",
  "nodes": [
    {
      "id": "e13b551d-234d-46a9-98ce-fbc16c0085ab",
      "type": "start",
      "question": "Start",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -906,
        "y": -158
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
      "id": "e6e1c3ef-61f7-4c2c-a1c1-e329628fc395",
      "type": "yes-no",
      "question": "Are you applying to become a U.S. citizen (naturalization)? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -559.404354052763,
        "y": -156.62744046854
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
      "id": "c3214df7-363b-4709-91a4-17b840fa84a2",
      "type": "text",
      "question": "U.S. citizenship (naturalization) is for green card holders who meet certain requirements. Based on your answer, you may not be applying for citizenship.\n\nWe can still help! Your information can be sent to an immigration attorney in our network, who can review your situation and discuss other options.\n",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -560.9725568,
        "y": -9.77512960000001
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
      "id": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "type": "multiple-choice",
      "question": "How did you obtain your green card? Please select the option that best applies. ",
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
          "id": "1763265490668",
          "label": "Employment "
        },
        {
          "id": "1763265490860",
          "label": "Asylum"
        },
        {
          "id": "1763265525359",
          "label": "Other / Not sure "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": -156.9725568,
        "y": -183.7751296
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
      "id": "eb750c94-d51c-43d7-a0d1-e7beb37d1852",
      "type": "multiple-choice",
      "question": "Was your green card based on marriage to a:",
      "options": [
        {
          "id": "1",
          "label": "U.S. citizen spouse"
        },
        {
          "id": "2",
          "label": "Lawful permanent resident (green card) spouse"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 201.0274432,
        "y": -27.7751296
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
      "id": "6e8bf088-9189-4dd2-989c-a78ab8096659",
      "type": "multiple-choice",
      "question": "Are you still married to the same U.S. citizen spouse who sponsored you? ",
      "options": [
        {
          "id": "1",
          "label": "Yes, living together"
        },
        {
          "id": "2",
          "label": "Yes, but not living together"
        },
        {
          "id": "1763265902604",
          "label": "No, divorced or separated "
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 587.0274432,
        "y": 220.2248704
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
      "id": "74394955-df3d-46f8-8bc2-d064eabcafd2",
      "type": "yes-no",
      "question": "In the last 5 years, have you lived in the U.S. at least half the time",
      "options": null,
      "yesLabel": null,
      "noLabel": "No / Not Yet",
      "position": {
        "x": 189.0274432,
        "y": -399.7751296
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
      "id": "0a6d1679-7262-4685-8d98-301b1ddec6bd",
      "type": "yes-no",
      "question": "In the last 5 years, have you lived in the U.S. at least half the time",
      "options": null,
      "yesLabel": null,
      "noLabel": "No / Not Yet ",
      "position": {
        "x": 181.0274432,
        "y": -265.7751296
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
      "id": "1ce1b136-5e0d-4524-8620-9040eb5bf71a",
      "type": "yes-no",
      "question": "In the last 5 years, have you lived in the U.S. at least half the time",
      "options": null,
      "yesLabel": null,
      "noLabel": "No / Not Yet ",
      "position": {
        "x": 171.0274432,
        "y": -517.7751296
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
      "id": "d57de77f-b3b8-4702-94e5-b8c1b4a72abf",
      "type": "yes-no",
      "question": "In the last 5 years, have you lived in the U.S. at least half the time",
      "options": null,
      "yesLabel": null,
      "noLabel": "No / Not Yet ",
      "position": {
        "x": 171.0274432,
        "y": -641.7751296
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
      "id": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "type": "text",
      "question": "What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 959.0274432,
        "y": -447.7751296
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
      "id": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "type": "yes-no",
      "question": "Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1332.2274432,
        "y": -447.7751296
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
      "id": "b38404ed-6742-45fc-8ff4-f7943c9522af",
      "type": "yes-no",
      "question": "If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time (a year and a half)? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1378.2274432,
        "y": -195.7751296
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
      "id": "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6",
      "type": "yes-no",
      "question": "For the last 3 years, have you and your spouse lived together in the same home? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 938.2274432,
        "y": 130.2248704
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
      "id": "9dc67065-aff8-4ddd-a10b-bfabbba1851c",
      "type": "multiple-choice",
      "question": "How did your spouse become a U.S. citizen? ",
      "options": [
        {
          "id": "1",
          "label": "Born in the U.S. "
        },
        {
          "id": "2",
          "label": "Became a U.S. citizen through naturalization"
        }
      ],
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 594.1137216,
        "y": 15.2248704
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
      "id": "05f9415c-ce25-426f-87dc-e45bbb9d90f5",
      "type": "text",
      "question": "If your spouse became a U.S. citizen through naturalization, please give the month and year or your best estimate if you're not sure. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 976.1137216,
        "y": -20.7751296
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
      "id": "b10eaa00-d288-45f8-ae79-6f46ead37c4e",
      "type": "yes-no",
      "question": "Since receiving your green card, have you done anything that might affect your eligibility for U.S. citizenship, such as being convicted of a crime ( for example DUI, or theft), falsely claiming U.S. citizenship, etc? ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1682.1137216,
        "y": -464.7751296
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
      "id": "94b9a5fa-c4b9-436c-9229-2e7057ed6bf8",
      "type": "text",
      "question": "If yes, please explain. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1690.1137216,
        "y": -308.7751296
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
      "id": "5ddaac05-39c0-4a29-8d0f-42513d4d67d2",
      "type": "end",
      "question": "End",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 2080.9137216,
        "y": -352.7751296
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
      "id": "10dac275-d4d0-4394-8a4a-fbce5e50216c",
      "type": "text",
      "question": "What is the start date on your green card? If you're not sure, your best estimate of the month / year is fine. ",
      "options": null,
      "yesLabel": null,
      "noLabel": null,
      "position": {
        "x": 1012.4568608,
        "y": 369.4248704
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
      "id": "4f34c78e-4b14-42c5-9127-8ecc7d4f356c",
      "sourceNodeId": "e6e1c3ef-61f7-4c2c-a1c1-e329628fc395",
      "targetNodeId": "c3214df7-363b-4709-91a4-17b840fa84a2",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "7ed505e9-e5e8-4607-833d-d27db064786a",
      "sourceNodeId": "e13b551d-234d-46a9-98ce-fbc16c0085ab",
      "targetNodeId": "e6e1c3ef-61f7-4c2c-a1c1-e329628fc395",
      "condition": "any"
    },
    {
      "id": "3fe174e7-d4d5-4fcb-b443-b78ad4b16b34",
      "sourceNodeId": "e6e1c3ef-61f7-4c2c-a1c1-e329628fc395",
      "targetNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "53cf6446-76c7-464a-8dfa-14f7db01ed92",
      "sourceNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "targetNodeId": "eb750c94-d51c-43d7-a0d1-e7beb37d1852",
      "condition": "1",
      "label": "Marriage to a U.S. citizen or green card holder"
    },
    {
      "id": "dcf2397c-5aae-4fc8-9913-1d40de5485ce",
      "sourceNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "targetNodeId": "74394955-df3d-46f8-8bc2-d064eabcafd2",
      "condition": "2",
      "label": "Family (other than marriage, e.g. parent, sibling, adult child of U.S. citizen)"
    },
    {
      "id": "d5310dd7-2429-4cdb-94a4-d5510eb314c0",
      "sourceNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "targetNodeId": "0a6d1679-7262-4685-8d98-301b1ddec6bd",
      "condition": "1763265490668",
      "label": "Employment "
    },
    {
      "id": "0f8ccf97-db53-45e7-8e13-a248b9a9e6af",
      "sourceNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "targetNodeId": "1ce1b136-5e0d-4524-8620-9040eb5bf71a",
      "condition": "1763265490860",
      "label": "Asylum"
    },
    {
      "id": "0a10be04-73de-4c5e-8e0a-3355b5ed2adc",
      "sourceNodeId": "c7b1d6b6-d437-4d31-98e8-b3601b83e6dd",
      "targetNodeId": "d57de77f-b3b8-4702-94e5-b8c1b4a72abf",
      "condition": "1763265525359",
      "label": "Other / Not sure "
    },
    {
      "id": "44ee8349-a2a9-4544-9af8-ec5074846400",
      "sourceNodeId": "d57de77f-b3b8-4702-94e5-b8c1b4a72abf",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "9c6c0a4b-1397-4970-8af4-ae0ce6adaee3",
      "sourceNodeId": "1ce1b136-5e0d-4524-8620-9040eb5bf71a",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "57c1c399-1924-47f7-b630-7a960dd4e2e6",
      "sourceNodeId": "74394955-df3d-46f8-8bc2-d064eabcafd2",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "064767b1-1202-426f-9c09-579ce3ad2de2",
      "sourceNodeId": "0a6d1679-7262-4685-8d98-301b1ddec6bd",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "c43f8297-38ed-4f47-b413-86cece1ce076",
      "sourceNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "targetNodeId": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "condition": "any"
    },
    {
      "id": "5b06cc3e-5cc6-4d67-9c35-fe9e95feaa60",
      "sourceNodeId": "b10eaa00-d288-45f8-ae79-6f46ead37c4e",
      "targetNodeId": "94b9a5fa-c4b9-436c-9229-2e7057ed6bf8",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "4337dcc7-f15e-4c8d-9b9a-7a529343d906",
      "sourceNodeId": "6e8bf088-9189-4dd2-989c-a78ab8096659",
      "targetNodeId": "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6",
      "condition": "1",
      "label": "Yes, living together"
    },
    {
      "id": "068f1c72-903a-497c-87be-187b0ba61450",
      "sourceNodeId": "9dc67065-aff8-4ddd-a10b-bfabbba1851c",
      "targetNodeId": "05f9415c-ce25-426f-87dc-e45bbb9d90f5",
      "condition": "2",
      "label": "Became a U.S. citizen through naturalization"
    },
    {
      "id": "2d1b513e-c3e8-43bf-83aa-907f54b4219e",
      "sourceNodeId": "9dc67065-aff8-4ddd-a10b-bfabbba1851c",
      "targetNodeId": "6e8bf088-9189-4dd2-989c-a78ab8096659",
      "condition": "1",
      "label": "Born in the U.S. "
    },
    {
      "id": "e100bcbc-c558-4c23-b1e7-42860422dbe0",
      "sourceNodeId": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "targetNodeId": "b10eaa00-d288-45f8-ae79-6f46ead37c4e",
      "condition": "any"
    },
    {
      "id": "5ad93289-dcc6-4967-b984-eefbecff556d",
      "sourceNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "targetNodeId": "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6",
      "condition": "any"
    },
    {
      "id": "3118584d-c890-414c-815a-025dcff0852e",
      "sourceNodeId": "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6",
      "targetNodeId": "b38404ed-6742-45fc-8ff4-f7943c9522af",
      "condition": "yes",
      "label": "Yes"
    },
    {
      "id": "adcfd378-80a6-4e83-a870-af7499d67bec",
      "sourceNodeId": "cbee61db-3b66-4fe2-bcd5-15e115ae5dd6",
      "targetNodeId": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "condition": "no",
      "label": "No"
    },
    {
      "id": "2a5a05b9-b5c2-423b-9caf-73129afe589c",
      "sourceNodeId": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "targetNodeId": "b38404ed-6742-45fc-8ff4-f7943c9522af",
      "condition": "any"
    },
    {
      "id": "5f057283-78fa-49c9-8e21-c62a45112841",
      "sourceNodeId": "b10eaa00-d288-45f8-ae79-6f46ead37c4e",
      "targetNodeId": "5ddaac05-39c0-4a29-8d0f-42513d4d67d2",
      "condition": "any"
    },
    {
      "id": "2f75b874-4b1d-453f-a04d-4639019e3d3d",
      "sourceNodeId": "94b9a5fa-c4b9-436c-9229-2e7057ed6bf8",
      "targetNodeId": "5ddaac05-39c0-4a29-8d0f-42513d4d67d2",
      "condition": "any"
    },
    {
      "id": "599a6e55-34eb-4ccc-af59-6bcda55283f2",
      "sourceNodeId": "eb750c94-d51c-43d7-a0d1-e7beb37d1852",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "2",
      "label": "Lawful permanent resident (green card) spouse"
    },
    {
      "id": "b7b1cd1f-f7fd-464a-a8e1-434e570c911f",
      "sourceNodeId": "6e8bf088-9189-4dd2-989c-a78ab8096659",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "2",
      "label": "Yes, but not living together"
    },
    {
      "id": "ca701c09-c4d7-4576-916a-b75137d972e0",
      "sourceNodeId": "6e8bf088-9189-4dd2-989c-a78ab8096659",
      "targetNodeId": "10dac275-d4d0-4394-8a4a-fbce5e50216c",
      "condition": "1763265902604",
      "label": "No, divorced or separated "
    },
    {
      "id": "31cc456a-8403-45f5-bde6-f0c96f8532a3",
      "sourceNodeId": "10dac275-d4d0-4394-8a4a-fbce5e50216c",
      "targetNodeId": "bc27582e-31fe-40cb-9cba-5b93c30d16c3",
      "condition": "any"
    },
    {
      "id": "0ad051d5-5a55-4af8-a84f-83d550e31538",
      "sourceNodeId": "b38404ed-6742-45fc-8ff4-f7943c9522af",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "36fd0efa-b742-42d2-9ff4-8be8d3ec9b7c",
      "sourceNodeId": "05f9415c-ce25-426f-87dc-e45bbb9d90f5",
      "targetNodeId": "d6e63f0b-8d2e-4d7d-bdf2-015ecf9bc8ac",
      "condition": "any"
    },
    {
      "id": "dba74f11-6523-4bf3-84ed-43c2cd6383e2",
      "sourceNodeId": "eb750c94-d51c-43d7-a0d1-e7beb37d1852",
      "targetNodeId": "9dc67065-aff8-4ddd-a10b-bfabbba1851c",
      "condition": "1",
      "label": "U.S. citizen spouse"
    }
  ]
}
```
