export interface Member {
  _id?: string;
  name: string;
  cni?: string;
  cne?: string;
  schoolLevel?: string;
  whatsapp?: string;
}

export interface Participant {
  memberId: string;
  status: 'present' | 'absent' | 'unmarked';
  points: number;
}

export interface Event {
  _id?: string;
  name: string;
  date: string;
  participants: Participant[];
}
