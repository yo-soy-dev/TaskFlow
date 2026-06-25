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

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    taskAPI.getAll(filters)
      .then(({ data }) => {
        setTasks(data.data.tasks);
        setMeta(data.meta);
      })
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

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await taskAPI.create(formData);
      toast.success('Task created successfully.');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await taskAPI.update(editTask._id, formData);
      toast.success('Task updated successfully.');
      setEditTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskAPI.update(task._id, { status: newStatus });
      toast.success('Status updated.');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await taskAPI.delete(deleteTarget._id);
      toast.success('Task deleted.');
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  const isDue = (date) => date && new Date(date) < new Date();

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Tasks</h1>
          <p className="text-muted text-sm mt-2">{meta.total} total tasks</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Task</button>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ overflowX: 'auto', paddingBottom: 4 }} >
        <div className="search-input-wrap" style={{ maxWidth: 280 }}>
          <span className="search-icon">🔍</span>
          <input className="form-input search-input" placeholder="Search tasks..." value={searchInput} onChange={handleSearchChange} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={`${filters.sortBy}_${filters.sortOrder}`} onChange={e => { const [sortBy, sortOrder] = e.target.value.split('_'); setFilters(f => ({ ...f, sortBy, sortOrder, page: 1 })); }}>
          <option value="createdAt_desc">Newest First</option>
          <option value="createdAt_asc">Oldest First</option>
          <option value="dueDate_asc">Due Date ↑</option>
          <option value="dueDate_desc">Due Date ↓</option>
          <option value="priority_desc">Priority High→Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-full"><div className="loading-spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No tasks found. {isAdmin && 'Create one to get started!'}</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500, cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => setViewTask(task)}>
                          {task.title}
                        </div>
                        {task.tags?.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                            {task.tags.slice(0, 3).map(tag => (
                              <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                          value={task.status}
                          onChange={e => handleStatusChange(task, e.target.value)}
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <StatusBadge status={task.status} />
                      )}
                    </td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td>
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: 'var(--accent)' }}>
                            {getInitials(task.assignedTo.name)}
                          </div>
                          <span className="text-sm">{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td>
                      {task.dueDate ? (
                        <span style={{ color: isDue(task.dueDate) && task.status !== 'completed' ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13 }}>
                          {isDue(task.dueDate) && task.status !== 'completed' ? '⚠ ' : ''}
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      ) : <span className="text-muted text-sm">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => setViewTask(task)}>👁</button>
                        {isAdmin && (
                          <>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setEditTask(task)}>✏</button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDeleteTarget(task)}>🗑</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && tasks.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <Pagination {...meta} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="lg">
        <TaskForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && <TaskForm onSubmit={handleUpdate} initialData={editTask} loading={saving} />}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewTask} onClose={() => setViewTask(null)} title="Task Details">
        {viewTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="form-label">Title</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{viewTask.title}</div>
            </div>
            {viewTask.description && (
              <div>
                <div className="form-label">Description</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{viewTask.description}</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><div className="form-label">Status</div><StatusBadge status={viewTask.status} /></div>
              <div><div className="form-label">Priority</div><PriorityBadge priority={viewTask.priority} /></div>
              <div>
                <div className="form-label">Assigned To</div>
                <span style={{ fontSize: 14 }}>{viewTask.assignedTo?.name || '—'}</span>
              </div>
              <div>
                <div className="form-label">Due Date</div>
                <span style={{ fontSize: 14 }}>{viewTask.dueDate ? format(new Date(viewTask.dueDate), 'MMM d, yyyy') : '—'}</span>
              </div>
              <div>
                <div className="form-label">Created By</div>
                <span style={{ fontSize: 14 }}>{viewTask.createdBy?.name || '—'}</span>
              </div>
              <div>
                <div className="form-label">Created</div>
                <span style={{ fontSize: 14 }}>{format(new Date(viewTask.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
            {viewTask.tags?.length > 0 && (
              <div>
                <div className="form-label">Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {viewTask.tags.map(tag => (
                    <span key={tag} style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', fontSize: 12, padding: '3px 8px', borderRadius: 6 }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default TasksPage;