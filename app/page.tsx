'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Member, Event } from '../types';
import Header from '../components/Header';
import AdminDashboard from '../components/AdminDashboard';
import EventManagement from '../components/EventManagement';
import UserView from '../components/UserView';
import AdminLogin from '../components/AdminLogin';

const App: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setMembers(data.members || []);
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiRequest = async (endpoint: string, method: string, body?: any) => {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`/api/${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.status !== 204 ? response.json() : null;
  };
  
  const addMember = async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    const newMember = await apiRequest('members', 'POST', { memberData });
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };
  
  const addEvent = async (name: string) => {
    if (name.trim() === '') return;
    const newEvent = await apiRequest('events', 'POST', { name });
    setEvents(prev => [newEvent, ...prev]);
  };
  
  const addParticipantToEvent = async (eventId: string, memberId: string) => {
    await apiRequest('participants', 'POST', { eventId, memberId });
    await fetchData(); // Refetch to update state
  };
  
  const removeParticipantFromEvent = async (eventId: string, memberId: string) => {
    await apiRequest('participants', 'DELETE', { eventId, memberId });
    await fetchData();
  };

  const updateParticipant = async (eventId: string, memberId: string, update: {status?: 'present' | 'absent' | 'unmarked'; points?: number}) => {
    await apiRequest('participants', 'PUT', { eventId, memberId, ...update });
    await fetchData();
  }

  const updateParticipantStatus = (eventId: string, memberId: string, status: 'present' | 'absent') => {
    const currentParticipant = events.find(e => e.id === eventId)?.participants.find(p => p.memberId === memberId);
    const pointsUpdate = status === 'absent' ? { points: 0 } : {};
    updateParticipant(eventId, memberId, { status, ...pointsUpdate });
  };

  const updateParticipantPoints = (eventId: string, memberId: string, points: number) => {
    updateParticipant(eventId, memberId, { points: isNaN(points) ? 0 : points });
  };
  
  const addNewMemberAndAddToEvent = async (eventId: string, memberData: Omit<Member, 'id'>) => {
    try {
      const newMember = await addMember(memberData);
      if (newMember) {
        await addParticipantToEvent(eventId, newMember.id);
      }
    } catch (err: any) {
      alert(err.message);
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

      const membersToImport: Omit<Member, 'id'>[] = [];
      const existingCnis = new Set(members.map(m => m.cni?.toLowerCase()).filter(Boolean));

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const name = values[nameIndex];
        const cni = cniIndex > -1 ? values[cniIndex] : undefined;

        if (name && cni && !existingCnis.has(cni.toLowerCase())) {
          membersToImport.push({
            name, cni,
            cne: cneIndex > -1 ? values[cneIndex] : undefined,
            schoolLevel: schoolLevelIndex > -1 ? values[schoolLevelIndex] : undefined,
            whatsapp: whatsappIndex > -1 ? values[whatsappIndex] : undefined,
          });
          existingCnis.add(cni.toLowerCase());
        }
      }

      if (membersToImport.length > 0) {
        try {
          const imported = await apiRequest('members', 'POST', { members: membersToImport });
          setMembers(prev => [...prev, ...imported]);
          alert(`${imported.length} new members imported successfully!`);
        } catch (err: any) {
          alert(`Import failed: ${err.message}`);
        }
      } else {
        alert("No new members found to import. They may already exist in the list (checked by CNI).");
      }
    };
    reader.onerror = () => alert("Error reading file.");
    reader.readAsText(file);
  };
  
  const handleAdminLogin = async (cni: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cni, password: pass }),
      });
      if (!response.ok) return false;
      const { token } = await response.json();
      setAuthToken(token);
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    setSelectedEventId(null);
    setMode('user');
  };
  
  const exportAllData = () => {
    const dataToExport = { members, events };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const filename = `club_data_backup_${new Date().toISOString().split('T')[0]}.json`;
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
  
  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-10">Loading data...</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    if (mode === 'user') {
      return <UserView members={members} events={events} />;
    }

    if (mode === 'admin') {
      if (!isAuthenticated) {
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
        onToggleMode={() => setMode(prev => prev === 'admin' ? 'user' : 'admin')} 
        isAdminAuthenticated={isAuthenticated}
        onLogout={handleAdminLogout}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
