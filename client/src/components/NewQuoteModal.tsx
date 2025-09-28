import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type definitions for the questionnaire system
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

type Step = 'basic-info' | 'case-type' | 'questionnaire' | 'wrap-up';

interface BasicInfo {
  fullName: string;
  email: string;
}

// Flow configuration for all case types
const FLOW_CONFIG: Record<CaseType, Flow> = {
  'family-based-immigrant-visa-immediate-relative': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: 'Great! This is for people getting a green card through a U.S. citizen or legal permanent resident family member. Is that your situation?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'relationship'
      },
      relationship: {
        id: 'relationship',
        kind: 'single',
        prompt: 'What is your relationship to the family member who can help you?',
        options: [
          { value: 'spouse', label: 'Spouse (U.S. citizen or LPR)' },
          { value: 'parent', label: 'Parent (U.S. citizen or LPR)' },
          { value: 'child', label: 'Child (U.S. citizen, 21 year or older)' },
          { value: 'other', label: 'Other' }
        ],
        required: true,
        next: () => 'location'
      },
      location: {
        id: 'location',
        kind: 'single',
        prompt: 'Are you inside the U.S. right now, or outside the U.S.?',
        options: [
          { value: 'inside', label: 'Inside the U.S.' },
          { value: 'outside', label: 'Outside the U.S.' }
        ],
        required: true,
        next: (answers) => answers.location === 'inside' ? 'inside_inspected' : 'outside_prior_benefit'
      },
      inside_inspected: {
        id: 'inside_inspected',
        kind: 'single',
        prompt: 'When you came to the U.S., were you inspected by a U.S. border officer?',
        options: [
          { value: 'yes', label: 'Yes - I was inspected and admitted' },
          { value: 'no', label: 'No - I entered without being inspected' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'inside_status'
      },
      inside_status: {
        id: 'inside_status',
        kind: 'single',
        prompt: 'What is your current legal status in the U.S.?',
        options: [
          { value: 'in_status', label: 'Are you still in legal status (*In status* means following the rules of your visa and staying in the U.S. for the period allowed on your I-94.)' },
          { value: 'out_status', label: 'Are you out of status (*Out of Status* means you have stayed in the U.S. past the time allowed.)' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: (answers) => answers.inside_status === 'in_status' ? 'inside_status_in_status_visa' : 'inside_status_out_status_benefit'
      },
      inside_status_in_status_visa: {
        id: 'inside_status_in_status_visa',
        kind: 'textarea',
        prompt: 'If you were inspected or entered the U.S. with a visa, please tell us what type of visa or entry you used (e.g., tourist, student, work, humanitarian parole).',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'in_status',
        next: () => 'inside_status_in_status_help'
      },
      inside_status_in_status_help: {
        id: 'inside_status_in_status_help',
        kind: 'textarea',
        prompt: 'What type of legal assistance or immigration help do you need?',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'in_status',
        next: () => 'inside_married_before'
      },
      inside_status_out_status_benefit: {
        id: 'inside_status_out_status_benefit',
        kind: 'confirm',
        prompt: 'Ever applied for an immigration benefit?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status',
        next: (answers) => answers.inside_status_out_status_benefit === 'yes' ? 'inside_status_out_status_benefit_explain' : 'inside_status_out_status_help'
      },
      inside_status_out_status_benefit_explain: {
        id: 'inside_status_out_status_benefit_explain',
        kind: 'textarea',
        prompt: 'If the answer is yes, please provide an explanation',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status' && answers.inside_status_out_status_benefit === 'yes',
        next: () => 'inside_status_out_status_help'
      },
      inside_status_out_status_help: {
        id: 'inside_status_out_status_help',
        kind: 'textarea',
        prompt: 'What type of legal assistance or immigration help do you need?',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status',
        next: () => 'inside_married_before'
      },
      inside_married_before: {
        id: 'inside_married_before',
        kind: 'confirm',
        prompt: 'Have you ever been married before?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'END'
      },
      outside_prior_benefit: {
        id: 'outside_prior_benefit',
        kind: 'textarea',
        prompt: 'Have you ever applied for an immigration benefit before? If yes, what happened?',
        required: true,
        visibleIf: (answers) => answers.location === 'outside',
        next: () => 'outside_help_type'
      },
      outside_help_type: {
        id: 'outside_help_type',
        kind: 'textarea',
        prompt: 'What kind of legal help are you looking for right now?',
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
        prompt: 'Great! This is for people in the U.S. due to fear of being persecuted if they return to their home country. Is that your situation?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'inspected'
      },
      inspected: {
        id: 'inspected',
        kind: 'single',
        prompt: 'When you came to the U.S., were you inspected by a U.S. border officer?',
        options: [
          { value: 'yes', label: 'Yes - I was inspected and admitted' },
          { value: 'no', label: 'No - I entered without being inspected' }
        ],
        required: true,
        next: () => 'entry_date'
      },
      entry_date: {
        id: 'entry_date',
        kind: 'text',
        prompt: 'What date did you enter? Please give the date or your best guess.',
        required: true,
        next: () => 'afraid_return'
      },
      afraid_return: {
        id: 'afraid_return',
        kind: 'textarea',
        prompt: 'Are you afraid to return back to your home country? If yes, can you tell me why?',
        required: true,
        next: () => 'immigration_court'
      },
      immigration_court: {
        id: 'immigration_court',
        kind: 'confirm',
        prompt: 'Have you ever been placed in immigration court or faced deportation proceedings? Has the U.S. government sent you to immigration court or removal (deportation) proceedings?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
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
        prompt: 'Great! You are a conditional permanent resident who obtained status through marriage?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: 'What is the start date on your green card?',
        required: true,
        next: () => 'marital_evidence'
      },
      marital_evidence: {
        id: 'marital_evidence',
        kind: 'single',
        prompt: 'On a scale of 1-10, how much marital evidence did you submit with your original green card application? (1 = very little and 10 = a lot).',
        options: [
          { value: '1', label: '1 - Very little' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
          { value: '6', label: '6' },
          { value: '7', label: '7' },
          { value: '8', label: '8' },
          { value: '9', label: '9' },
          { value: '10', label: '10 - A lot' }
        ],
        required: true,
        next: () => 'filing_type'
      },
      filing_type: {
        id: 'filing_type',
        kind: 'single',
        prompt: 'How will you file your application? (check one)',
        options: [
          { value: 'joint', label: 'Together with my spouse ("joint filing")' },
          { value: 'waiver', label: 'On my own (waiver)' }
        ],
        required: true,
        next: () => 'marriage_situation'
      },
      marriage_situation: {
        id: 'marriage_situation',
        kind: 'single',
        prompt: 'What is your current marriage situation?',
        options: [
          { value: 'married_together', label: 'Married living together' },
          { value: 'married_apart', label: 'Married but living apart' },
          { value: 'divorced', label: 'Divorced' },
          { value: 'widow', label: 'Widow(er)' }
        ],
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
        prompt: 'Great! You are a U.S. citizen petitioning for your fiance(e) to come to the U.S. to get married within 90 days of arrival?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'met_in_person'
      },
      met_in_person: {
        id: 'met_in_person',
        kind: 'confirm',
        prompt: 'Have you and your fiance(e) met in person within the last 2 years?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'married_before'
      },
      married_before: {
        id: 'married_before',
        kind: 'confirm',
        prompt: 'Has either you (the petitioner) or your fiance(e) (the beneficiary) ever been married before?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'fiance_outside_us'
      },
      fiance_outside_us: {
        id: 'fiance_outside_us',
        kind: 'confirm',
        prompt: 'Is your fiance(e) outside the U.S.?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'prior_immigration_benefit'
      },
      prior_immigration_benefit: {
        id: 'prior_immigration_benefit',
        kind: 'confirm',
        prompt: 'Has your fiance(e) applied for an immigration benefit before?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: (answers) => answers.prior_immigration_benefit === 'yes' ? 'prior_immigration_explanation' : 'END'
      },
      prior_immigration_explanation: {
        id: 'prior_immigration_explanation',
        kind: 'textarea',
        prompt: 'Please briefly explain what immigration benefit your fiance(e) applied for and what happened.',
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
        prompt: 'How did you get your Green Card? Please select one:',
        options: [
          { value: 'family', label: 'Family sponsorship (through a U.S. citizen or permanent resident)' },
          { value: 'marriage', label: 'Marriage' },
          { value: 'work', label: 'Work' },
          { value: 'asylum', label: 'Asylum' },
          { value: 'other', label: 'Other' }
        ],
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: 'What is the start date on your green card? Please share the date printed on your card.',
        required: true,
        next: () => 'trips_over_6_months'
      },
      trips_over_6_months: {
        id: 'trips_over_6_months',
        kind: 'confirm',
        prompt: 'Since getting your green card, have you taken any trips outside the U.S. for more than 6 months at one time?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'lived_in_us_5_years'
      },
      lived_in_us_5_years: {
        id: 'lived_in_us_5_years',
        kind: 'confirm',
        prompt: 'In the last 5 years, have you lived in the U.S. at least half the time?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'marriage_3_year_rule'
      },
      marriage_3_year_rule: {
        id: 'marriage_3_year_rule',
        kind: 'confirm',
        prompt: 'If you are applying through marriage on the 3-year rule: In the last 3 years, have you lived in the U.S. at least half the time while married and living with your U.S. citizen spouse?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_applicable', label: 'Not applicable - I am not applying through marriage' }
        ],
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
        prompt: 'What type of legal assistance or immigration help do you need?',
        required: true,
        next: () => 'END'
      }
    }
  }
};

// Spanish translations for all flow configurations
const FLOW_CONFIG_ES: Record<CaseType, Flow> = {
  'family-based-immigrant-visa-immediate-relative': {
    start: 'confirm',
    nodes: {
      confirm: {
        id: 'confirm',
        kind: 'confirm',
        prompt: '¡Excelente! Esto es para personas que obtienen una tarjeta verde a través de un familiar ciudadano estadounidense o residente legal permanente. ¿Es esa su situación?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'relationship'
      },
      relationship: {
        id: 'relationship',
        kind: 'single',
        prompt: '¿Cuál es su relación con el familiar que puede ayudarle?',
        options: [
          { value: 'spouse', label: 'Cónyuge (ciudadano estadounidense o residente legal permanente)' },
          { value: 'parent', label: 'Padre/Madre (ciudadano estadounidense o residente legal permanente)' },
          { value: 'child', label: 'Hijo/Hija (ciudadano estadounidense, 21 años o mayor)' },
          { value: 'other', label: 'Otro' }
        ],
        required: true,
        next: () => 'location'
      },
      location: {
        id: 'location',
        kind: 'single',
        prompt: '¿Está usted dentro de los Estados Unidos ahora mismo, o fuera de los Estados Unidos?',
        options: [
          { value: 'inside', label: 'Dentro de los Estados Unidos' },
          { value: 'outside', label: 'Fuera de los Estados Unidos' }
        ],
        required: true,
        next: (answers) => answers.location === 'inside' ? 'inside_inspected' : 'outside_prior_benefit'
      },
      inside_inspected: {
        id: 'inside_inspected',
        kind: 'single',
        prompt: 'Cuando llegó a los Estados Unidos, ¿fue inspeccionado por un oficial fronterizo estadounidense?',
        options: [
          { value: 'yes', label: 'Sí - Fui inspeccionado y admitido' },
          { value: 'no', label: 'No - Entré sin ser inspeccionado' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'inside_status'
      },
      inside_status: {
        id: 'inside_status',
        kind: 'single',
        prompt: '¿Cuál es su estatus legal actual en los Estados Unidos?',
        options: [
          { value: 'in_status', label: '¿Sigue en estatus legal? (*En estatus* significa seguir las reglas de su visa y permanecer en los Estados Unidos por el período permitido en su I-94.)' },
          { value: 'out_status', label: '¿Está fuera de estatus? (*Fuera de estatus* significa que se ha quedado en los Estados Unidos más allá del tiempo permitido.)' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: (answers) => answers.inside_status === 'in_status' ? 'inside_status_in_status_visa' : 'inside_status_out_status_benefit'
      },
      inside_status_in_status_visa: {
        id: 'inside_status_in_status_visa',
        kind: 'textarea',
        prompt: 'Si fue inspeccionado o entró a los Estados Unidos con una visa, por favor díganos qué tipo de visa o entrada utilizó (por ejemplo, turista, estudiante, trabajo, libertad condicional humanitaria).',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'in_status',
        next: () => 'inside_status_in_status_help'
      },
      inside_status_in_status_help: {
        id: 'inside_status_in_status_help',
        kind: 'textarea',
        prompt: '¿Qué tipo de asistencia legal o ayuda de inmigración necesita?',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'in_status',
        next: () => 'inside_married_before'
      },
      inside_status_out_status_benefit: {
        id: 'inside_status_out_status_benefit',
        kind: 'confirm',
        prompt: '¿Alguna vez ha solicitado un beneficio de inmigración?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status',
        next: (answers) => answers.inside_status_out_status_benefit === 'yes' ? 'inside_status_out_status_benefit_explain' : 'inside_status_out_status_help'
      },
      inside_status_out_status_benefit_explain: {
        id: 'inside_status_out_status_benefit_explain',
        kind: 'textarea',
        prompt: 'Si la respuesta es sí, por favor proporcione una explicación',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status' && answers.inside_status_out_status_benefit === 'yes',
        next: () => 'inside_status_out_status_help'
      },
      inside_status_out_status_help: {
        id: 'inside_status_out_status_help',
        kind: 'textarea',
        prompt: '¿Qué tipo de asistencia legal o ayuda de inmigración necesita?',
        required: true,
        visibleIf: (answers) => answers.location === 'inside' && answers.inside_status === 'out_status',
        next: () => 'inside_married_before'
      },
      inside_married_before: {
        id: 'inside_married_before',
        kind: 'confirm',
        prompt: '¿Ha estado casado(a) antes?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        visibleIf: (answers) => answers.location === 'inside',
        next: () => 'END'
      },
      outside_prior_benefit: {
        id: 'outside_prior_benefit',
        kind: 'textarea',
        prompt: '¿Ha solicitado algún beneficio de inmigración antes? Si es así, ¿qué pasó?',
        required: true,
        visibleIf: (answers) => answers.location === 'outside',
        next: () => 'outside_help_type'
      },
      outside_help_type: {
        id: 'outside_help_type',
        kind: 'textarea',
        prompt: '¿Qué tipo de ayuda legal está buscando en este momento?',
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
        prompt: '¡Excelente! Esto es para personas en los Estados Unidos debido al temor de ser perseguidas si regresan a su país de origen. ¿Es esa su situación?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'inspected'
      },
      inspected: {
        id: 'inspected',
        kind: 'single',
        prompt: 'Cuando llegó a los Estados Unidos, ¿fue inspeccionado por un oficial fronterizo estadounidense?',
        options: [
          { value: 'yes', label: 'Sí - Fui inspeccionado y admitido' },
          { value: 'no', label: 'No - Entré sin ser inspeccionado' }
        ],
        required: true,
        next: () => 'entry_date'
      },
      entry_date: {
        id: 'entry_date',
        kind: 'text',
        prompt: '¿Qué fecha entró? Por favor proporcione la fecha o su mejor estimación.',
        required: true,
        next: () => 'afraid_return'
      },
      afraid_return: {
        id: 'afraid_return',
        kind: 'textarea',
        prompt: '¿Tiene miedo de regresar a su país de origen? Si es así, ¿puede decirme por qué?',
        required: true,
        next: () => 'immigration_court'
      },
      immigration_court: {
        id: 'immigration_court',
        kind: 'confirm',
        prompt: '¿Ha sido puesto alguna vez en corte de inmigración o ha enfrentado procedimientos de deportación? ¿El gobierno de los Estados Unidos lo ha enviado a corte de inmigración o procedimientos de remoción (deportación)?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
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
        prompt: '¡Excelente! ¿Usted es un residente permanente condicional que obtuvo estatus a través del matrimonio?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: '¿Cuál es la fecha de inicio en su tarjeta verde?',
        required: true,
        next: () => 'marital_evidence'
      },
      marital_evidence: {
        id: 'marital_evidence',
        kind: 'single',
        prompt: 'En una escala del 1-10, ¿cuánta evidencia matrimonial presentó con su solicitud original de tarjeta verde? (1 = muy poca y 10 = mucha).',
        options: [
          { value: '1', label: '1 - Muy poca' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
          { value: '6', label: '6' },
          { value: '7', label: '7' },
          { value: '8', label: '8' },
          { value: '9', label: '9' },
          { value: '10', label: '10 - Mucha' }
        ],
        required: true,
        next: () => 'filing_type'
      },
      filing_type: {
        id: 'filing_type',
        kind: 'single',
        prompt: '¿Cómo presentará su solicitud? (seleccione una)',
        options: [
          { value: 'joint', label: 'Junto con mi cónyuge ("presentación conjunta")' },
          { value: 'waiver', label: 'Por mi cuenta (exención)' }
        ],
        required: true,
        next: () => 'marriage_situation'
      },
      marriage_situation: {
        id: 'marriage_situation',
        kind: 'single',
        prompt: '¿Cuál es su situación matrimonial actual?',
        options: [
          { value: 'married_together', label: 'Casado(a) viviendo juntos' },
          { value: 'married_apart', label: 'Casado(a) pero viviendo separados' },
          { value: 'divorced', label: 'Divorciado(a)' },
          { value: 'widow', label: 'Viudo(a)' }
        ],
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
        prompt: '¡Excelente! ¿Usted es un ciudadano estadounidense solicitando para que su prometido(a) venga a los Estados Unidos para casarse dentro de 90 días de llegada?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'met_in_person'
      },
      met_in_person: {
        id: 'met_in_person',
        kind: 'confirm',
        prompt: '¿Se han conocido usted y su prometido(a) en persona dentro de los últimos 2 años?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'married_before'
      },
      married_before: {
        id: 'married_before',
        kind: 'confirm',
        prompt: '¿Han estado casados antes usted (el peticionario) o su prometido(a) (el beneficiario)?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'fiance_outside_us'
      },
      fiance_outside_us: {
        id: 'fiance_outside_us',
        kind: 'confirm',
        prompt: '¿Está su prometido(a) fuera de los Estados Unidos?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'prior_immigration_benefit'
      },
      prior_immigration_benefit: {
        id: 'prior_immigration_benefit',
        kind: 'confirm',
        prompt: '¿Ha solicitado su prometido(a) un beneficio de inmigración antes?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: (answers) => answers.prior_immigration_benefit === 'yes' ? 'prior_immigration_explanation' : 'END'
      },
      prior_immigration_explanation: {
        id: 'prior_immigration_explanation',
        kind: 'textarea',
        prompt: 'Por favor explique brevemente qué beneficio de inmigración solicitó su prometido(a) y qué pasó.',
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
        prompt: '¿Cómo obtuvo su Tarjeta Verde? Por favor seleccione una:',
        options: [
          { value: 'family', label: 'Patrocinio familiar (a través de un ciudadano estadounidense o residente permanente)' },
          { value: 'marriage', label: 'Matrimonio' },
          { value: 'work', label: 'Trabajo' },
          { value: 'asylum', label: 'Asilo' },
          { value: 'other', label: 'Otro' }
        ],
        required: true,
        next: () => 'green_card_date'
      },
      green_card_date: {
        id: 'green_card_date',
        kind: 'text',
        prompt: '¿Cuál es la fecha de inicio en su tarjeta verde? Por favor comparta la fecha impresa en su tarjeta.',
        required: true,
        next: () => 'trips_over_6_months'
      },
      trips_over_6_months: {
        id: 'trips_over_6_months',
        kind: 'confirm',
        prompt: 'Desde que obtuvo su tarjeta verde, ¿ha tomado viajes fuera de los Estados Unidos por más de 6 meses a la vez?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'lived_in_us_5_years'
      },
      lived_in_us_5_years: {
        id: 'lived_in_us_5_years',
        kind: 'confirm',
        prompt: 'En los últimos 5 años, ¿ha vivido en los Estados Unidos al menos la mitad del tiempo?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' }
        ],
        required: true,
        next: () => 'marriage_3_year_rule'
      },
      marriage_3_year_rule: {
        id: 'marriage_3_year_rule',
        kind: 'confirm',
        prompt: 'Si está solicitando a través del matrimonio bajo la regla de 3 años: En los últimos 3 años, ¿ha vivido en los Estados Unidos al menos la mitad del tiempo mientras estuvo casado(a) y viviendo con su cónyuge ciudadano estadounidense?',
        options: [
          { value: 'yes', label: 'Sí' },
          { value: 'no', label: 'No' },
          { value: 'not_applicable', label: 'No aplica - No estoy solicitando a través del matrimonio' }
        ],
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
        prompt: '¿Qué tipo de asistencia legal o ayuda de inmigración necesita?',
        required: true,
        next: () => 'END'
      }
    }
  }
};

export function NewQuoteModal({ isOpen, onClose }: NewQuoteModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [caseType, setCaseType] = useState<CaseType | ''>('');
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    fullName: '',
    email: ''
  });
  const [currentNodeKey, setCurrentNodeKey] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtherCaseDialog, setShowOtherCaseDialog] = useState<boolean>(false);

  const [location] = useLocation();
  const isSpanish = location.startsWith('/es');
  const { toast } = useToast();

  // Spanish UI labels
  const labels = isSpanish ? {
    title: 'Obtener Cotización',
    subtitle: 'Complete nuestro formulario de admisión para ser emparejado con un abogado de inmigración experimentado',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    caseType: 'Tipo de Caso',
    additionalDetails: '¿Le gustaría agregar más detalles sobre su caso? Esto ayuda al abogado a entender mejor su caso.',
    additionalDetailsPlaceholder: 'Opcional: Comparta cualquier detalle adicional sobre su caso...',
    continueButton: 'Continuar',
    backButton: 'Atrás',
    submitButton: 'Enviar Solicitud',
    submittingButton: 'Enviando...',
    cancelButton: 'Cancelar',
    thankYou: '¡Gracias!',
    thankYouSubtitle: 'Lo emparejaremos con un abogado experimentado que maneja este tipo de caso y se pondrán en contacto pronto.',
    legalDisclaimer: 'Descargo de Responsabilidad Legal: Este asistente de IA proporciona solo información general y no constituye asesoramiento legal. Para asuntos legales específicos, consulte con un abogado de inmigración calificado.',
    otherDialogTitle: '¡Gracias por su interés!',
    otherDialogMessage: `Apreciamos su interés! Actualmente, proporcionamos servicios para estas categorías principales:
• Tarjeta Verde a través de un Cónyuge o Familiar (Tarjeta Verde Basada en Familia)  
• Visa de Prometido(a) (Visa K-1)
• Remoción de Condiciones en una Tarjeta Verde Condicional de 2 Años (Tarjeta Verde Permanente)
• Asilo o Protección contra la Persecución
• Ciudadanía Estadounidense (Naturalización / Ciudadanía)

Aunque es posible que no podamos proporcionar una cotización para otros tipos de casos, enviaremos su información a un abogado en nuestra base de datos que pueda ayudarle. Por favor, vuelva a consultar ya que estamos expandiendo constantemente y agregando nuevas categorías.`,
    closeButton: 'Cerrar'
  } : {
    title: 'Get Quote',
    subtitle: 'Complete our intake form to get matched with an experienced immigration attorney',
    fullName: 'Full Name',
    email: 'Email Address',
    caseType: 'Case Type',
    additionalDetails: 'Would you like to add any more details about your case? This helps the attorney understand your case better.',
    additionalDetailsPlaceholder: 'Optional: Share any additional details about your case...',
    continueButton: 'Continue',
    backButton: 'Back',
    submitButton: 'Submit Request',
    submittingButton: 'Submitting...',
    cancelButton: 'Cancel',
    thankYou: 'Thank You!',
    thankYouSubtitle: 'We\'ll match you with an experienced attorney who handles this type of case and they\'ll be in touch soon.',
    legalDisclaimer: 'Legal Disclaimer: This AI assistant provides general information only and does not constitute legal advice. For specific legal matters, please consult with a qualified immigration attorney.',
    otherDialogTitle: 'Thank You for Your Interest!',
    otherDialogMessage: `We appreciate your interest! Currently, we provide services for these main categories:
• Green Card through a Spouse or Family Member (Family-Based Green Card)
• Fiancé(e) Visa (K-1 Visa)  
• Removing Conditions on a 2-Year Conditional Green Card (Permanent Green Card)
• Asylum or Protection from Persecution
• U.S. Citizenship (Naturalization / Citizenship)

While we may not be able to provide a quote for other types of cases, we will forward your information to an attorney in our database who may be able to assist you. Please check back as we are constantly expanding and adding new categories.`,
    closeButton: 'Close'
  };

  // Case type options (exactly 5 as specified)
  const caseTypeOptions = isSpanish ? [
    {
      value: 'family-based-immigrant-visa-immediate-relative' as CaseType,
      label: 'Tarjeta Verde a través de un Cónyuge o Familiar ("Tarjeta Verde Basada en Familia")'
    },
    {
      value: 'k1-fiance-visa' as CaseType,
      label: 'Visa de Prometido(a) ("Visa K-1")'
    },
    {
      value: 'removal-of-conditions' as CaseType,
      label: 'Hacer Permanente mi Tarjeta Verde Condicional de 2 Años ("Remoción de Condiciones")'
    },
    {
      value: 'asylum-affirmative' as CaseType,
      label: 'Asilo o Protección contra la Persecución'
    },
    {
      value: 'citizenship-naturalization-n400' as CaseType,
      label: 'Ciudadanía Estadounidense ("Naturalización") - Solicitar para convertirse en Ciudadano Estadounidense'
    },
    {
      value: 'other' as CaseType,
      label: 'Otro'
    }
  ] : [
    {
      value: 'family-based-immigrant-visa-immediate-relative' as CaseType,
      label: 'Green Card through a Spouse or Family Member ("Family-Based Green Card") Family'
    },
    {
      value: 'k1-fiance-visa' as CaseType,
      label: 'Fiance(e) Visa ("K-1 visa")'
    },
    {
      value: 'removal-of-conditions' as CaseType,
      label: 'Make My 2-Year Conditional Green Card Permanent ("Removal of Conditions ")'
    },
    {
      value: 'asylum-affirmative' as CaseType,
      label: 'Asylum or Protection From Persecution'
    },
    {
      value: 'citizenship-naturalization-n400' as CaseType,
      label: 'U.S. Citizenship ("Naturalization") - Applying to become a U.S. Citizen Naturalization / Citizenship'
    },
    {
      value: 'other' as CaseType,
      label: 'Other'
    }
  ];

  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!basicInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!basicInfo.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCurrentQuestionValid = (): boolean => {
    if (!caseType || currentStep !== 'questionnaire') return true;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion?.required) return true;
    
    const answer = answers[currentNodeKey];
    return !(!answer || (typeof answer === 'string' && !answer.trim()));
  };

  const validateCurrentQuestion = (): boolean => {
    if (!caseType || currentStep !== 'questionnaire') return true;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion?.required) return true;
    
    const answer = answers[currentNodeKey];
    if (!answer || (typeof answer === 'string' && !answer.trim())) {
      setErrors({ [currentNodeKey]: 'This field is required' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleBasicInfoNext = () => {
    if (validateBasicInfo()) {
      setCurrentStep('case-type');
    }
  };

  const handleCaseTypeNext = () => {
    if (caseType) {
      const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
      setCurrentNodeKey(flow.start);
      setNavigationHistory([]); // Reset navigation history for new flow
      setAnswers({}); // Clear previous answers to avoid stale data
      setErrors({});
      setCurrentStep('questionnaire');
    }
  };

  const handleQuestionNext = () => {
    if (!validateCurrentQuestion() || !caseType) return;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (currentQuestion.next) {
      const nextKey = currentQuestion.next(answers);
      // Always track current node in navigation history
      setNavigationHistory(prev => [...prev, currentNodeKey]);
      
      if (nextKey === 'END') {
        // Special handling for "other" case type - show custom dialog instead of going to wrap-up
        if (caseType === 'other') {
          handleOtherCaseSubmission();
        } else {
          setCurrentStep('wrap-up');
        }
      } else {
        setCurrentNodeKey(nextKey);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'case-type') {
      setCurrentStep('basic-info');
    } else if (currentStep === 'questionnaire') {
      // Use navigation history for accurate back navigation
      if (navigationHistory.length > 0) {
        const previousNodeKey = navigationHistory[navigationHistory.length - 1];
        setNavigationHistory(prev => prev.slice(0, -1));
        setCurrentNodeKey(previousNodeKey);
      } else {
        // If no history, go back to case-type (we're at the start)
        setCurrentStep('case-type');
      }
    } else if (currentStep === 'wrap-up') {
      // Go back to the last question using navigation history
      if (navigationHistory.length > 0) {
        const lastNodeKey = navigationHistory[navigationHistory.length - 1];
        setCurrentNodeKey(lastNodeKey);
        setCurrentStep('questionnaire');
      } else if (caseType) {
        // If no history, go to the start of the flow
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        setCurrentNodeKey(flow.start);
        setCurrentStep('questionnaire');
      }
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create transcript of questions and answers in order
      const transcript: Array<{ question: string; answer: string }> = [];
      
      if (caseType) {
        const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
        // Create ordered transcript based on navigation history + current answers
        const questionOrder = [...navigationHistory, currentNodeKey];
        
        questionOrder.forEach((questionId) => {
          const question = flow.nodes[questionId];
          const answer = answers[questionId];
          if (question && answer !== undefined) {
            let answerText = String(answer);
            if (question.options) {
              const option = question.options.find(opt => opt.value === answer);
              answerText = option?.label || answerText;
            }
            transcript.push({
              question: question.prompt,
              answer: answerText
            });
          }
        });
      }

      // Format data to match existing backend endpoint
      const submissionData = {
        firstName: basicInfo.fullName.split(' ')[0] || basicInfo.fullName,
        lastName: basicInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: basicInfo.email,
        caseType,
        formResponses: {
          answers,
          additionalDetails,
          transcript,
          submittedAt: new Date().toISOString()
        }
      };

      // POST to structured intakes endpoint
      await apiRequest('/api/structured-intakes', {
        method: 'POST',
        body: submissionData
      });

      toast({
        title: 'Quote Request Submitted',
        description: 'Thank you! An experienced attorney will be in touch soon.',
        variant: 'default'
      });

      handleClose();
    } catch (error) {
      console.error('Error submitting intake:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtherCaseSubmission = async () => {
    setIsSubmitting(true);
    
    try {
      // Save the submission to the database
      const submissionData = {
        firstName: basicInfo.fullName.split(' ')[0] || basicInfo.fullName,
        lastName: basicInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: basicInfo.email,
        caseType: 'other',
        formResponses: {
          answers,
          additionalDetails,
          submittedAt: new Date().toISOString()
        }
      };

      await apiRequest('/api/structured-intakes', {
        method: 'POST',
        body: submissionData
      });

      // Show the custom dialog message
      setShowOtherCaseDialog(true);
    } catch (error) {
      console.error('Error submitting other case intake:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('basic-info');
    setCaseType('');
    setBasicInfo({ fullName: '', email: '' });
    setCurrentNodeKey('');
    setAnswers({});
    setAdditionalDetails('');
    setErrors({});
    setNavigationHistory([]);
    setIsSubmitting(false);
    setShowOtherCaseDialog(false);
    onClose();
  };

  const renderQuestion = () => {
    if (!caseType) return null;
    
    const flow = (isSpanish ? FLOW_CONFIG_ES : FLOW_CONFIG)[caseType];
    const currentQuestion = flow.nodes[currentNodeKey];
    
    if (!currentQuestion) return null;

    const answer = answers[currentNodeKey];
    const error = errors[currentNodeKey];

    const updateAnswer = (value: Answer) => {
      setAnswers(prev => ({
        ...prev,
        [currentNodeKey]: value
      }));
      setErrors({});
    };

    return (
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          {currentQuestion.prompt}
          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {currentQuestion.kind === 'confirm' && currentQuestion.options && (
          <RadioGroup 
            value={String(answer || '')} 
            onValueChange={updateAnswer}
            data-testid={`radio-group-${currentQuestion.id}`}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  data-testid={`radio-${option.value}`}
                />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.kind === 'single' && currentQuestion.options && (
          <RadioGroup 
            value={String(answer || '')} 
            onValueChange={updateAnswer}
            data-testid={`radio-group-${currentQuestion.id}`}
          >
            {currentQuestion.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value}
                  data-testid={`radio-${option.value}`}
                />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.kind === 'text' && (
          <Input
            value={String(answer || '')}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Enter your answer"
            data-testid={`input-${currentQuestion.id}`}
          />
        )}

        {currentQuestion.kind === 'textarea' && (
          <Textarea
            value={String(answer || '')}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="Enter your answer"
            rows={3}
            data-testid={`textarea-${currentQuestion.id}`}
          />
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Get Your Legal Quote</h2>
              <p className="text-gray-600 mt-2">Tell us about yourself to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">{labels.fullName} <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  value={basicInfo.fullName}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  data-testid="input-full-name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">{labels.email} <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleBasicInfoNext} disabled={!basicInfo.fullName || !basicInfo.email} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'case-type':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Please choose the closest option:</h2>
            </div>

            <div className="space-y-4">
              <RadioGroup value={caseType} onValueChange={(value) => setCaseType(value as CaseType)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseTypeOptions.map((caseTypeOption) => (
                  <div key={caseTypeOption.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value={caseTypeOption.value} id={caseTypeOption.value} className="mt-1" data-testid={`radio-${caseTypeOption.value}`} />
                    <Label htmlFor={caseTypeOption.value} className="flex-1 cursor-pointer">
                      <div className="font-medium text-gray-900">{caseTypeOption.label}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button onClick={handleCaseTypeNext} disabled={!caseType} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'questionnaire':
        return (
          <div className="space-y-6">
            {renderQuestion()}
            
            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button onClick={handleQuestionNext} disabled={!checkCurrentQuestionValid()} data-testid="button-continue">
                {labels.continueButton} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'wrap-up':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{labels.thankYou}</h2>
              <p className="text-gray-600 mt-2">
                {labels.thankYouSubtitle}
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{isSpanish ? 'Descargo de Responsabilidad Legal:' : 'Legal Disclaimer:'}</strong> {labels.legalDisclaimer}
              </p>
            </div>

            {/* Optional Details */}
            <div className="space-y-4">
              <Label htmlFor="additionalDetails">
                {labels.additionalDetails}
              </Label>
              <Textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={labels.additionalDetailsPlaceholder}
                rows={4}
                data-testid="textarea-additional-details"
              />
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" /> {labels.backButton}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50" 
                data-testid="button-submit"
              >
                {isSubmitting ? labels.submittingButton : labels.submitButton}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`${currentStep === 'case-type' ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className="sr-only">
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>
              {labels.subtitle}
            </DialogDescription>
          </DialogHeader>
          {renderStep()}
        </DialogContent>
      </Dialog>

      {/* Dialog for "Other" case type submissions */}
      <Dialog open={showOtherCaseDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{labels.otherDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line">
              {labels.otherDialogMessage}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                {labels.closeButton}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}