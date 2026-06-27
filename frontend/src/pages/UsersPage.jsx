import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { userAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { RoleBadge, ActiveBadge } from '../components/Badge';
import UserForm from '../components/UserForm';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const UserCard = ({ user, onView, onEdit, onDelete }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
    <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, flexShrink: 0, background: user.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>
      {getInitials(user.name)}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{user.name}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <RoleBadge role={user.role} />
        <ActiveBadge isActive={user.isActive} />
        {user.department && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user.department}</span>}
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onView(user)}>👁</button>
      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(user)}>✏</button>
      <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(user)}>🗑</button>
    </div>
  </div>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const UsersPage = () => {
  const isMobile = useIsMobile();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    userAPI.getAll(filters).then(({ data }) => { setUsers(data.data.users); setMeta(data.meta); }).catch(() => toast.error('Failed to fetch users.')).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => {
    const val = e.target.value; setSearchInput(val);
    clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => setFilters(f => ({ ...f, search: val, page: 1 })), 400));
  };

  const handleViewUser = async (user) => {
    setViewUser(user);
    try { const { data } = await userAPI.getUserTasks(user._id); setUserTasks(data.data.tasks); }
    catch { setUserTasks([]); }
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try { await userAPI.create(formData); toast.success('User created.'); setShowCreate(false); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create user.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData }; if (!payload.password) delete payload.password;
      await userAPI.update(editUser._id, payload); toast.success('User updated.'); setEditUser(null); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update user.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await userAPI.delete(deleteTarget._id); toast.success('User deleted.'); setDeleteTarget(null); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>User Management</h1>
          <p className="text-muted text-sm" style={{ marginTop: 2 }}>{meta.total} registered users</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ New User</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr auto' : 'auto auto', gap: 8, marginBottom: 16 }}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-input search-input" placeholder="Search users..." value={searchInput} onChange={handleSearchChange} style={{ width: '100%' }} />
        </div>
        <select className="form-select" value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-full"><div className="loading-spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">No users found.</div></div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => <UserCard key={user._id} user={user} onView={handleViewUser} onEdit={setEditUser} onDelete={setDeleteTarget} />)}
          <div style={{ marginTop: 8 }}><Pagination {...meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} /></div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar" style={{ background: user.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>{getInitials(user.name)}</div>
                        <div><div style={{ fontWeight: 500, fontSize: 14 }}>{user.name}</div><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user.email}</div></div>
                      </div>
                    </td>
                    <td><RoleBadge role={user.role} /></td>
                    <td><span className="text-sm text-muted">{user.department || '—'}</span></td>
                    <td><ActiveBadge isActive={user.isActive} /></td>
                    <td><span className="text-sm text-muted">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span></td>
                    <td><div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleViewUser(user)}>👁</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditUser(user)}>✏</button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(user)}>🗑</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}><Pagination {...meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} /></div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New User" size="lg">
        <UserForm onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="lg">
        {editUser && <UserForm onSubmit={handleUpdate} initialData={editUser} loading={saving} isEdit />}
      </Modal>
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="lg">
        {viewUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="avatar avatar-xl" style={{ background: viewUser.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}>{getInitials(viewUser.name)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{viewUser.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, wordBreak: 'break-all' }}>{viewUser.email}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><RoleBadge role={viewUser.role} /><ActiveBadge isActive={viewUser.isActive} /></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div><div className="form-label">Department</div><span style={{ fontSize: 14 }}>{viewUser.department || '—'}</span></div>
              <div><div className="form-label">Joined</div><span style={{ fontSize: 14 }}>{format(new Date(viewUser.createdAt), 'MMM d, yyyy')}</span></div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 10 }}>Assigned Tasks ({userTasks.length})</div>
              {userTasks.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tasks assigned.</p> : (
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {userTasks.map(task => (
                    <div key={task._id} style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                      <span className={`badge badge-${task.status}`} style={{ fontSize: 10, flexShrink: 0 }}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete User" message={`Delete "${deleteTarget?.name}"? Their tasks will become unassigned.`} />
    </div>
  );
};

export default UsersPage;
