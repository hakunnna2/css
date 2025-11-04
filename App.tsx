// App.tsx (FINAL VERSION with Detailed Report Export)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Components ---
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import EventManagement from './components/EventManagement';
import UserView from './components/UserView';
import AdminLogin from './components/AdminLogin';

// --- Types ---
import { Member, PopulatedEvent } from './types';

// --- API Base URL ---
const API_URL = 'http://localhost:5000/api';

// --- Admin Credentials ---
const ADMIN_CREDENTIALS = [
  { cni: 'GI11120', password: 'CSS12340' },
  { cni: 'K591388', password: '0661690222Ma' },
];

const App: React.FC = () => {
  // --- State Management ---
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<PopulatedEvent[]>([]);
  
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // --- Fetch Initial Data from Server ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [membersRes, eventsRes] = await Promise.all([
          axios.get<Member[]>(`${API_URL}/members`),
          axios.get<PopulatedEvent[]>(`${API_URL}/events`),
        ]);
        setMembers(membersRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchAllData();
  }, []);

  const updateEventInState = (updatedEvent: PopulatedEvent) => {
      setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
  };

  // --- API-driven Functions ---

  const addMember = async (memberData: Omit<Member, '_id'>): Promise<Member | null> => {
    try {
        const response = await axios.post<Member>(`${API_URL}/members`, memberData);
        setMembers(prev => [...prev, response.data]);
        return response.data;
    } catch (error) {
        console.error("Error adding member:", error);
        alert("Failed to add member. Check CNI for duplicates.");
        return null;
    }
  };

  const addEvent = async (name: string) => {
    if (name.trim() === '') return;
    try {
        const response = await axios.post<PopulatedEvent>(`${API_URL}/events`, { name });
        setEvents(prev => [...prev, response.data]);
    } catch (error) {
        console.error("Error adding event:", error);
    }
  };

  const addParticipantToEvent = async (eventId: string, memberId: string) => {
    try {
        const response = await axios.post<PopulatedEvent>(`${API_URL}/events/${eventId}/participants`, { memberId });
        updateEventInState(response.data);
    } catch (error) {
        console.error("Error adding participant:", error);
    }
  };
  
  const removeParticipantFromEvent = async (eventId: string, memberId: string) => {
     try {
        const response = await axios.delete<PopulatedEvent>(`${API_URL}/events/${eventId}/participants/${memberId}`);
        updateEventInState(response.data);
    } catch (error) {
        console.error("Error removing participant:", error);
    }
  };

  const updateParticipantStatus = async (eventId: string, memberId: string, status: 'present' | 'absent') => {
      const points = status === 'absent' ? 0 : undefined;
      try {
        const response = await axios.put<PopulatedEvent>(`${API_URL}/events/${eventId}/participants/${memberId}`, { status, points });
        updateEventInState(response.data);
      } catch(error) {
        console.error("Error updating status:", error);
      }
  };

  const updateParticipantPoints = async (eventId: string, memberId: string, points: number) => {
       try {
        const response = await axios.put<PopulatedEvent>(`${API_URL}/events/${eventId}/participants/${memberId}`, { points: isNaN(points) ? 0 : points });
        updateEventInState(response.data);
      } catch(error) {
        console.error("Error updating points:", error);
      }
  };

  const addNewMemberAndAddToEvent = async (eventId: string, memberData: Omit<Member, '_id'>) => {
    if (memberData.cni && members.some(m => m.cni?.toLowerCase() === memberData.cni?.toLowerCase())) {
        alert("A member with this CNI already exists.");
        return;
    }
    const newMember = await addMember(memberData);
    if (newMember) {
        await addParticipantToEvent(eventId, newMember._id);
    }
  };

  const importMembers = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return alert("File is empty.");

      const rows = text.split('\n').filter(row => row.trim() !== '');
      const header = rows[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = header.indexOf('nom complet');
      const cniIndex = header.indexOf('cni');
      
      if (nameIndex === -1 || cniIndex === -1) return alert('CSV must contain "Nom complet" and "CNI" columns.');

      const existingCnis = new Set(members.map(m => m.cni?.toLowerCase()).filter(Boolean));
      const membersToCreate: Omit<Member, '_id'>[] = [];

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const name = values[nameIndex];
        const cni = values[cniIndex];

        if (name && cni && !existingCnis.has(cni.toLowerCase())) {
           membersToCreate.push({ name, cni });
           existingCnis.add(cni.toLowerCase());
        }
      }

      if (membersToCreate.length > 0) {
        try {
            const response = await axios.post<Member[]>(`${API_URL}/members/bulk`, { members: membersToCreate });
            setMembers(prev => [...prev, ...response.data]);
            alert(`${response.data.length} new members imported successfully!`);
        } catch (error) {
            console.error("Error bulk importing members:", error);
            alert("An error occurred during import.");
        }
      } else {
        alert("No new members found to import.");
      }
    };
    reader.readAsText(file);
  };
  
  const exportEventParticipantsCSV = (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const participantsData = event.participants.map(p => ({
      ...p.memberId,
      status: p.status,
      points: p.points,
    }));

    const headers = ['Nom complet', 'CNI', 'CNE', 'Niveau scolaire', 'Numéro WhatsApp', 'Status', 'Points'];
    const csvRows = [headers.join(',')];

    participantsData.forEach(p => {
      const row = [`"${p.name}"`, p.cni || '', p.cne || '', p.schoolLevel || '', p.whatsapp || '', p.status, p.points].join(',');
      csvRows.push(row);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `Participants_${event.name.replace(/\s+/g, '_')}.csv`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // --- THIS IS THE NEW, UPDATED FUNCTION ---
  const exportAllData = () => {
    if (events.length === 0) {
      alert("No activities to export data from.");
      return;
    }
  
    const headers = [
      'Nom complet',
      'CNI',
      'Niveau scolaire',
      'Numéro WhatsApp',
      'Activity',
      'Points'
    ];
    
    const csvRows = [headers.join(',')];
  
    events.forEach(event => {
      event.participants.forEach(participant => {
        const member = participant.memberId;
        const sanitizedName = `"${member.name.replace(/"/g, '""')}"`;
  
        const row = [
          sanitizedName,
          member.cni || '',
          member.schoolLevel || '',
          member.whatsapp || '',
          event.name,
          participant.points
        ].join(',');
        
        csvRows.push(row);
      });
    });
  
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `club_participation_report_${new Date().toISOString().split('T')[0]}.csv`;
  
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const toggleMode = () => setMode(prev => prev === 'admin' ? 'user' : 'admin');

  const handleAdminLogin = (cni: string, pass: string): boolean => {
    const isValidAdmin = ADMIN_CREDENTIALS.some(cred => cred.cni === cni && cred.password === pass);
    if (isValidAdmin) {
      setIsAdminAuthenticated(true); 
    }
    return isValidAdmin;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setSelectedEventId(null);
    setMode('user');
  };

  const renderContent = () => {
    if (mode === 'user') return <UserView members={members} events={events} />;
    if (!isAdminAuthenticated) return <AdminLogin onLogin={handleAdminLogin} />;
    
    const selectedEvent = events.find(e => e._id === selectedEventId);
    if (selectedEvent) {
      return (
        <EventManagement
            event={selectedEvent}
            allMembers={members}
            onAddParticipant={addParticipantToEvent}
            onRemoveParticipant={removeParticipantFromEvent}
            onAddNewMemberAndAdd={addNewMemberAndAddToEvent}
            onUpdateStatus={updateParticipantStatus}
            onUpdatePoints={updateParticipantPoints}
            onExportCSV={exportEventParticipantsCSV}
            onGoBack={() => setSelectedEventId(null)}
        />
      );
    }
    return (
      <AdminDashboard
        events={events}
        membersCount={members.length}
        onAddEvent={addEvent}
        onManageEvent={setSelectedEventId}
        onImportMembers={importMembers}
        onExportAllData={exportAllData}
      />
    );
  };

  return (
    <div>
      <Header 
        currentMode={mode} 
        onToggleMode={toggleMode} 
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleAdminLogout}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;