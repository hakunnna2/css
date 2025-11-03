import { useEffect, useState } from 'react';
import { find, insertOne } from '../src/lib/db';

export function useMembersData() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await find('members');
      setMembers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function addMember(memberData) {
    try {
      const result = await insertOne('members', memberData);
      if (result.acknowledged) {
        await loadMembers(); // Reload the list
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  return { members, loading, error, addMember };
}