import enTranslations from '../../../translations/en.json';
import esTranslations from '../../../translations/es.json';
import type { TranslationLabels } from '@/types/translations';

type Answer = string | boolean | number;

type Option = { value: string; label: string };

type Question = {
  id: string;
  kind: 'confirm' | 'single' | 'multi' | 'text' | 'textarea' | 'date';
  prompt: string;
  options?: Option[];
  required?: boolean;
  visibleIf?: (answers: Record<string, Answer>) => boolean;
  next?: (answers: Record<string, Answer>) => string | 'END';
};

type Flow = {
  start: string;
  nodes: Record<string, Question>;
};

type CaseType = 'final-asylum-flow' | 'new-k1-fiance-visa' | 'new-k1-fiance-visa-beneficiary' | 'new-removal-of-conditions' | 'new-family-based-green-card-petitioner' | 'new-family-based-green-card-beneficiary' | 'other';

export function getTranslations(language: 'en' | 'es') {
  return language === 'es' ? esTranslations : enTranslations;
}

export function buildFlowConfig(language: 'en' | 'es'): Record<CaseType, Flow> {
  const t = getTranslations(language);
  
  return {
    'final-asylum-flow': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['final-asylum-flow'].confirm.prompt,
          options: t.quoteModal.flows['final-asylum-flow'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible_no_fear' : 'inspected'
        },
        ineligible_no_fear: {
          id: 'ineligible_no_fear',
          kind: 'textarea',
          prompt: t.quoteModal.flows['final-asylum-flow'].ineligible_no_fear.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        inspected: {
          id: 'inspected',
          kind: 'single',
          prompt: t.quoteModal.flows['final-asylum-flow'].inspected.prompt,
          options: t.quoteModal.flows['final-asylum-flow'].inspected.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.inspected === 'yes' ? 'entry_description' : 'entry_date'
        },
        entry_description: {
          id: 'entry_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['final-asylum-flow'].entry_description.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes' && answers.inspected === 'yes',
          next: () => 'entry_date'
        },
        entry_date: {
          id: 'entry_date',
          kind: 'textarea',
          prompt: t.quoteModal.flows['final-asylum-flow'].entry_date.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'afraid_return'
        },
        afraid_return: {
          id: 'afraid_return',
          kind: 'confirm',
          prompt: t.quoteModal.flows['final-asylum-flow'].afraid_return.prompt,
          options: t.quoteModal.flows['final-asylum-flow'].afraid_return.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.afraid_return === 'no' ? 'ineligible_no_fear_return' : 'fear_explanation'
        },
        ineligible_no_fear_return: {
          id: 'ineligible_no_fear_return',
          kind: 'textarea',
          prompt: t.quoteModal.flows['final-asylum-flow'].ineligible_no_fear_return.prompt,
          required: true,
          visibleIf: (answers) => answers.afraid_return === 'no',
          next: () => 'END'
        },
        fear_explanation: {
          id: 'fear_explanation',
          kind: 'textarea',
          prompt: t.quoteModal.flows['final-asylum-flow'].fear_explanation.prompt,
          required: true,
          visibleIf: (answers) => answers.afraid_return === 'yes',
          next: () => 'immigration_court'
        },
        immigration_court: {
          id: 'immigration_court',
          kind: 'confirm',
          prompt: t.quoteModal.flows['final-asylum-flow'].immigration_court.prompt,
          options: t.quoteModal.flows['final-asylum-flow'].immigration_court.options,
          required: true,
          visibleIf: (answers) => answers.afraid_return === 'yes',
          next: () => 'END'
        }
      }
    },
    'new-k1-fiance-visa': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].confirm.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible_not_citizen' : 'applied_before'
        },
        ineligible_not_citizen: {
          id: 'ineligible_not_citizen',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].ineligible_not_citizen.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        applied_before: {
          id: 'applied_before',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].applied_before.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].applied_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'married_before'
        },
        married_before: {
          id: 'married_before',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].married_before.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].married_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'age_gap'
        },
        age_gap: {
          id: 'age_gap',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].age_gap.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].age_gap.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'met_in_person'
        },
        met_in_person: {
          id: 'met_in_person',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].met_in_person.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].met_in_person.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'relationship_duration'
        },
        relationship_duration: {
          id: 'relationship_duration',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].relationship_duration.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].relationship_duration.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'fiance_location'
        },
        fiance_location: {
          id: 'fiance_location',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].fiance_location.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].fiance_location.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'fiance_prior_immigration'
        },
        fiance_prior_immigration: {
          id: 'fiance_prior_immigration',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].fiance_prior_immigration.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa'].fiance_prior_immigration.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.fiance_prior_immigration === 'yes' ? 'fiance_prior_immigration_explanation' : 'END'
        },
        fiance_prior_immigration_explanation: {
          id: 'fiance_prior_immigration_explanation',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-k1-fiance-visa'].fiance_prior_immigration_explanation.prompt,
          required: true,
          visibleIf: (answers) => answers.fiance_prior_immigration === 'yes',
          next: () => 'END'
        }
      }
    },
    'new-k1-fiance-visa-beneficiary': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].confirm.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible_not_beneficiary' : 'prior_immigration_benefit'
        },
        ineligible_not_beneficiary: {
          id: 'ineligible_not_beneficiary',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].ineligible_not_beneficiary.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        prior_immigration_benefit: {
          id: 'prior_immigration_benefit',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].prior_immigration_benefit.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].prior_immigration_benefit.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.prior_immigration_benefit === 'yes' ? 'prior_immigration_explanation' : 'married_before'
        },
        prior_immigration_explanation: {
          id: 'prior_immigration_explanation',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].prior_immigration_explanation.prompt,
          required: true,
          visibleIf: (answers) => answers.prior_immigration_benefit === 'yes',
          next: () => 'married_before'
        },
        married_before: {
          id: 'married_before',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].married_before.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].married_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'age_gap'
        },
        age_gap: {
          id: 'age_gap',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].age_gap.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].age_gap.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'met_in_person'
        },
        met_in_person: {
          id: 'met_in_person',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].met_in_person.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].met_in_person.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'relationship_duration'
        },
        relationship_duration: {
          id: 'relationship_duration',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].relationship_duration.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].relationship_duration.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'current_location'
        },
        current_location: {
          id: 'current_location',
          kind: 'single',
          prompt: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].current_location.prompt,
          options: t.quoteModal.flows['new-k1-fiance-visa-beneficiary'].current_location.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'END'
        }
      }
    },
    'new-removal-of-conditions': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].confirm.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible' : 'already_submitted'
        },
        ineligible: {
          id: 'ineligible',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].ineligible.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        already_submitted: {
          id: 'already_submitted',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].already_submitted.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].already_submitted.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.already_submitted === 'yes' ? 'if_submitted_how' : 'green_card_start_date'
        },
        if_submitted_how: {
          id: 'if_submitted_how',
          kind: 'single',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].if_submitted_how.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].if_submitted_how.options,
          required: true,
          visibleIf: (answers) => answers.already_submitted === 'yes',
          next: () => 'green_card_start_date'
        },
        green_card_start_date: {
          id: 'green_card_start_date',
          kind: 'text',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].green_card_start_date.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'marital_evidence_scale'
        },
        marital_evidence_scale: {
          id: 'marital_evidence_scale',
          kind: 'single',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].marital_evidence_scale.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].marital_evidence_scale.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'filing_type'
        },
        filing_type: {
          id: 'filing_type',
          kind: 'single',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].filing_type.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].filing_type.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.filing_type === 'with_waiver' ? 'spouse_involvement' : answers.filing_type === 'joint_filing' ? 'marital_situation' : 'END'
        },
        spouse_involvement: {
          id: 'spouse_involvement',
          kind: 'single',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].spouse_involvement.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].spouse_involvement.options,
          required: true,
          visibleIf: (answers) => answers.filing_type === 'with_waiver',
          next: () => 'marital_situation'
        },
        marital_situation: {
          id: 'marital_situation',
          kind: 'single',
          prompt: t.quoteModal.flows['new-removal-of-conditions'].marital_situation.prompt,
          options: t.quoteModal.flows['new-removal-of-conditions'].marital_situation.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'END'
        }
      }
    },
    'new-family-based-green-card-petitioner': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].confirm.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible' : 'relationship'
        },
        ineligible: {
          id: 'ineligible',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].ineligible.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        relationship: {
          id: 'relationship',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].relationship.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].relationship.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'status'
        },
        status: {
          id: 'status',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].status.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].status.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => {
            if (answers.status === 'other') return 'sponsored_before';
            if (answers.status === 'us_citizen') return 'citizenship_method';
            if (answers.status === 'green_card_holder') return 'green_card_method_lpr';
            return 'sponsored_before';
          }
        },
        citizenship_method: {
          id: 'citizenship_method',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].citizenship_method.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].citizenship_method.options,
          required: true,
          visibleIf: (answers) => answers.status === 'us_citizen',
          next: (answers) => answers.citizenship_method === 'naturalization' ? 'green_card_method_naturalized' : 'sponsored_before'
        },
        green_card_method_naturalized: {
          id: 'green_card_method_naturalized',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].green_card_method_naturalized.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].green_card_method_naturalized.options,
          required: true,
          visibleIf: (answers) => answers.citizenship_method === 'naturalization',
          next: () => 'sponsored_before'
        },
        green_card_method_lpr: {
          id: 'green_card_method_lpr',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].green_card_method_lpr.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].green_card_method_lpr.options,
          required: true,
          visibleIf: (answers) => answers.status === 'green_card_holder',
          next: () => 'sponsored_before'
        },
        sponsored_before: {
          id: 'sponsored_before',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].sponsored_before.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].sponsored_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.sponsored_before === 'yes' ? 'sponsorship_description' : 'location'
        },
        sponsorship_description: {
          id: 'sponsorship_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].sponsorship_description.prompt,
          required: true,
          visibleIf: (answers) => answers.sponsored_before === 'yes',
          next: () => 'location'
        },
        location: {
          id: 'location',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].location.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].location.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => {
            if (answers.location === 'outside_us') return 'beneficiary_marital_status';
            if (answers.location === 'inside_us') return 'border_inspection';
            return 'beneficiary_marital_status';
          }
        },
        border_inspection: {
          id: 'border_inspection',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].border_inspection.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].border_inspection.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside_us',
          next: (answers) => answers.border_inspection === 'yes_inspected' ? 'entry_visa_type' : 'times_entered_illegally'
        },
        times_entered_illegally: {
          id: 'times_entered_illegally',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].times_entered_illegally.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].times_entered_illegally.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'no_not_inspected',
          next: () => 'immigration_court'
        },
        entry_visa_type: {
          id: 'entry_visa_type',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].entry_visa_type.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].entry_visa_type.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'yes_inspected',
          next: () => 'visa_violations'
        },
        visa_violations: {
          id: 'visa_violations',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].visa_violations.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].visa_violations.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'yes_inspected',
          next: () => 'immigration_court'
        },
        immigration_court: {
          id: 'immigration_court',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].immigration_court.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].immigration_court.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside_us',
          next: () => 'beneficiary_marital_status'
        },
        beneficiary_marital_status: {
          id: 'beneficiary_marital_status',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].beneficiary_marital_status.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].beneficiary_marital_status.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'beneficiary_applied_before'
        },
        beneficiary_applied_before: {
          id: 'beneficiary_applied_before',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].beneficiary_applied_before.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-petitioner'].beneficiary_applied_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.beneficiary_applied_before === 'yes' ? 'beneficiary_application_description' : 'END'
        },
        beneficiary_application_description: {
          id: 'beneficiary_application_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-petitioner'].beneficiary_application_description.prompt,
          required: true,
          visibleIf: (answers) => answers.beneficiary_applied_before === 'yes',
          next: () => 'END'
        }
      }
    },
    'new-family-based-green-card-beneficiary': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].confirm.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].confirm.options,
          required: true,
          next: (answers) => answers.confirm === 'no' ? 'ineligible' : 'relationship'
        },
        ineligible: {
          id: 'ineligible',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].ineligible.prompt,
          required: true,
          visibleIf: (answers) => answers.confirm === 'no',
          next: () => 'END'
        },
        relationship: {
          id: 'relationship',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].relationship.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].relationship.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'sponsor_status'
        },
        sponsor_status: {
          id: 'sponsor_status',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].sponsor_status.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].sponsor_status.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'sponsored_before'
        },
        sponsored_before: {
          id: 'sponsored_before',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].sponsored_before.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].sponsored_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.sponsored_before === 'yes' ? 'sponsored_before_description' : 'applied_before'
        },
        sponsored_before_description: {
          id: 'sponsored_before_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].sponsored_before_description.prompt,
          required: true,
          visibleIf: (answers) => answers.sponsored_before === 'yes',
          next: () => 'applied_before'
        },
        applied_before: {
          id: 'applied_before',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].applied_before.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].applied_before.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.applied_before === 'yes' ? 'applied_before_description' : 'location'
        },
        applied_before_description: {
          id: 'applied_before_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].applied_before_description.prompt,
          required: true,
          visibleIf: (answers) => answers.applied_before === 'yes',
          next: () => 'location'
        },
        location: {
          id: 'location',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].location.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].location.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => {
            if (answers.location === 'outside_us') return 'immigration_court';
            if (answers.location === 'inside_us') return 'border_inspection';
            return 'immigration_court';
          }
        },
        border_inspection: {
          id: 'border_inspection',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].border_inspection.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].border_inspection.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside_us',
          next: (answers) => answers.border_inspection === 'yes_inspected' ? 'entry_visa_type' : 'times_entered_illegally'
        },
        times_entered_illegally: {
          id: 'times_entered_illegally',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].times_entered_illegally.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].times_entered_illegally.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'no_not_inspected',
          next: () => 'immigration_court'
        },
        entry_visa_type: {
          id: 'entry_visa_type',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].entry_visa_type.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].entry_visa_type.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'yes_inspected',
          next: () => 'visa_violations'
        },
        visa_violations: {
          id: 'visa_violations',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].visa_violations.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].visa_violations.options,
          required: true,
          visibleIf: (answers) => answers.border_inspection === 'yes_inspected',
          next: () => 'immigration_court'
        },
        immigration_court: {
          id: 'immigration_court',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].immigration_court.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].immigration_court.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'marital_status'
        },
        marital_status: {
          id: 'marital_status',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].marital_status.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].marital_status.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: () => 'criminal_history'
        },
        criminal_history: {
          id: 'criminal_history',
          kind: 'single',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].criminal_history.prompt,
          options: t.quoteModal.flows['new-family-based-green-card-beneficiary'].criminal_history.options,
          required: true,
          visibleIf: (answers) => answers.confirm === 'yes',
          next: (answers) => answers.criminal_history === 'yes' ? 'criminal_details' : 'END'
        },
        criminal_details: {
          id: 'criminal_details',
          kind: 'textarea',
          prompt: t.quoteModal.flows['new-family-based-green-card-beneficiary'].criminal_details.prompt,
          required: true,
          visibleIf: (answers) => answers.criminal_history === 'yes',
          next: () => 'END'
        }
      }
    },
    'other': {
      start: 'other_assistance_type',
      nodes: {
        other_assistance_type: {
          id: 'other_assistance_type',
          kind: 'textarea',
          prompt: t.quoteModal.flows.other.other_assistance_type.prompt,
          required: true,
          next: () => 'END'
        }
      }
    }
  };
}

export function getCaseTypeOptions(language: 'en' | 'es') {
  const t = getTranslations(language);
  return t.quoteModal.caseTypeOptions;
}

export function getLabels(language: 'en' | 'es'): TranslationLabels {
  const t = getTranslations(language);
  return {
    title: t.quoteModal.title,
    subtitle: t.quoteModal.subtitle,
    chooseClosestOption: t.quoteModal.chooseClosestOption,
    ...t.quoteModal.labels
  } as TranslationLabels;
}
