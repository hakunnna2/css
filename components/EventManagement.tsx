// components/EventManagement.tsx (FINAL, FULLY RESPONSIVE VERSION)

import React, { useState, useMemo } from 'react';
// Import the correct types from your central types file
import { PopulatedEvent, Member } from '../types';
// Assuming you have an icons.tsx file for these. If not, you can replace the <Icon/> components with text.
import { BackIcon, ExportIcon, PlusIcon, SearchIcon, UserAddIcon } from './icons';

interface EventManagementProps {
  event: PopulatedEvent;
  allMembers: Member[];
  onAddParticipant: (eventId: string, memberId: string) => void;
  onRemoveParticipant: (eventId: string, memberId: string) => void;
  onAddNewMemberAndAdd: (eventId: string, memberData: Omit<Member, '_id'>) => void;
  onUpdateStatus: (eventId: string, memberId: string, status: 'present' | 'absent') => void;
  onUpdatePoints: (eventId: string, memberId: string, points: number) => void;
  onExportCSV: (eventId: string) => void;
  onGoBack: () => void;
}

// Sub-component for the new member form (no changes needed here)
const NewMemberForm: React.FC<{
    eventId: string;
    onAddNewMemberAndAdd: EventManagementProps['onAddNewMemberAndAdd'];
}> = ({ eventId, onAddNewMemberAndAdd }) => {
    const [formState, setFormState] = useState({ name: '', cni: '', cne: '', schoolLevel: '', whatsapp: ''});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name || !formState.cni) {
            alert("Full Name and CNI are required.");
            return;
        }
        onAddNewMemberAndAdd(eventId, formState);
        setFormState({ name: '', cni: '', cne: '', schoolLevel: '', whatsapp: ''});
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg space-y-3">
             <h4 className="font-semibold flex items-center gap-2"><UserAddIcon/>Add New Member & Assign</h4>
            <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Nom complet*" className="w-full input-style" required />
            <input type="text" name="cni" value={formState.cni} onChange={handleChange} placeholder="CNI*" className="w-full input-style" required />
            <input type="text" name="cne" value={formState.cne} onChange={handleChange} placeholder="CNE" className="w-full input-style" />
            <input type="text" name="schoolLevel" value={formState.schoolLevel} onChange={handleChange} placeholder="Niveau scolaire" className="w-full input-style" />
            <input type="text" name="whatsapp" value={formState.whatsapp} onChange={handleChange} placeholder="Numéro WhatsApp" className="w-full input-style" />
            <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <PlusIcon/><span className="ml-2">Add and Assign</span>
            </button>
        </form>
    );
};

// Main Component with Responsive Fixes
const EventManagement: React.FC<EventManagementProps> = ({
  event,
  allMembers,
  onAddParticipant,
  onRemoveParticipant,
  onAddNewMemberAndAdd,
  onUpdateStatus,
  onUpdatePoints,
  onExportCSV,
  onGoBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const availableMembers = useMemo(() => {
    const participantIds = new Set(event.participants.map(p => p.memberId._id));
    const filtered = allMembers.filter(member => !participantIds.has(member._id));
    if (!searchTerm) return filtered;
    return filtered.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.cni && m.cni.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allMembers, event.participants, searchTerm]);

  return (
    <div className="space-y-6">
      {/* RESPONSIVE HEADER: Stacks on mobile, row on medium screens up */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <button onClick={onGoBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2">
                <BackIcon />
                <span>Back to Dashboard</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{event.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
        </div>
        <button onClick={() => onExportCSV(event._id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <ExportIcon />
          <span>Export Participants CSV</span>
        </button>
      </div>

      {/* RESPONSIVE MAIN LAYOUT: 1 column on mobile/tablet, 2 on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Participants Column */}
        <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Participants ({event.participants.length})</h3>
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
            {event.participants.length > 0 ? event.participants.map(participant => (
              <div key={participant._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{participant.memberId.name}</p>
                        <p className="text-xs text-gray-500">{participant.memberId.cni}</p>
                    </div>
                    <button onClick={() => onRemoveParticipant(event._id, participant.memberId._id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                </div>
                {/* RESPONSIVE CONTROLS: Items will wrap to the next line on small screens */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => onUpdateStatus(event._id, participant.memberId._id, 'present')} className={`px-3 py-1 text-xs rounded-full ${participant.status === 'present' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Present</button>
                        <button onClick={() => onUpdateStatus(event._id, participant.memberId._id, 'absent')} className={`px-3 py-1 text-xs rounded-full ${participant.status === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>Absent</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor={`points-${participant.memberId._id}`} className="text-sm">Points:</label>
                        <input
                            id={`points-${participant.memberId._id}`}
                            type="number"
                            value={participant.points}
                            onChange={(e) => onUpdatePoints(event._id, participant.memberId._id, parseInt(e.target.value, 10))}
                            className="w-16 p-1 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500"
                            disabled={participant.status !== 'present'}
                        />
                    </div>
                </div>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No participants added yet.</p>}
          </div>
        </div>

        {/* Add Members Column */}
        <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold">Add Members</h3>
          <NewMemberForm eventId={event._id} onAddNewMemberAndAdd={onAddNewMemberAndAdd}/>

          <div className="relative">
             <h4 className="font-semibold my-4">Search Existing Members</h4>
            <input
              type="text"
              placeholder="Search by name or CNI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableMembers.map(member => (
              <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.cni}</p>
                </div>
                <button onClick={() => onAddParticipant(event._id, member._id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>
       <style>{`
          .input-style {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db; /* gray-300 */
            border-radius: 0.375rem; /* rounded-md */
          }
          .dark .input-style {
            background-color: #374151; /* dark:bg-gray-700 */
            border-color: #4b5563; /* dark:border-gray-600 */
          }
        `}</style>
    </div>
  );
};

export default EventManagement;