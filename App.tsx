import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Member, Event, Participant } from './types';
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
  const [members, setMembers] = useLocalStorage<Member[]>('members', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);
  
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const addMember = (memberData: Omit<Member, 'id'>): Member => {
    const newMember: Member = {
      ...memberData,
      id: crypto.randomUUID(),
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const addEvent = (name: string) => {
    if (name.trim() === '') return;
    const newEvent: Event = {
      id: crypto.randomUUID(),
      name,
      date: new Date().toISOString(),
      participants: [],
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const addParticipantToEvent = (eventId: string, memberId: string) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId && !event.participants.some(p => p.memberId === memberId)) {
        const newParticipant: Participant = { memberId, status: 'unmarked', points: 0 };
        return { ...event, participants: [...event.participants, newParticipant] };
      }
      return event;
    }));
  };
  
  const removeParticipantFromEvent = (eventId: string, memberId: string) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        return { ...event, participants: event.participants.filter(p => p.memberId !== memberId) };
      }
      return event;
    }));
  };

  const updateParticipantStatus = (eventId: string, memberId: string, status: 'present' | 'absent') => {
    setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === eventId) {
            return {
                ...event,
                participants: event.participants.map(p => 
                    p.memberId === memberId ? { ...p, status, points: status === 'absent' ? 0 : p.points } : p
                )
            };
        }
        return event;
    }));
  };

  const updateParticipantPoints = (eventId: string, memberId: string, points: number) => {
      setEvents(prevEvents => prevEvents.map(event => {
          if (event.id === eventId) {
              return {
                  ...event,
                  participants: event.participants.map(p =>
                      p.memberId === memberId ? { ...p, points: isNaN(points) ? 0 : points } : p
                  )
              };
          }
          return event;
      }));
  };

  const addNewMemberAndAddToEvent = (eventId: string, memberData: Omit<Member, 'id'>) => {
    if (memberData.cni && members.some(m => m.cni?.toLowerCase() === memberData.cni?.toLowerCase())) {
        alert("A member with this CNI already exists.");
        return;
    }
    const newMember = addMember(memberData);
    addParticipantToEvent(eventId, newMember.id);
  };

  const importMembers = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
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

      const newMembers: Member[] = [];
      const existingCnis = new Set(members.map(m => m.cni?.toLowerCase()).filter(Boolean));

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const name = values[nameIndex];
        const cni = cniIndex > -1 ? values[cniIndex] : undefined;

        if (name && cni && !existingCnis.has(cni.toLowerCase())) {
          const newMember: Member = {
            id: crypto.randomUUID(),
            name,
            cni,
            cne: cneIndex > -1 ? values[cneIndex] : undefined,
            schoolLevel: schoolLevelIndex > -1 ? values[schoolLevelIndex] : undefined,
            whatsapp: whatsappIndex > -1 ? values[whatsappIndex] : undefined,
          };
          newMembers.push(newMember);
          existingCnis.add(cni.toLowerCase());
        }
      }

      if (newMembers.length > 0) {
        setMembers(prev => [...prev, ...newMembers]);
        alert(`${newMembers.length} new members imported successfully!`);
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