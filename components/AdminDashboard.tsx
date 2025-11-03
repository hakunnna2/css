import React, { useState } from 'react';
import { Event } from '../types';
import { PlusIcon, UploadIcon, UserGroupIcon, ExportIcon } from './icons';

interface AdminDashboardProps {
  events: Event[];
  membersCount: number;
  onAddEvent: (name: string) => void;
  onManageEvent: (eventId: string) => void;
  onImportMembers: (file: File) => void;
  onExportAllData: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ events, membersCount, onAddEvent, onManageEvent, onImportMembers, onExportAllData }) => {
  const [eventName, setEventName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(eventName);
    setEventName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportMembers = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onImportMembers(selectedFile);
      setSelectedFile(null);
      (e.target as HTMLFormElement).reset();
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Management Controls</h2>
            <div className="space-y-6">
                {/* Add Event */}
                <form onSubmit={handleAddEvent} className="space-y-3">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Create New Session / Activity</h3>
                    <div className="flex gap-2">
                        <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g., Weekly Meeting"
                        className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                        required
                        />
                        <button type="submit" className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <PlusIcon />
                            <span className="ml-2 hidden sm:inline">Create</span>
                        </button>
                    </div>
                </form>
                {/* Import/Export */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Import Members via CSV</h3>
                    <form onSubmit={handleImportMembers} className="space-y-3">
                      <div>
                        <input 
                          id="csv-upload"
                          type="file" 
                          accept=".csv" 
                          onChange={handleFileChange} 
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900"
                        />
                      </div>
                      <button type="submit" disabled={!selectedFile} className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                        <UploadIcon />
                        <span className="ml-2">Import CSV</span>
                      </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                      Required headers: <code className="bg-gray-200 dark:bg-gray-600 p-1 rounded text-xs">Nom complet, CNI</code>.
                    </p>
                  </div>
                   <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Export All Club Data</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      Export all members and event data to a single JSON file for backup or publishing.
                    </p>
                    <button 
                      onClick={onExportAllData} 
                      className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                    >
                      <ExportIcon />
                      <span className="ml-2">Export All Data (.json)</span>
                    </button>
                  </div>
                </div>
            </div>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col justify-center items-center text-center">
            <UserGroupIcon className="w-16 h-16 text-indigo-500 mb-4" />
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{membersCount}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Total Members in Club</p>
        </div>
      </div>

      {/* Events List */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Sessions & Activities</h2>
        <div className="space-y-3">
          {events.length > 0 ? (
            [...events].reverse().map(event => {
              const totalPoints = event.participants.reduce((sum, p) => sum + (p.points || 0), 0);
              return (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()} | {event.participants.length} participant(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{totalPoints}</p>
                      <p className="text-xs text-gray-500">Total Points</p>
                    </div>
                    <button 
                      onClick={() => onManageEvent(event.id)}
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No sessions or activities created yet. Add one above to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;