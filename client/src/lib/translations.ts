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

type CaseType = 'family-based-immigrant-visa-immediate-relative' | 'k1-fiance-visa' | 'removal-of-conditions' | 'asylum-affirmative' | 'citizenship-naturalization-n400' | 'other';

export function getTranslations(language: 'en' | 'es') {
  return language === 'es' ? esTranslations : enTranslations;
}

export function buildFlowConfig(language: 'en' | 'es'): Record<CaseType, Flow> {
  const t = getTranslations(language);
  
  return {
    'family-based-immigrant-visa-immediate-relative': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].confirm.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].confirm.options,
          required: true,
          next: () => 'relationship'
        },
        relationship: {
          id: 'relationship',
          kind: 'single',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].relationship.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].relationship.options,
          required: true,
          next: (answers) => answers.relationship === 'other' ? 'relationship_other_details' : 'location'
        },
        relationship_other_details: {
          id: 'relationship_other_details',
          kind: 'textarea',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].relationship_other_details.prompt,
          required: true,
          visibleIf: (answers) => answers.relationship === 'other',
          next: () => 'location'
        },
        location: {
          id: 'location',
          kind: 'single',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].location.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].location.options,
          required: true,
          next: (answers) => answers.location === 'inside' ? 'inside_inspected' : 'outside_prior_benefit'
        },
        inside_inspected: {
          id: 'inside_inspected',
          kind: 'single',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_inspected.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_inspected.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside',
          next: () => 'inside_entry_status'
        },
        inside_entry_status: {
          id: 'inside_entry_status',
          kind: 'single',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_entry_status.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_entry_status.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside',
          next: () => 'inside_overstay'
        },
        inside_overstay: {
          id: 'inside_overstay',
          kind: 'single',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_overstay.prompt,
          options: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].inside_overstay.options,
          required: true,
          visibleIf: (answers) => answers.location === 'inside',
          next: () => 'END'
        },
        outside_prior_benefit: {
          id: 'outside_prior_benefit',
          kind: 'textarea',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].outside_prior_benefit.prompt,
          required: true,
          visibleIf: (answers) => answers.location === 'outside',
          next: () => 'outside_help_type'
        },
        outside_help_type: {
          id: 'outside_help_type',
          kind: 'textarea',
          prompt: t.quoteModal.flows['family-based-immigrant-visa-immediate-relative'].outside_help_type.prompt,
          required: true,
          visibleIf: (answers) => answers.location === 'outside',
          next: () => 'END'
        }
      }
    },
    'asylum-affirmative': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['asylum-affirmative'].confirm.prompt,
          options: t.quoteModal.flows['asylum-affirmative'].confirm.options,
          required: true,
          next: () => 'inspected'
        },
        inspected: {
          id: 'inspected',
          kind: 'single',
          prompt: t.quoteModal.flows['asylum-affirmative'].inspected.prompt,
          options: t.quoteModal.flows['asylum-affirmative'].inspected.options,
          required: true,
          next: () => 'entry_description'
        },
        entry_description: {
          id: 'entry_description',
          kind: 'textarea',
          prompt: t.quoteModal.flows['asylum-affirmative'].entry_description.prompt,
          required: true,
          next: () => 'entry_date'
        },
        entry_date: {
          id: 'entry_date',
          kind: 'date',
          prompt: t.quoteModal.flows['asylum-affirmative'].entry_date.prompt,
          required: true,
          next: () => 'afraid_return'
        },
        afraid_return: {
          id: 'afraid_return',
          kind: 'textarea',
          prompt: t.quoteModal.flows['asylum-affirmative'].afraid_return.prompt,
          required: true,
          next: () => 'immigration_court'
        },
        immigration_court: {
          id: 'immigration_court',
          kind: 'confirm',
          prompt: t.quoteModal.flows['asylum-affirmative'].immigration_court.prompt,
          options: t.quoteModal.flows['asylum-affirmative'].immigration_court.options,
          required: true,
          next: () => 'END'
        }
      }
    },
    'removal-of-conditions': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['removal-of-conditions'].confirm.prompt,
          options: t.quoteModal.flows['removal-of-conditions'].confirm.options,
          required: true,
          next: () => 'green_card_date'
        },
        green_card_date: {
          id: 'green_card_date',
          kind: 'date',
          prompt: t.quoteModal.flows['removal-of-conditions'].green_card_date.prompt,
          required: true,
          next: () => 'marital_evidence'
        },
        marital_evidence: {
          id: 'marital_evidence',
          kind: 'single',
          prompt: t.quoteModal.flows['removal-of-conditions'].marital_evidence.prompt,
          options: t.quoteModal.flows['removal-of-conditions'].marital_evidence.options,
          required: true,
          next: () => 'filing_type'
        },
        filing_type: {
          id: 'filing_type',
          kind: 'single',
          prompt: t.quoteModal.flows['removal-of-conditions'].filing_type.prompt,
          options: t.quoteModal.flows['removal-of-conditions'].filing_type.options,
          required: true,
          next: () => 'marriage_situation'
        },
        marriage_situation: {
          id: 'marriage_situation',
          kind: 'single',
          prompt: t.quoteModal.flows['removal-of-conditions'].marriage_situation.prompt,
          options: t.quoteModal.flows['removal-of-conditions'].marriage_situation.options,
          required: true,
          next: () => 'END'
        }
      }
    },
    'k1-fiance-visa': {
      start: 'confirm',
      nodes: {
        confirm: {
          id: 'confirm',
          kind: 'confirm',
          prompt: t.quoteModal.flows['k1-fiance-visa'].confirm.prompt,
          options: t.quoteModal.flows['k1-fiance-visa'].confirm.options,
          required: true,
          next: () => 'met_in_person'
        },
        met_in_person: {
          id: 'met_in_person',
          kind: 'confirm',
          prompt: t.quoteModal.flows['k1-fiance-visa'].met_in_person.prompt,
          options: t.quoteModal.flows['k1-fiance-visa'].met_in_person.options,
          required: true,
          next: () => 'relationship_duration'
        },
        relationship_duration: {
          id: 'relationship_duration',
          kind: 'single',
          prompt: t.quoteModal.flows['k1-fiance-visa'].relationship_duration.prompt,
          options: t.quoteModal.flows['k1-fiance-visa'].relationship_duration.options,
          required: true,
          next: () => 'fiance_location'
        },
        fiance_location: {
          id: 'fiance_location',
          kind: 'single',
          prompt: t.quoteModal.flows['k1-fiance-visa'].fiance_location.prompt,
          options: t.quoteModal.flows['k1-fiance-visa'].fiance_location.options,
          required: true,
          next: () => 'prior_immigration_benefit'
        },
        prior_immigration_benefit: {
          id: 'prior_immigration_benefit',
          kind: 'confirm',
          prompt: t.quoteModal.flows['k1-fiance-visa'].prior_immigration_benefit.prompt,
          options: t.quoteModal.flows['k1-fiance-visa'].prior_immigration_benefit.options,
          required: true,
          next: (answers) => answers.prior_immigration_benefit === 'yes' ? 'prior_immigration_explanation' : 'END'
        },
        prior_immigration_explanation: {
          id: 'prior_immigration_explanation',
          kind: 'textarea',
          prompt: t.quoteModal.flows['k1-fiance-visa'].prior_immigration_explanation.prompt,
          required: true,
          visibleIf: (answers) => answers.prior_immigration_benefit === 'yes',
          next: () => 'END'
        }
      }
    },
    'citizenship-naturalization-n400': {
      start: 'green_card_how',
      nodes: {
        green_card_how: {
          id: 'green_card_how',
          kind: 'single',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].green_card_how.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].green_card_how.options,
          required: true,
          next: (answers) => answers.green_card_how === 'marriage' ? 'marriage_sponsor_type' : 'green_card_date'
        },
        marriage_sponsor_type: {
          id: 'marriage_sponsor_type',
          kind: 'single',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].marriage_sponsor_type.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].marriage_sponsor_type.options,
          required: true,
          visibleIf: (answers) => answers.green_card_how === 'marriage',
          next: (answers) => {
            if (answers.marriage_sponsor_type === 'usc_spouse') {
              return 'still_married_usc';
            } else if (answers.marriage_sponsor_type === 'lpr_spouse') {
              return 'green_card_date';
            } else {
              return 'green_card_date';
            }
          }
        },
        still_married_usc: {
          id: 'still_married_usc',
          kind: 'single',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].still_married_usc.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].still_married_usc.options,
          required: true,
          visibleIf: (answers) => answers.green_card_how === 'marriage' && answers.marriage_sponsor_type === 'usc_spouse',
          next: (answers) => {
            if (answers.still_married_usc === 'yes_living_together' || answers.still_married_usc === 'yes_not_living_together') {
              return 'continuously_lived_with_spouse';
            } else {
              return 'green_card_date';
            }
          }
        },
        continuously_lived_with_spouse: {
          id: 'continuously_lived_with_spouse',
          kind: 'confirm',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].continuously_lived_with_spouse.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].continuously_lived_with_spouse.options,
          required: true,
          visibleIf: (answers) => 
            answers.green_card_how === 'marriage' && 
            answers.marriage_sponsor_type === 'usc_spouse' && 
            (answers.still_married_usc === 'yes_living_together' || answers.still_married_usc === 'yes_not_living_together'),
          next: () => 'lived_in_us_3_years'
        },
        lived_in_us_3_years: {
          id: 'lived_in_us_3_years',
          kind: 'confirm',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].lived_in_us_3_years.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].lived_in_us_3_years.options,
          required: true,
          visibleIf: (answers) => 
            answers.green_card_how === 'marriage' && 
            answers.marriage_sponsor_type === 'usc_spouse' && 
            (answers.still_married_usc === 'yes_living_together' || answers.still_married_usc === 'yes_not_living_together'),
          next: (answers) => answers.lived_in_us_3_years === 'yes' ? 'trips_over_6_months' : 'END'
        },
        green_card_date: {
          id: 'green_card_date',
          kind: 'date',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].green_card_date.prompt,
          required: true,
          visibleIf: (answers) => {
            if (answers.green_card_how !== 'marriage') return true;
            if (answers.marriage_sponsor_type === 'lpr_spouse' || answers.marriage_sponsor_type === 'not_marriage') return true;
            if (answers.still_married_usc === 'no_divorced') return true;
            return false;
          },
          next: () => 'lived_in_us_5_years'
        },
        lived_in_us_5_years: {
          id: 'lived_in_us_5_years',
          kind: 'confirm',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].lived_in_us_5_years.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].lived_in_us_5_years.options,
          required: true,
          visibleIf: (answers) => {
            if (answers.green_card_how !== 'marriage') return true;
            if (answers.marriage_sponsor_type === 'lpr_spouse' || answers.marriage_sponsor_type === 'not_marriage') return true;
            if (answers.still_married_usc === 'no_divorced') return true;
            return false;
          },
          next: (answers) => answers.lived_in_us_5_years === 'yes' ? 'trips_over_6_months' : 'END'
        },
        trips_over_6_months: {
          id: 'trips_over_6_months',
          kind: 'confirm',
          prompt: t.quoteModal.flows['citizenship-naturalization-n400'].trips_over_6_months.prompt,
          options: t.quoteModal.flows['citizenship-naturalization-n400'].trips_over_6_months.options,
          required: true,
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
