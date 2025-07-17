// Legal Request Status Codes
export const REQUEST_STATUS = {
  // Initial submission status
  UNDER_REVIEW: 'under_review',
  
  // Processing stages
  ATTORNEY_MATCHING: 'attorney_matching',
  QUOTES_REQUESTED: 'quotes_requested',
  QUOTES_RECEIVED: 'quotes_received',
  
  // Client interaction
  AWAITING_CLIENT_RESPONSE: 'awaiting_client_response',
  CLIENT_REVIEWING: 'client_reviewing',
  
  // Completion states
  ATTORNEY_SELECTED: 'attorney_selected',
  CASE_ASSIGNED: 'case_assigned',
  COMPLETED: 'completed',
  
  // Other states
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const;

export const STATUS_LABELS = {
  [REQUEST_STATUS.UNDER_REVIEW]: 'Under Review',
  [REQUEST_STATUS.ATTORNEY_MATCHING]: 'Matching with Attorneys',
  [REQUEST_STATUS.QUOTES_REQUESTED]: 'Quotes Requested',
  [REQUEST_STATUS.QUOTES_RECEIVED]: 'Quotes Available',
  [REQUEST_STATUS.AWAITING_CLIENT_RESPONSE]: 'Awaiting Client Response',
  [REQUEST_STATUS.CLIENT_REVIEWING]: 'Client Reviewing Options',
  [REQUEST_STATUS.ATTORNEY_SELECTED]: 'Attorney Selected',
  [REQUEST_STATUS.CASE_ASSIGNED]: 'Case Assigned',
  [REQUEST_STATUS.COMPLETED]: 'Completed',
  [REQUEST_STATUS.ON_HOLD]: 'On Hold',
  [REQUEST_STATUS.CANCELLED]: 'Cancelled',
  [REQUEST_STATUS.EXPIRED]: 'Expired',
} as const;

export const STATUS_DESCRIPTIONS = {
  [REQUEST_STATUS.UNDER_REVIEW]: 'Your request is being reviewed by our team',
  [REQUEST_STATUS.ATTORNEY_MATCHING]: 'We are finding qualified attorneys for your case',
  [REQUEST_STATUS.QUOTES_REQUESTED]: 'Attorney quotes have been requested',
  [REQUEST_STATUS.QUOTES_RECEIVED]: 'Attorney quotes are available for your review',
  [REQUEST_STATUS.AWAITING_CLIENT_RESPONSE]: 'Waiting for your response or decision',
  [REQUEST_STATUS.CLIENT_REVIEWING]: 'You are reviewing available options',
  [REQUEST_STATUS.ATTORNEY_SELECTED]: 'You have selected an attorney',
  [REQUEST_STATUS.CASE_ASSIGNED]: 'Your case has been assigned to an attorney',
  [REQUEST_STATUS.COMPLETED]: 'Your request has been completed successfully',
  [REQUEST_STATUS.ON_HOLD]: 'Your request is temporarily on hold',
  [REQUEST_STATUS.CANCELLED]: 'Your request has been cancelled',
  [REQUEST_STATUS.EXPIRED]: 'Your request has expired',
} as const;

// Status colors for UI display
export const STATUS_COLORS = {
  [REQUEST_STATUS.UNDER_REVIEW]: 'yellow',
  [REQUEST_STATUS.ATTORNEY_MATCHING]: 'blue',
  [REQUEST_STATUS.QUOTES_REQUESTED]: 'blue',
  [REQUEST_STATUS.QUOTES_RECEIVED]: 'green',
  [REQUEST_STATUS.AWAITING_CLIENT_RESPONSE]: 'orange',
  [REQUEST_STATUS.CLIENT_REVIEWING]: 'orange',
  [REQUEST_STATUS.ATTORNEY_SELECTED]: 'green',
  [REQUEST_STATUS.CASE_ASSIGNED]: 'green',
  [REQUEST_STATUS.COMPLETED]: 'green',
  [REQUEST_STATUS.ON_HOLD]: 'gray',
  [REQUEST_STATUS.CANCELLED]: 'red',
  [REQUEST_STATUS.EXPIRED]: 'red',
} as const;

// Helper function to get status info
export function getStatusInfo(status: string) {
  return {
    label: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
    description: STATUS_DESCRIPTIONS[status as keyof typeof STATUS_DESCRIPTIONS] || 'Status unknown',
    color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'gray',
  };
}

// Valid status transitions (optional workflow validation)
export const VALID_STATUS_TRANSITIONS = {
  [REQUEST_STATUS.UNDER_REVIEW]: [
    REQUEST_STATUS.ATTORNEY_MATCHING,
    REQUEST_STATUS.ON_HOLD,
    REQUEST_STATUS.CANCELLED,
  ],
  [REQUEST_STATUS.ATTORNEY_MATCHING]: [
    REQUEST_STATUS.QUOTES_REQUESTED,
    REQUEST_STATUS.ON_HOLD,
    REQUEST_STATUS.CANCELLED,
  ],
  [REQUEST_STATUS.QUOTES_REQUESTED]: [
    REQUEST_STATUS.QUOTES_RECEIVED,
    REQUEST_STATUS.ON_HOLD,
    REQUEST_STATUS.CANCELLED,
    REQUEST_STATUS.EXPIRED,
  ],
  [REQUEST_STATUS.QUOTES_RECEIVED]: [
    REQUEST_STATUS.AWAITING_CLIENT_RESPONSE,
    REQUEST_STATUS.CLIENT_REVIEWING,
    REQUEST_STATUS.EXPIRED,
  ],
  [REQUEST_STATUS.AWAITING_CLIENT_RESPONSE]: [
    REQUEST_STATUS.CLIENT_REVIEWING,
    REQUEST_STATUS.ATTORNEY_SELECTED,
    REQUEST_STATUS.EXPIRED,
  ],
  [REQUEST_STATUS.CLIENT_REVIEWING]: [
    REQUEST_STATUS.ATTORNEY_SELECTED,
    REQUEST_STATUS.AWAITING_CLIENT_RESPONSE,
    REQUEST_STATUS.EXPIRED,
  ],
  [REQUEST_STATUS.ATTORNEY_SELECTED]: [
    REQUEST_STATUS.CASE_ASSIGNED,
    REQUEST_STATUS.COMPLETED,
  ],
  [REQUEST_STATUS.CASE_ASSIGNED]: [
    REQUEST_STATUS.COMPLETED,
  ],
  [REQUEST_STATUS.ON_HOLD]: [
    REQUEST_STATUS.UNDER_REVIEW,
    REQUEST_STATUS.ATTORNEY_MATCHING,
    REQUEST_STATUS.CANCELLED,
  ],
  // Terminal states
  [REQUEST_STATUS.COMPLETED]: [],
  [REQUEST_STATUS.CANCELLED]: [],
  [REQUEST_STATUS.EXPIRED]: [],
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUS;