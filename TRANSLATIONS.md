# Translation System Documentation

## Overview

This application uses an external JSON-based translation system to manage bilingual content (English and Spanish). This system prevents translation overwrites during deployment and makes it easy to update translations without touching code.

## File Structure

```
translations/
├── en.json          # English translations
└── es.json          # Spanish translations

client/src/
├── lib/
│   └── translations.ts    # Translation utility functions
└── types/
    └── translations.ts    # TypeScript type definitions
```

## Translation Files

### Location
- English: `translations/en.json`
- Spanish: `translations/es.json`

### Structure

Both translation files follow the same structure:

```json
{
  "landingPage": {
    "hero": {
      "title": "Main headline text",
      "subtitle": "Secondary headline text",
      "description": "Description paragraph",
      "primaryButton": "Primary button text",
      "secondaryButton": "Secondary button text"
    },
    "textBelowImage": "Text displayed below the hero image"
  },
  "quoteModal": {
    "title": "Modal title",
    "subtitle": "Modal subtitle",
    "chooseClosestOption": "Instruction text",
    "labels": {
      "fullName": "Full Name label",
      "email": "Email label",
      ...
    },
    "caseTypeOptions": [
      {
        "value": "case-type-id",
        "label": "Display name for case type"
      }
    ],
    "flows": {
      "case-type-id": {
        "question-id": {
          "prompt": "Question text",
          "options": [
            { "value": "option-value", "label": "Option label" }
          ]
        }
      }
    }
  }
}
```

## How to Update Translations

### 1. Update Text Content

To change any text in the application:

1. Open the appropriate translation file:
   - For English: `translations/en.json`
   - For Spanish: `translations/es.json`

2. Find the text you want to change

3. Update the value in the JSON file

4. Save the file

5. The changes will appear automatically (hot reload in development)

### 2. Add New Translations

To add new translations:

1. Add the new key-value pair to **both** `en.json` and `es.json`

2. Update the code to use the new translation key

3. If adding a new label, update `client/src/types/translations.ts` to include the new type

### 3. Important Rules

- **Always update both files**: When adding or modifying translations, update both English and Spanish files to maintain consistency
- **Maintain structure**: Keep the JSON structure identical in both files
- **Use proper JSON syntax**: Ensure quotes are escaped properly and trailing commas are removed
- **Test both languages**: Always test changes in both English (/en route) and Spanish (/es route)

## Using Translations in Code

### Import the Translation Functions

```typescript
import { getTranslations, getLabels, getCaseTypeOptions, buildFlowConfig } from '@/lib/translations';
```

### Get Full Translations

```typescript
const t = getTranslations('es'); // or 'en'

// Use in JSX
<h1>{t.landingPage.hero.title}</h1>
```

### Get Specific Sections

```typescript
// Get all labels for the quote modal
const labels = getLabels('es');

// Get case type options
const caseTypes = getCaseTypeOptions('es');

// Get flow configuration
const flowConfig = buildFlowConfig('es');
```

### Determine Language

The application uses the URL path to determine language:
- Paths starting with `/es` use Spanish
- All other paths use English

```typescript
const [location] = useLocation();
const isSpanish = location.startsWith('/es');
const t = getTranslations(isSpanish ? 'es' : 'en');
```

## Translation Coverage

### Landing Pages
- Hero section (title, subtitle, description, buttons)
- Value proposition text (Spanish only)

### Quote Modal
- All form labels
- All questionnaire flows for:
  - Family-Based Immigration
  - K-1 Fiancé Visa
  - Removal of Conditions
  - Asylum
  - Citizenship/Naturalization
  - Other cases
- Success messages
- Error messages
- Dialog content

## Key Translation Changes Applied

### Spanish (es.json)

1. **Landing Page Title**: Changed from "Ve Cuánto Cobran" to "Descubre Cuánto Cobran"

2. **Landing Page Subtitle**: Updated to include "sin compromisos" instead of "sin obligaciones"

3. **Removed Paragraph**: Deleted the long paragraph starting with "Estamos aquí para ayudarte..."

4. **Green Card Terminology**: All instances of "tarjeta verde" replaced with "green card" throughout Spanish questionnaires

5. **Citizenship Labels**: Removed repetitive "Naturalization / Citizenship" text

### English (en.json)

- Standardized to match Spanish structure
- "Attorney" terminology used consistently

## Development Workflow

### Adding a New Question to a Flow

1. Open both `translations/en.json` and `translations/es.json`

2. Navigate to `quoteModal.flows.[case-type-id]`

3. Add the new question in both files:

```json
"new_question_id": {
  "prompt": "Question text here",
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "no", "label": "No" }
  ]
}
```

4. Update the flow logic in `client/src/lib/translations.ts` to include the navigation logic for the new question

### Modifying Case Type Options

1. Update the `caseTypeOptions` array in both translation files

2. Ensure the `value` field matches the case type ID used in the flow configuration

3. Update the `label` to the desired display text

## Best Practices

1. **Keep it DRY**: Don't duplicate translation strings. Reference the JSON files instead of hardcoding text.

2. **Consistent Terminology**: Use the same terms throughout each language version.

3. **Context Matters**: Ensure translations make sense in context, not just word-for-word.

4. **Test Flows**: After updating questionnaire translations, test the complete flow in both languages.

5. **Version Control**: Always commit translation changes together with related code changes.

## Troubleshooting

### Translations Not Appearing

1. Check that the JSON file has valid syntax (use a JSON validator)
2. Verify you're accessing the correct path in the translation object
3. Clear browser cache and hard reload
4. Check browser console for errors

### Type Errors

1. Ensure `client/src/types/translations.ts` includes all label properties
2. Update the return type of `getLabels()` if you added new labels
3. Run TypeScript check: `npm run type-check` (if available)

### Missing Translations

1. Compare both `en.json` and `es.json` structure
2. Ensure all keys exist in both files
3. Check for typos in property names

## Deployment

The external JSON translation system is designed to:

1. **Survive deployments**: Translation files are separate from code, reducing overwrite risk
2. **Enable non-technical updates**: Translators can update JSON files without touching code
3. **Support version control**: Easy to track translation changes in git history

When deploying:
- Ensure `translations/` directory is included in your deployment
- Verify both translation files are present
- Test both language versions after deployment

## Future Enhancements

Potential improvements to the translation system:

1. **Translation Management UI**: Build an admin interface to edit translations
2. **Missing Translation Detection**: Add validation to ensure all keys exist in both languages
3. **Additional Languages**: Extend system to support more languages
4. **Dynamic Loading**: Load translations on-demand instead of bundling
5. **Translation Memory**: Track commonly used phrases for consistency
