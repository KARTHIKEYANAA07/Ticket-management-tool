import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, CircleUserRound, RefreshCw, Search, ShieldCheck, UserPlus, UserX, Users } from 'lucide-react';
import './admin-management.css';

const API = 'http://127.0.0.1:5000/api';
const ROLES = ['user', 'admin', 'support', 'technician'];

export default function AdminManagement({ notify = () => {} }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' });

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API}/admin/users`, { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not load users. Sign in as an active admin.');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message || 'Unable to connect to the API.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => users.filter(user => {
    const searchMatch = `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase());
    const statusMatch = statusFilter === 'all' || (statusFilter === 'active' ? user.is_active : !user.is_active);
    return searchMatch && statusMatch;
  }), [users, query, statusFilter]);

  async function updateUser(user, changes) {
    setError('');
    try {
      const response = await fetch(`${API}/admin/users/${user.id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not update account.');
      notify(data.message || 'User updated.');
      await loadUsers();
    } catch (e) { setError(e.message || 'Could not update user.'); }
  }

  async function createUser(event) {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch(`${API}/admin/users`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not create account.');
      setForm({ name: '', email: '', password: '', role: 'support' }); setShowForm(false);
      notify('Account created successfully. Share the temporary password securely.');
      await loadUsers();
    } catch (e) { setError(e.message || 'Could not create account.'); }
    finally { setSaving(false); }
  }

  const activeCount = users.filter(user => user.is_active).length;
  const inactiveCount = users.length - activeCount;
  const adminCount = users.filter(user => user.role === 'admin').length;

  return <section className="admin-management">
    <div className="admin-summary-grid">
      <article className="admin-summary-card"><span className="admin-summary-icon blue"><Users size={19}/></span><div><small>Total accounts</small><strong>{users.length}</strong><span>Registered users</span></div></article>
      <article className="admin-summary-card"><span className="admin-summary-icon green"><CheckCircle2 size={19}/></span><div><small>Active accounts</small><strong>{activeCount}</strong><span>Can sign in</span></div></article>
      <article className="admin-summary-card"><span className="admin-summary-icon amber"><UserX size={19}/></span><div><small>Inactive accounts</small><strong>{inactiveCount}</strong><span>Sign-in blocked</span></div></article>
      <article className="admin-summary-card"><span className="admin-summary-icon violet"><ShieldCheck size={19}/></span><div><small>Administrators</small><strong>{adminCount}</strong><span>Privileged accounts</span></div></article>
    </div>

    <div className="admin-users-panel">
      <div className="admin-users-heading"><div><h2><CircleUserRound size={20}/> User accounts</h2><p>Create accounts, assign roles, and control access to DairyCare 360.</p></div><div className="admin-heading-actions"><button className="button secondary" onClick={loadUsers} disabled={loading}><RefreshCw size={15}/> Refresh</button><button className="button primary" onClick={() => setShowForm(v => !v)}><UserPlus size={16}/>{showForm ? 'Cancel' : 'Add user'}</button></div></div>

      {showForm && <form className="admin-create-form" onSubmit={createUser}>
        <div className="admin-form-title"><UserPlus size={18}/><div><strong>Create account</strong><small>A secure password hash is stored; the password itself is never stored.</small></div></div>
        <div className="admin-form-grid">
          <label>Full name<input required minLength="2" maxLength="120" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Kumar"/></label>
          <label>Email address<input required type="email" maxLength="254" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@company.com"/></label>
          <label>Temporary password<input required minLength="8" type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters"/></label>
          <label>Account role<select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>{ROLES.map(role => <option value={role} key={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></label>
        </div>
        <div className="admin-form-footer"><span>New accounts are active by default.</span><button className="button primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</button></div>
      </form>}

      {error && <div className="admin-error" role="alert"><strong>Action needs attention</strong><span>{error}</span>{error.toLowerCase().includes('admin') || error.toLowerCase().includes('sign in') ? <small>Sign in to the staff portal with an account whose role is <code>admin</code>, then return to this page.</small> : null}</div>}

      <div className="admin-user-toolbar"><label className="admin-search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email or role…"/></label><select aria-label="Filter account status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option><option value="active">Active only</option><option value="inactive">Inactive only</option></select><span className="admin-result-count">{filteredUsers.length} account{filteredUsers.length === 1 ? '' : 's'}</span></div>

      {loading ? <div className="admin-empty"><RefreshCw size={20}/> Loading user accounts…</div> : filteredUsers.length === 0 ? <div className="admin-empty"><Users size={24}/><strong>No accounts found</strong><span>Try a different search or create a user account.</span></div> : <div className="admin-table-wrap"><table className="admin-users-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th>Access control</th></tr></thead><tbody>{filteredUsers.map(user => <tr key={user.id}>
        <td><div className="admin-user-cell"><span className="admin-user-avatar">{(user.name || '?').trim().slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email}</small><small className="admin-user-id">ID #{user.id}</small></span></div></td>
        <td><select className="admin-role-select" aria-label={`Role for ${user.name}`} value={user.role} onChange={e => updateUser(user, { role: e.target.value })}>{ROLES.map(role => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></td>
        <td><span className={`admin-status ${user.is_active ? 'is-active' : 'is-inactive'}`}><i/>{user.is_active ? 'Active' : 'Inactive'}</span></td>
        <td className="admin-created-date">{user.created_at ? new Date(user.created_at.replace(' ', 'T')).toLocaleDateString() : '—'}</td>
        <td><button className={`admin-access-button ${user.is_active ? 'deactivate' : 'activate'}`} onClick={() => updateUser(user, { is_active: !user.is_active })} title={user.is_active ? 'Block sign-in for this account' : 'Allow this account to sign in'}>{user.is_active ? <><UserX size={14}/> Deactivate</> : <><CheckCircle2 size={14}/> Activate</>}</button></td>
      </tr>)}</tbody></table></div>}
      <div className="admin-security-note"><ShieldCheck size={17}/><p><strong>Access protection is enforced by Flask.</strong> Inactive users cannot sign in, and admin APIs verify the current role from MySQL on every request. Password hashes are never returned to this page.</p></div>
    </div>
  </section>;
}
