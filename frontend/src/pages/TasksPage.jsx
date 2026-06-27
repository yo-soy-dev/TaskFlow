import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import TaskForm from '../components/TaskForm';
import CommentSection from '../components/CommentSection';
import AttachmentSection from '../components/AttachmentSection';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
const isDue = (date) => date && new Date(date) < new Date();

const CATEGORY_COLORS = {
  general: '#64748b', bug: '#ef4444', feature: '#6366f1',
  design: '#ec4899', devops: '#f59e0b', documentation: '#3b82f6',
  testing: '#10b981', research: '#8b5cf6',
};

const ProgressBar = ({ value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: value === 100 ? 'var(--success)' : 'var(--accent)', borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
    <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>{value}%</span>
  </div>
);

const TaskCard = ({ task, isAdmin, onView, onEdit, onDelete, onStatusChange }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--text-primary)', lineHeight: 1.4 }} onClick={() => onView(task)}>{task.title}</div>
        {task.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onView(task)}>👁</button>
        {isAdmin && <>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(task)}>✏</button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(task)}>🗑</button>
        </>}
      </div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      {isAdmin ? (
        <select className="form-select" style={{ padding: '3px 8px', fontSize: 11, width: 'auto', height: 'auto' }} value={task.status} onChange={e => onStatusChange(task, e.target.value)}>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      ) : <StatusBadge status={task.status} />}
      <PriorityBadge priority={task.priority} />
      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: `${CATEGORY_COLORS[task.category]}20`, color: CATEGORY_COLORS[task.category], textTransform: 'capitalize' }}>{task.category || 'general'}</span>
    </div>
    <ProgressBar value={task.progress || 0} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {task.assignedTo ? (<><div className="avatar" style={{ width: 20, height: 20, fontSize: 9 }}>{getInitials(task.assignedTo.name)}</div><span>{task.assignedTo.name}</span></>) : <span>Unassigned</span>}
      </div>
      {task.dueDate && (
        <span style={{ color: isDue(task.dueDate) && task.status !== 'completed' ? 'var(--danger)' : 'var(--text-muted)' }}>
          {isDue(task.dueDate) && task.status !== 'completed' ? '⚠ ' : '📅 '}{format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
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

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', category: '', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    taskAPI.getAll(filters)
      .then(({ data }) => { setTasks(data.data.tasks); setMeta(data.meta); })
      .catch(() => toast.error('Failed to fetch tasks.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => setFilters(f => ({ ...f, search: val, page: 1 })), 400));
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try { await taskAPI.create(formData); toast.success('Task created!'); setShowModal(false); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create task.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try { await taskAPI.update(editTask._id, formData); toast.success('Task updated!'); setEditTask(null); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update task.'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try { await taskAPI.update(task._id, { status: newStatus }); toast.success('Status updated.'); fetchTasks(); }
    catch { toast.error('Failed to update status.'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await taskAPI.delete(deleteTarget._id); toast.success('Task deleted.'); setDeleteTarget(null); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete.'); }
    finally { setDeleting(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await taskAPI.export();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `tasks_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
      window.URL.revokeObjectURL(url); toast.success('Tasks exported!');
    } catch { toast.error('Export failed.'); }
    finally { setExporting(false); }
  };

  const handleAttachmentUpdate = (newAttachments) => setViewTask(t => ({ ...t, attachments: newAttachments }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Tasks</h1>
          <p className="text-muted text-sm" style={{ marginTop: 2 }}>{meta.total} total tasks</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? '⏳' : '⬇'}{!isMobile && ' Export CSV'}
          </button>
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ {isMobile ? 'Task' : 'New Task'}</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto auto auto auto', gap: 8, marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <span className="search-icon">🔍</span>
          <input className="form-input search-input" placeholder="Search tasks..." value={searchInput} onChange={handleSearchChange} style={{ width: '100%' }} />
        </div>
        <select className="form-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        <select className="form-select" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="form-select" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="">All Categories</option>
          {['general','bug','feature','design','devops','documentation','testing','research'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="form-select" value={`${filters.sortBy}_${filters.sortOrder}`} onChange={e => { const [s,o] = e.target.value.split('_'); setFilters(f => ({ ...f, sortBy: s, sortOrder: o, page: 1 })); }}>
          <option value="createdAt_desc">Newest</option>
          <option value="createdAt_asc">Oldest</option>
          <option value="dueDate_asc">Due ↑</option>
          <option value="priority_desc">Priority</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-full"><div className="loading-spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No tasks found. {isAdmin && 'Create one!'}</div></div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} isAdmin={isAdmin} onView={setViewTask} onEdit={setEditTask} onDelete={setDeleteTarget} onStatusChange={handleStatusChange} />
          ))}
          <div style={{ marginTop: 8 }}><Pagination {...meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} /></div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Priority</th><th>Category</th><th>Progress</th><th>Assigned To</th><th>Due Date</th><th>Actions</th></tr></thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => setViewTask(task)}>{task.title}</div>
                      {task.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                          {task.tags.slice(0, 2).map(tag => <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{tag}</span>)}
                        </div>
                      )}
                    </td>
                    <td>{isAdmin ? (
                      <select className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }} value={task.status} onChange={e => handleStatusChange(task, e.target.value)}>
                        <option value="todo">Todo</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="completed">Completed</option>
                      </select>
                    ) : <StatusBadge status={task.status} />}</td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${CATEGORY_COLORS[task.category]}20`, color: CATEGORY_COLORS[task.category], textTransform: 'capitalize' }}>{task.category || 'general'}</span></td>
                    <td style={{ minWidth: 100 }}><ProgressBar value={task.progress || 0} /></td>
                    <td>{task.assignedTo ? (<div className="flex items-center gap-2"><div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{getInitials(task.assignedTo.name)}</div><span className="text-sm">{task.assignedTo.name}</span></div>) : <span className="text-muted text-sm">—</span>}</td>
                    <td>{task.dueDate ? (<span style={{ color: isDue(task.dueDate) && task.status !== 'completed' ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13 }}>{isDue(task.dueDate) && task.status !== 'completed' ? '⚠ ' : ''}{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>) : <span className="text-muted text-sm">—</span>}</td>
                    <td><div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewTask(task)}>👁</button>
                      {isAdmin && <><button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditTask(task)}>✏</button><button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteTarget(task)}>🗑</button></>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}><Pagination {...meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} /></div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm onSubmit={handleUpdate} initialData={editTask} loading={saving} />}
      </Modal>
      <Modal isOpen={!!viewTask} onClose={() => setViewTask(null)} title="Task Details" size="lg">
        {viewTask && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><div className="form-label">Title</div><div style={{ fontWeight: 600, fontSize: 14 }}>{viewTask.title}</div></div>
              <div><div className="form-label">Category</div><span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${CATEGORY_COLORS[viewTask.category]}20`, color: CATEGORY_COLORS[viewTask.category], textTransform: 'capitalize' }}>{viewTask.category}</span></div>
              <div><div className="form-label">Status</div><StatusBadge status={viewTask.status} /></div>
              <div><div className="form-label">Priority</div><PriorityBadge priority={viewTask.priority} /></div>
              <div><div className="form-label">Assigned To</div><span style={{ fontSize: 14 }}>{viewTask.assignedTo?.name || '—'}</span></div>
              <div><div className="form-label">Due Date</div><span style={{ fontSize: 14 }}>{viewTask.dueDate ? format(new Date(viewTask.dueDate), 'MMM d, yyyy') : '—'}</span></div>
            </div>
            {viewTask.description && <div style={{ marginBottom: 12 }}><div className="form-label">Description</div><p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{viewTask.description}</p></div>}
            <div style={{ marginBottom: 16 }}><div className="form-label">Progress</div><ProgressBar value={viewTask.progress || 0} /></div>
            {viewTask.tags?.length > 0 && <div style={{ marginBottom: 12 }}><div className="form-label">Tags</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{viewTask.tags.map(tag => <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontSize: 12, padding: '3px 8px', borderRadius: 6 }}>{tag}</span>)}</div></div>}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <AttachmentSection taskId={viewTask._id} attachments={viewTask.attachments || []} onUpdate={handleAttachmentUpdate} isAdmin={isAdmin} />
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <CommentSection taskId={viewTask._id} />
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Task" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} />
    </div>
  );
};

export default TasksPage;
