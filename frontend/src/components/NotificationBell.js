import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationsRead } from '../services/api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = () => {
    getNotifications().then((r) => {
      setItems(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  const markAllRead = () => {
    markNotificationsRead().then(load);
  };

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary rounded-pill position-relative"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-bell" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="position-fixed inset-0" style={{ zIndex: 1040 }} onClick={() => setOpen(false)} />
          <div className="card-mw position-absolute end-0 mt-2 p-0" style={{ width: 320, zIndex: 1050, maxHeight: 400, overflow: 'hidden' }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <strong>Notifications</strong>
              {unread > 0 && <button type="button" className="btn btn-link btn-sm p-0" onClick={markAllRead}>Mark all read</button>}
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {items.length === 0 ? (
                <p className="text-muted small p-3 mb-0">No notifications yet</p>
              ) : items.map((n) => (
                <div key={n.id} className={`p-3 border-bottom ${n.read ? '' : 'bg-primary bg-opacity-10'}`}>
                  <div className="fw-semibold small">{n.title}</div>
                  <div className="text-muted small">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
