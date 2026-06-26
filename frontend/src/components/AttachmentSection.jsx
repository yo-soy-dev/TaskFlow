import React, { useState, useRef } from 'react';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  'image/jpeg': '🖼️', 'image/png': '🖼️', 'image/gif': '🖼️', 'image/webp': '🖼️',
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'text/plain': '📃',
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BASE = import.meta.env.VITE_API_URL + '/api';

const AttachmentSection = ({ taskId, attachments = [], onUpdate, isAdmin }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error('File must be under 10MB.');

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await taskAPI.uploadAttachment(taskId, formData);
      onUpdate([...attachments, data.data.attachment]);
      toast.success('File uploaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await taskAPI.deleteAttachment(taskId, attachmentId);
      onUpdate(attachments.filter(a => a._id !== attachmentId));
      toast.success('Attachment deleted.');
    } catch {
      toast.error('Failed to delete attachment.');
    }
  };


  const handleOpen = (att) => {
  if (att.mimetype === 'application/pdf') {
    const googleViewer = `https://docs.google.com/viewer?url=${encodeURIComponent(att.url)}&embedded=true`;
    window.open(googleViewer, '_blank');
  } else {
    window.open(att.url, '_blank');
  }
};

const handleDownload = (att) => {
  const BASE = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const url = `${BASE}/api/tasks/${taskId}/attachments/${att._id}/download?token=${token}`;
  window.open(url, '_blank');
};

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        📎 Attachments
        <span style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>
          {attachments.length}
        </span>
      </div>

      {attachments.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>No attachments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {attachments.map(att => {
            console.log('attachment:', att);
            return (
              <div key={att._id || att.publicId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                background: 'var(--bg-hover)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 20 }}>{FILE_ICONS[att.mimetype] || '📁'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.originalName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(att.size)}</div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {/* OPEN */}
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    title="Open"
                    onClick={() => handleOpen(att)}
                  >👁</button>

                  {/* DOWNLOAD */}
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    title="Download"
                    onClick={() => handleDownload(att)}
                  >⬇</button>
                </div>

                {isAdmin && (
                  <button className="btn btn-danger btn-sm btn-icon" title="Delete"
                    onClick={() => handleDelete(att._id)}>🗑</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div>
        <input
          ref={fileRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleUpload}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Uploading...' : '📎 Attach File'}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>Max 10MB</span>
      </div>
    </div>
  );
};

export default AttachmentSection;