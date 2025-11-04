import { useState, useEffect } from 'react';
import { Member, Event } from '../types';
import * as db from '../src/services/mongodb';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await db.getMembers();
      setMembers(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
      setLoading(false);
    }
  }

  async function addMember(member: Member): Promise<(Member & { _id: string }) | null> {
    try {
      const result = await db.addMember(member);
      if (!result.insertedId) throw new Error('Failed to add member');
      const newMember = { ...member, _id: result.insertedId.toString() };
      await loadMembers(); // Reload the list
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      return null;
    }
  }

  async function updateMember(id: string, member: Partial<Member>) {
    try {
      await db.updateMember(id, member);
      await loadMembers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
      return false;
    }
  }

  async function deleteMember(id: string) {
    try {
      await db.deleteMember(id);
      await loadMembers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
      return false;
    }
  }

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refresh: loadMembers
  };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await db.getEvents();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setLoading(false);
    }
  }

  async function addEvent(event: Event) {
    try {
      await db.addEvent(event);
      await loadEvents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add event');
      return false;
    }
  }

  async function updateEvent(id: string, event: Partial<Event>) {
    try {
      await db.updateEvent(id, event);
      await loadEvents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      return false;
    }
  }

  async function deleteEvent(id: string) {
    try {
      await db.deleteEvent(id);
      await loadEvents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      return false;
    }
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh: loadEvents
  };
}