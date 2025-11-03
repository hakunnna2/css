'use client';

import React, { useState } from 'react';
import { Member, Event } from '../types';
import MemberCard from './MemberCard';

interface UserViewProps {
  members: Member[];
  events: Event[];
}

const UserView: React.FC<UserViewProps> = ({ members, events }) => {
  const [cniInput, setCniInput] = useState('');
  const [searchedMember, setSearchedMember] = useState<Member | null | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cniInput.trim()) {
      setSearchedMember(undefined);
      return;
    }
    const foundMember = members.find(m => m.cni?.trim().toLowerCase() === cniInput.trim().toLowerCase());
    setSearchedMember(foundMember || null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">Check Your Participation</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Enter your CNI to find your record and view your progress.
        </p>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="cni-search" className="sr-only">Your CNI</label>
          <input
            id="cni-search"
            type="text"
            value={cniInput}
            onChange={(e) => setCniInput(e.target.value)}
            placeholder="Enter your CNI to find your record"
            className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-8">
        {searchedMember && (
          <MemberCard
            member={searchedMember}
            events={events}
          />
        )}
        {searchedMember === null && (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-center text-yellow-800 dark:text-yellow-300">
            <p className="font-medium">Member Not Found</p>
            <p className="text-sm">No record was found with the provided CNI. Please check the number and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;
