# Node Reference Guide

> A complete reference for all node types, their categories, and attributes in the Flow Builder system.

---

## Table of Contents

1. [Overview](#overview)
2. [Node Categories](#node-categories)
3. [Common Attributes](#common-attributes)
4. [Node Type Details](#node-type-details)
   - [Start Node](#start-node)
   - [Yes/No Node](#yesno-node)
   - [Multiple Choice Node](#multiple-choice-node)
   - [Text Input Node](#text-input-node)
   - [Date Picker Node](#date-picker-node)
   - [Form Builder Node](#form-builder-node)
   - [Info Display Node](#info-display-node)
   - [Subflow Node](#subflow-node)
   - [Completion Node](#completion-node)
   - [Success Node](#success-node)
   - [End Node](#end-node)
5. [Form Field Types](#form-field-types)
6. [Connection Behavior](#connection-behavior)
7. [Edge Label Display Settings](#edge-label-display-settings)
8. [Database Mapping](#database-mapping)

---

## Overview

The Flow Builder uses a variety of node types to create interactive form flows. Each node type belongs to a category and has specific attributes that control its behavior and appearance.

### Quick Reference Table

| Node Type | Category | Connection Type | Terminal? |
|-----------|----------|-----------------|-----------|
| `start` | Entry | Sequential | No |
| `yes-no` | Question | Branching (2 paths) | No |
| `multiple-choice` | Question | Branching (n paths) | No |
| `text` | Input | Sequential | No |
| `date` | Input | Sequential | No |
| `form` | Input | Sequential | No |
| `info` | Action | Sequential | No |
| `subflow` | Logic | Sequential | No |
| `completion` | Action | None | Yes |
| `success` | Action | None | Yes |
| `end` | Action | None | Yes |

---

## Node Categories

Nodes are organized into **four categories** in the component sidebar:

### 1. INPUT Category
Nodes that collect user data through form fields.

| Node | Type String | Description |
|------|-------------|-------------|
| Form Builder | `form` | Multi-field form with various input types |
| Text Input | `text` | Single line text field |
| Number Input | `text` | Numeric value field (uses text node) |
| Date Picker | `date` | Date selection with calendar |

### 2. QUESTION Category
Nodes that present choices and create branching logic.

| Node | Type String | Description |
|------|-------------|-------------|
| Multiple Choice | `multiple-choice` | Radio button selection with custom options |
| Yes/No Question | `yes-no` | Simple binary question |
| Checkbox | `multiple-choice` | Multiple selections (variant of multiple-choice) |
| Dropdown | `multiple-choice` | Select from dropdown list (variant of multiple-choice) |

### 3. LOGIC Category
Nodes that control flow routing and reference other flows.

| Node | Type String | Description |
|------|-------------|-------------|
| Conditional Logic / Subflow | `subflow` | References another flow for modular design |

### 4. ACTION Category
Nodes that display information or terminate the flow.

| Node | Type String | Description |
|------|-------------|-------------|
| Info Display | `info` | Shows informational message |
| Form Submit | `completion` | Submits form data with legal disclaimer |
| Success (Confetti) | `success` | Celebration screen with confetti animation |
| Thank You Page | `end` | Display completion message |

---

## Common Attributes

All nodes share these base attributes:

```typescript
interface BaseNodeAttributes {
  id: string;                              // Unique identifier (UUID)
  type: QuestionType;                      // Node type string
  question: string;                        // Primary text/title for the node
  position: { x: number; y: number };      // Canvas position coordinates
  defaultValue?: string;                   // Pre-filled default value (for input nodes)
  edgeLabelDisplay?: 'full' | 'abbreviated' | 'none';  // How to display edge labels
}
```

### Position
- `x`: Horizontal position on canvas (pixels from left)
- `y`: Vertical position on canvas (pixels from top)

### Default Value
Applicable to input/question nodes. Sets a pre-selected or pre-filled value.

---

## Node Type Details

### Start Node

**Type String:** `start`  
**Category:** Entry Point  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

The entry point for every flow. Each flow must have exactly one start node.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `brandName` | `string` | No | Brand or company name displayed at top |
| `welcomeDescription` | `string` | No | Welcome message/instructions for users |

#### Example

```json
{
  "id": "start_1",
  "type": "start",
  "question": "Start",
  "position": { "x": 250, "y": 50 },
  "brandName": "ACME Legal Services",
  "welcomeDescription": "Welcome to our intake form. Please answer the following questions to help us understand your needs."
}
```

#### Database Mapping

| Node Attribute | Database Column |
|---------------|-----------------|
| `brandName` | `form_title` |
| `welcomeDescription` | `form_description` |

---

### Yes/No Node

**Type String:** `yes-no`  
**Category:** Question  
**Connection:** Branching (exactly 2 outgoing connections: `"yes"` and `"no"`)

Binary choice question with customizable button labels.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | Yes | The question text |
| `yesLabel` | `string` | No | Custom label for Yes button (default: "Yes") |
| `noLabel` | `string` | No | Custom label for No button (default: "No") |
| `defaultValue` | `string` | No | Pre-selected value: `"yes"` or `"no"` |
| `edgeLabelDisplay` | `string` | No | Edge label visibility setting |

#### Example

```json
{
  "id": "q1",
  "type": "yes-no",
  "question": "Are you a U.S. citizen?",
  "position": { "x": 250, "y": 200 },
  "yesLabel": "Yes, I am",
  "noLabel": "No, I'm not",
  "defaultValue": null,
  "edgeLabelDisplay": "full"
}
```

#### Connection Rules

**CRITICAL:** Yes/No nodes must have exactly 2 outgoing connections:
- One with `condition: "yes"`
- One with `condition: "no"`

Do NOT create connections with `condition: "any"` or empty conditions.

---

### Multiple Choice Node

**Type String:** `multiple-choice`  
**Category:** Question  
**Connection:** Branching (one connection per option)

Presents multiple options for the user to select from.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | Yes | The question text |
| `options` | `MultipleChoiceOption[]` | Yes | Array of choice options |
| `defaultValue` | `string` | No | Pre-selected option ID |
| `edgeLabelDisplay` | `string` | No | Edge label visibility setting |

#### MultipleChoiceOption Structure

```typescript
interface MultipleChoiceOption {
  id: string;     // Unique identifier for this option
  label: string;  // Display text shown to user
}
```

#### Example

```json
{
  "id": "q2",
  "type": "multiple-choice",
  "question": "What is your primary immigration goal?",
  "position": { "x": 250, "y": 350 },
  "options": [
    { "id": "work", "label": "Work Visa" },
    { "id": "family", "label": "Family Sponsorship" },
    { "id": "student", "label": "Student Visa" },
    { "id": "other", "label": "Other" }
  ],
  "defaultValue": null,
  "edgeLabelDisplay": "abbreviated"
}
```

#### Connection Rules

Each option should have one corresponding connection with `condition` set to the option's `id` (or `label`).

---

### Text Input Node

**Type String:** `text`  
**Category:** Input  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

Single-line text input field.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | Yes | The prompt/question text |
| `defaultValue` | `string` | No | Pre-filled text value |

#### Example

```json
{
  "id": "name_input",
  "type": "text",
  "question": "What is your full legal name?",
  "position": { "x": 250, "y": 300 },
  "defaultValue": ""
}
```

---

### Date Picker Node

**Type String:** `date`  
**Category:** Input  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

Date selection with calendar picker.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | Yes | The prompt/question text |
| `defaultValue` | `string` | No | Pre-filled date (ISO format: YYYY-MM-DD) |

#### Example

```json
{
  "id": "dob_input",
  "type": "date",
  "question": "What is your date of birth?",
  "position": { "x": 250, "y": 400 },
  "defaultValue": null
}
```

---

### Form Builder Node

**Type String:** `form`  
**Category:** Input  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

Multi-field form that can contain various input types.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | No | Node title (often same as formTitle) |
| `formTitle` | `string` | Yes | Form heading displayed to user |
| `formDescription` | `string` | No | Optional description below title |
| `formFields` | `FormField[]` | Yes | Array of form field definitions |

#### FormField Structure

```typescript
interface FormField {
  id: string;                    // Unique field identifier
  type: FormFieldType;           // Field input type
  label: string;                 // Field label text
  placeholder?: string;          // Placeholder text in input
  defaultValue?: string;         // Pre-filled value
  required?: boolean;            // Whether field is required (default: true)
  options?: MultipleChoiceOption[];  // For multiple-choice field type
}

type FormFieldType = 
  | 'text'           // Single line text
  | 'email'          // Email address with validation
  | 'phone'          // Phone number
  | 'url'            // Website URL
  | 'number'         // Numeric input
  | 'textarea'       // Multi-line text
  | 'date'           // Date picker
  | 'yes-no'         // Yes/No toggle
  | 'multiple-choice'; // Radio button options
```

#### Example

```json
{
  "id": "contact_form",
  "type": "form",
  "question": "Contact Information",
  "position": { "x": 250, "y": 500 },
  "formTitle": "Contact Information",
  "formDescription": "Please provide your contact details",
  "formFields": [
    {
      "id": "field_name",
      "type": "text",
      "label": "Full Name",
      "placeholder": "John Doe",
      "required": true
    },
    {
      "id": "field_email",
      "type": "email",
      "label": "Email Address",
      "placeholder": "john@example.com",
      "required": true
    },
    {
      "id": "field_phone",
      "type": "phone",
      "label": "Phone Number",
      "placeholder": "(555) 123-4567",
      "required": false
    }
  ]
}
```

---

### Info Display Node

**Type String:** `info`  
**Category:** Action  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

Displays informational content without collecting input.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | No | Node title in canvas |
| `infoTitle` | `string` | Yes | Title displayed to user |
| `infoDescription` | `string` | Yes | Content/message displayed |

#### Example

```json
{
  "id": "info_1",
  "type": "info",
  "question": "Important Notice",
  "position": { "x": 250, "y": 600 },
  "infoTitle": "Important Notice",
  "infoDescription": "Please have the following documents ready:\n- Valid passport\n- Proof of address\n- Employment letter"
}
```

#### Database Mapping

| Node Attribute | Database Column |
|---------------|-----------------|
| `infoTitle` | `form_title` |
| `infoDescription` | `form_description` |

---

### Subflow Node

**Type String:** `subflow`  
**Category:** Logic  
**Connection:** Sequential (one outgoing connection with condition `"any"`)

References another flow for modular design and reusability.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | No | Node display name |
| `referencedFlowId` | `string` | Yes | UUID of the referenced flow |
| `referencedFlowName` | `string` | No | Display name of referenced flow (for UI) |

#### Example

```json
{
  "id": "subflow_1",
  "type": "subflow",
  "question": "Employment Verification",
  "position": { "x": 250, "y": 700 },
  "referencedFlowId": "abc123-def456-...",
  "referencedFlowName": "Employment Screening Flow"
}
```

**Note:** When importing, `referencedFlowId` should reference a valid flow in the target system, or be set to `null` and updated post-import.

---

### Completion Node

**Type String:** `completion`  
**Category:** Action  
**Connection:** Terminal (no outgoing connections)

End node that submits form data and displays a thank you message with legal disclaimer.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | No | Node display name in canvas |
| `thankYouTitle` | `string` | Yes | Thank you heading |
| `thankYouMessage` | `string` | No | Thank you body text |
| `legalDisclaimer` | `string` | No | Legal disclaimer text (shown in small print) |
| `additionalInfoPrompt` | `string` | No | Prompt for additional user comments |

#### Example

```json
{
  "id": "completion_1",
  "type": "completion",
  "question": "Thank You",
  "position": { "x": 250, "y": 800 },
  "thankYouTitle": "Thank You!",
  "thankYouMessage": "Your submission has been received. We will contact you within 24 hours.",
  "legalDisclaimer": "The information provided does not constitute legal advice...",
  "additionalInfoPrompt": "Is there anything else you'd like us to know?"
}
```

---

### Success Node

**Type String:** `success`  
**Category:** Action  
**Connection:** Terminal (no outgoing connections)

Celebratory end node with optional confetti animation.

#### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | `string` | No | Often same as successTitle |
| `successTitle` | `string` | Yes | Success heading |
| `successMessage` | `string` | No | Success body text |
| `showConfetti` | `boolean` | No | Whether to show confetti animation (default: true) |

#### Example

```json
{
  "id": "success_1",
  "type": "success",
  "question": "Congratulations!",
  "position": { "x": 100, "y": 800 },
  "successTitle": "Congratulations!",
  "successMessage": "You have successfully completed the screening process.",
  "showConfetti": true
}
```

---

### End Node

**Type String:** `end`  
**Category:** Action  
**Connection:** Terminal (no outgoing connections)

Alternative termination node. Functionally equivalent to `completion` but used as a simpler thank you page.

#### Attributes

Same as Completion Node:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `thankYouTitle` | `string` | Yes | Thank you heading |
| `thankYouMessage` | `string` | No | Thank you body text |
| `legalDisclaimer` | `string` | No | Legal disclaimer text |
| `additionalInfoPrompt` | `string` | No | Additional comments prompt |

---

## Form Field Types

Detailed reference for form fields used within Form Builder nodes:

| Type | Description | Validation | Placeholder Example |
|------|-------------|------------|---------------------|
| `text` | Single line text | None | "Enter text" |
| `email` | Email address | Email format | "example@email.com" |
| `phone` | Phone number | None (display formatting) | "(555) 123-4567" |
| `url` | Website URL | URL format | "https://example.com" |
| `number` | Numeric value | Numbers only | "0" |
| `textarea` | Multi-line text | None | "Enter detailed information..." |
| `date` | Date picker | Valid date | N/A (calendar picker) |
| `yes-no` | Yes/No toggle | Binary | N/A (toggle switch) |
| `multiple-choice` | Radio options | Must select one | N/A (option list) |

---

## Connection Behavior

### Sequential Nodes
Connect with condition `"any"` or `""`:
- `start`, `text`, `date`, `form`, `info`, `subflow`

### Branching Nodes
Connect with specific conditions:
- `yes-no`: `"yes"` and `"no"` (exactly 2 connections)
- `multiple-choice`: Option ID or label (one per option)

### Terminal Nodes
No outgoing connections:
- `completion`, `success`, `end`

---

## Edge Label Display Settings

Controls how connection labels appear on the canvas:

| Value | Description |
|-------|-------------|
| `full` | Show complete label text |
| `abbreviated` | Show shortened version |
| `none` | Hide labels entirely |

Applicable to: `yes-no`, `multiple-choice` nodes

---

## Database Mapping

Complete mapping from node attributes to database columns:

| Node Attribute | Database Column | Notes |
|---------------|-----------------|-------|
| `id` | `id` | UUID, regenerated on import |
| `type` | `node_type` | String |
| `question` | `question` | Primary text |
| `position.x` | `position_x` | Number |
| `position.y` | `position_y` | Number |
| `options` | `options` | JSON array |
| `yesLabel` | `yes_label` | String |
| `noLabel` | `no_label` | String |
| `defaultValue` | `default_value` | String |
| `brandName` | (stored via form_title for start) | |
| `welcomeDescription` | (stored via form_description for start) | |
| `formTitle` | `form_title` | String |
| `formDescription` | `form_description` | String |
| `formFields` | `form_fields` | JSON array |
| `thankYouTitle` | `thank_you_title` | String |
| `thankYouMessage` | `thank_you_message` | String |
| `legalDisclaimer` | `legal_disclaimer` | String |
| `additionalInfoPrompt` | `additional_info_prompt` | String |
| `infoTitle` | `form_title` | Stored in form_title column |
| `infoDescription` | `form_description` | Stored in form_description column |
| `referencedFlowId` | `referenced_flow_id` | UUID |
| `edgeLabelDisplay` | `edge_label_display` | String |

**Note:** `successTitle`, `successMessage`, and `showConfetti` for success nodes are stored using the `thank_you_title` and `thank_you_message` columns. The `showConfetti` flag is derived from node type.

---

## TypeScript Type Definitions

```typescript
export type QuestionType = 
  | 'yes-no' 
  | 'multiple-choice' 
  | 'text' 
  | 'date' 
  | 'start' 
  | 'end' 
  | 'completion' 
  | 'success' 
  | 'subflow' 
  | 'form' 
  | 'info';

export interface MultipleChoiceOption {
  id: string;
  label: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'url' | 'number' | 'textarea' | 'date' | 'yes-no' | 'multiple-choice';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: MultipleChoiceOption[];
}

export interface FormNode {
  id: string;
  type: QuestionType;
  question: string;
  options?: MultipleChoiceOption[];
  yesLabel?: string;
  noLabel?: string;
  position: { x: number; y: number };
  defaultValue?: string;
  brandName?: string;
  welcomeDescription?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  legalDisclaimer?: string;
  additionalInfoPrompt?: string;
  successTitle?: string;
  successMessage?: string;
  showConfetti?: boolean;
  referencedFlowId?: string;
  referencedFlowName?: string;
  formTitle?: string;
  formDescription?: string;
  formFields?: FormField[];
  infoTitle?: string;
  infoDescription?: string;
  edgeLabelDisplay?: 'full' | 'abbreviated' | 'none';
}
```

---

*Document Version: 1.0*  
*Last Updated: 2026-01-18*
