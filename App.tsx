import React, { useState, useCallback } from 'react';
import { Member, Event, Participant } from './types';
import { useMembers, useEvents } from './hooks/useDatabase';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import EventManagement from './components/EventManagement';
import UserView from './components/UserView';
import AdminLogin from './components/AdminLogin';

// Constants
const ADMIN_CREDENTIALS = [
  { cni: 'admin', password: 'password' },
  { cni: 'GI11120', password: 'CSS12340' },
  { cni: 'K591388', password: '0661690222Ma' },
];

const App: React.FC = () => {
  const { 
    members, 
    loading: membersLoading, 
    error: membersError, 
    addMember: dbAddMember, 
    updateMember: dbUpdateMember, 
    deleteMember: dbDeleteMember,
    refresh: refreshMembers 
  } = useMembers();

  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError, 
    addEvent: dbAddEvent, 
    updateEvent: dbUpdateEvent,
    deleteEvent: dbDeleteEvent,
    refresh: refreshEvents
  } = useEvents();
  
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const addMember = async (memberData: Omit<Member, '_id'>): Promise<Member | null> => {
    try {
      const result = await dbAddMember(memberData as Member);
      await refreshMembers();
      return result;
    } catch (error) {
      console.error('Failed to add member:', error);
      return null;
    }
  };

  const addEvent = async (name: string) => {
    if (name.trim() === '') return;
    const newEvent: Omit<Event, '_id'> = {
      name,
      date: new Date().toISOString(),
      participants: [],
    };
    try {
      await dbAddEvent(newEvent as Event);
      await refreshEvents();
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const addParticipantToEvent = async (eventId: string, memberId: string) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event || event.participants.some(p => p.memberId === memberId)) return;

      const updatedEvent = {
        ...event,
        participants: [
          ...event.participants,
          { memberId, status: 'unmarked', points: 0 }
        ]
      };
      await dbUpdateEvent(eventId, updatedEvent);
      await refreshEvents();
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };
  
  const removeParticipantFromEvent = async (eventId: string, memberId: string) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event) return;

      const updatedEvent = {
        ...event,
        participants: event.participants.filter(p => p.memberId !== memberId)
      };
      await dbUpdateEvent(eventId, updatedEvent);
      await refreshEvents();
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  const updateParticipantStatus = async (eventId: string, memberId: string, status: 'present' | 'absent') => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event) return;

      const updatedEvent = {
        ...event,
        participants: event.participants.map(p => 
          p.memberId === memberId ? { ...p, status, points: status === 'absent' ? 0 : p.points } : p
        )
      };
      await dbUpdateEvent(eventId, updatedEvent);
      await refreshEvents();
    } catch (error) {
      console.error('Failed to update participant status:', error);
    }
  };

  const updateParticipantPoints = async (eventId: string, memberId: string, points: number) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event) return;

      const updatedEvent = {
        ...event,
        participants: event.participants.map(p =>
          p.memberId === memberId ? { ...p, points: isNaN(points) ? 0 : points } : p
        )
      };
      await dbUpdateEvent(eventId, updatedEvent);
      await refreshEvents();
    } catch (error) {
      console.error('Failed to update participant points:', error);
    }
  };
  };

  const addNewMemberAndAddToEvent = async (eventId: string, memberData: Omit<Member, '_id'>) => {
    if (memberData.cni && members.some(m => m.cni?.toLowerCase() === memberData.cni?.toLowerCase())) {
        alert("A member with this CNI already exists.");
        return;
    }
    
    try {
      const result = await dbAddMember(memberData as Member);
      if (result) {
        await addParticipantToEvent(eventId, result._id!);
        await refreshMembers();
      }
    } catch (error) {
      console.error('Failed to add member and add to event:', error);
    }
  };

  const importMembers = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return alert("File is empty or could not be read.");

      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) return alert("CSV file must have a header and at least one data row.");

      const header = rows[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = header.indexOf('nom complet');
      const cniIndex = header.indexOf('cni');
      const cneIndex = header.indexOf('cne');
      const schoolLevelIndex = header.indexOf('niveau scolaire');
      const whatsappIndex = header.indexOf('numéro whatsapp');

      if (nameIndex === -1) return alert('CSV must contain a "Nom complet" column.');

      const existingCnis = new Set(members.map(m => m.cni?.toLowerCase()).filter(Boolean));
      let importedCount = 0;

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const name = values[nameIndex];
        const cni = cniIndex > -1 ? values[cniIndex] : undefined;

        if (name && cni && !existingCnis.has(cni.toLowerCase())) {
          const newMember: Omit<Member, '_id'> = {
            name,
            cni,
            cne: cneIndex > -1 ? values[cneIndex] : undefined,
            schoolLevel: schoolLevelIndex > -1 ? values[schoolLevelIndex] : undefined,
            whatsapp: whatsappIndex > -1 ? values[whatsappIndex] : undefined,
          };
          
          try {
            await dbAddMember(newMember as Member);
            importedCount++;
            existingCnis.add(cni.toLowerCase());
          } catch (error) {
            console.error('Failed to import member:', error);
          }
        }
      }

      if (importedCount > 0) {
        await refreshMembers();
        alert(`${importedCount} new members imported successfully!`);
      } else {
        alert("No new members found to import. They may already exist in the list (checked by CNI).");
      }
    };
    reader.onerror = () => alert("Error reading file.");
    reader.readAsText(file);
  };
  
  const exportEventParticipantsCSV = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const participantsData = event.participants.map(p => {
        const member = members.find(m => m.id === p.memberId);
        return member ? { ...member, status: p.status, points: p.points } : null;
    }).filter(Boolean) as (Member & { status: string; points: number })[];

    const headers = ['Nom complet', 'CNI', 'CNE', 'Niveau scolaire', 'Numéro WhatsApp', 'Status', 'Points'];
    const csvRows = [headers.join(',')];

    participantsData.forEach(participant => {
      const row = [
        `"${participant.name.replace(/"/g, '""')}"`,
        participant.cni || '',
        participant.cne || '',
        participant.schoolLevel || '',
        participant.whatsapp || '',
        participant.status,
        participant.points
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    const filename = `Participants_${event.name.replace(/\s+/g, '_')}_${eventDate}.csv`;

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllData = () => {
    const dataToExport = {
        members,
        events,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `club_data_export_${new Date().toISOString().split('T')[0]}.json`;

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'admin' ? 'user' : 'admin'));
    setSelectedEventId(null); // Reset view when toggling mode
  };

  const handleAdminLogin = (cni: string, pass: string): boolean => {
    const isValidAdmin = ADMIN_CREDENTIALS.some(cred => cred.cni === cni && cred.password === pass);
    if (isValidAdmin) setIsAdminAuthenticated(true);
    return isValidAdmin;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setSelectedEventId(null);
    setMode('user');
  };

  const renderContent = () => {
    if (mode === 'user') {
      return <UserView members={members} events={events} />;
    }

    if (mode === 'admin') {
      if (!isAdminAuthenticated) {
        return <AdminLogin onLogin={handleAdminLogin} />;
      }
      
      const selectedEvent = events.find(e => e.id === selectedEventId);

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
      } else {
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
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
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