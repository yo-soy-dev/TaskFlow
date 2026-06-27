import React, { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const ICONS = {
  task_assigned: '📋',
  task_updated: '✏️',
  task_commented: '💬',
  task_due_soon: '⏰',
  task_overdue: '🔴',
  general: '🔔',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(n => n.map(notif => notif._id === id ? { ...notif, isRead: true } : notif));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(n => n.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch {}
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      setNotifications(n => n.filter(notif => notif._id !== id));
    } catch {}
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', fontSize: 18 }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: '64', right: 12,
          width: 'min(340px, calc(100vw - 24px))', maxHeight: 440,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          zIndex: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications {unreadCount > 0 && <span style={{ color: 'var(--danger)', fontSize: 12 }}>({unreadCount})</span>}</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: 12, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: notif.isRead ? 'transparent' : 'var(--accent-dim)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[notif.type] || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{notif.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{notif.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(notif._id, e)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: 2 }}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
