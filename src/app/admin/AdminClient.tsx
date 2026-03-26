'use client';

import { useState, useEffect } from 'react';
import { Users, Send, CheckCircle, AlertCircle, Mail, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  name: string | null;
  provider: string;
  created_at: string;
}

export default function AdminClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'users' | 'compose'>('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function toggleUser(email: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.email)));
    }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required');
      return;
    }
    if (selectedUsers.size === 0) {
      setError('Select at least one recipient');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          recipients: users
            .filter((u) => selectedUsers.has(u.email))
            .map((u) => ({ email: u.email, name: u.name })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ sent: data.sent, failed: data.failed });
        if (data.sent > 0 && data.failed === 0) {
          setSubject('');
          setBody('');
        }
      } else {
        setError(data.error || 'Failed to send');
      }
    } catch {
      setError('Failed to send emails');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Admin</h1>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setView('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setView('compose')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                view === 'compose' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              Compose
            </button>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2 ml-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {view === 'users' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                All Users
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {selectedUsers.size} selected
                </span>
                <button
                  onClick={toggleAll}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  {selectedUsers.size === users.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedUsers.size > 0 && (
                  <button
                    onClick={() => setView('compose')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Email Selected
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(u.email)}
                    onChange={() => toggleUser(u.email)}
                    className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{u.name || 'No name'}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">
                        {u.provider}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400 truncate block">{u.email}</span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {view === 'compose' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Compose Email
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Sending to {selectedUsers.size} recipient{selectedUsers.size !== 1 ? 's' : ''} from hello@getinvita.com
              </p>
            </div>
            <div className="p-6 space-y-4">
              {selectedUsers.size === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-400">
                  No recipients selected. Go to Users tab and select who to email.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={10}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">Line breaks will be preserved in the email.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {result && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Sent to {result.sent} recipient{result.sent !== 1 ? 's' : ''}.
                  {result.failed > 0 && ` ${result.failed} failed.`}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSend}
                  disabled={sending || selectedUsers.size === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
