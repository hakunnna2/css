import React from 'react';
import { Member, Event } from '../types';

interface MemberCardProps {
  member: Member;
  events: Event[];
}

const MemberCard: React.FC<MemberCardProps> = ({ member, events }) => {
  const participatedEventDetails = events
    .map(event => {
      const participation = event.participants.find(p => p.memberId === member._id);
      return participation ? { ...event, participation } : null;
    })
    .filter(Boolean);

  const totalPoints = participatedEventDetails.reduce((sum, event) => sum + (event?.participation.points || 0), 0);

  const statusStyles = {
    present: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    absent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    unmarked: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
        <div className="p-6 bg-indigo-600 dark:bg-indigo-800 text-white flex justify-between items-start">
            <div>
                <h3 className="text-2xl font-bold">{member.name}</h3>
                <div className="text-sm opacity-90 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <p><strong>CNI:</strong> {member.cni || 'N/A'}</p>
                    <p><strong>CNE:</strong> {member.cne || 'N/A'}</p>
                    <p><strong>School Level:</strong> {member.schoolLevel || 'N/A'}</p>
                    <p><strong>WhatsApp:</strong> {member.whatsapp || 'N/A'}</p>
                </div>
            </div>
            <div className="text-center bg-white/20 p-3 rounded-lg">
                <div className="text-3xl font-bold">{totalPoints}</div>
                <div className="text-xs font-medium uppercase tracking-wider">Total Points</div>
            </div>
        </div>
      <div className="p-6">
        <h4 className="font-semibold text-lg mb-3 border-b pb-2 dark:border-gray-700">Participated Events</h4>
        {participatedEventDetails.length > 0 ? (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {participatedEventDetails.map(event => (
              event && <li key={event._id} className="grid grid-cols-3 items-center text-sm p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 gap-2">
                <div className="col-span-1">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="col-span-1 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[event.participation.status]}`}>
                        {event.participation.status}
                    </span>
                </div>
                <div className="col-span-1 text-right font-semibold">
                    {event.participation.points} Points
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No event participation recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default MemberCard;
