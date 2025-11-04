// components/UserView.tsx (REPLACE the whole file)

import React, { useState } from 'react';
// Import the correct types from your central types file
import { Member, PopulatedEvent } from '../types';

interface UserViewProps {
  members: Member[];
  events: PopulatedEvent[]; // <-- Use PopulatedEvent here
}

const UserView: React.FC<UserViewProps> = ({ members, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundMember, setFoundMember] = useState<Member | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.cni?.toLowerCase() === searchTerm.toLowerCase());
    setFoundMember(member || null);
  };

  // Calculate total points for the found member
  const totalPoints = foundMember
    ? events.reduce((total, event) => {
        const participant = event.participants.find(p => p.memberId._id === foundMember._id);
        return total + (participant ? participant.points : 0);
      }, 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Check Your Participation</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter your CNI to find your record"
            className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      {foundMember && (
        <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-center">{foundMember.name}</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{foundMember.cni}</p>

          <div className="text-center mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-300">Total Points</p>
            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">{totalPoints}</p>
          </div>
          
          <h4 className="font-semibold mb-2">Participation History:</h4>
          <ul className="space-y-2">
            {events.map(event => {
              const participant = event.participants.find(p => p.memberId._id === foundMember._id);
              if (!participant) return null; // Don't show events the member didn't participate in

              return (
                <li key={event._id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">{participant.points} Points</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserView;