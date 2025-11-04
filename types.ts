// types.ts (FINAL VERSION)

export interface Member {
  _id: string;
  name: string;
  cni?: string;
  cne?: string;
  schoolLevel?: string;
  whatsapp?: string;
}

// This is a participant where we KNOW memberId is a full Member object
export interface PopulatedParticipant {
  _id: string; 
  memberId: Member; // It's always a Member, not a string
  status: 'unmarked' | 'present' | 'absent';
  points: number;
}

// The generic participant type (not used in EventManagement)
export interface Participant {
  _id: string; 
  memberId: string; // The ID of the member
  status: 'unmarked' | 'present' | 'absent';
  points: number;
}


// An Event where the participants have been populated with full Member details
export interface PopulatedEvent {
  _id: string;
  name: string;
  date: string;
  participants: PopulatedParticipant[]; // Uses the new specific type
}

// The generic Event type
export interface Event {
  _id: string;
  name: string;
  date: string;
  participants: Participant[];
}