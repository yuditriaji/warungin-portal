'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getMe, logout, isAuthenticated, PortalUser } from '@/lib/api';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fa;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';

  const navItems = isSuperAdmin
    ? [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/dashboard/affiliators', label: 'Affiliators', icon: '👥' },
      { href: '/dashboard/tenants', label: 'Tenants', icon: '🏪' },
      { href: '/dashboard/earnings', label: 'Earnings', icon: '💰' },
      { href: '/dashboard/payouts', label: 'Payouts', icon: '💸' },
    ]
    : [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/dashboard/my-tenants', label: 'My Tenants', icon: '🏪' },
      { href: '/dashboard/earnings', label: 'Earnings', icon: '💰' },
    ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="logo">🎯</span>
          <span className="logo-text">Warungin Portal</span>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role === 'super_admin' ? 'Super Admin' : 'Affiliator'}</div>
            </div>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          {user?.role === 'affiliator' && user.referral_code && (
            <div className="referral-badge">
              Your Code: <strong>{user.referral_code}</strong>
            </div>
          )}
        </header>
        <div className="content">{children}</div>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }

        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          position: fixed;
          height: 100vh;
          z-index: 1000;
          left: 0;
          top: 0;
        }

        @media (max-width: 768px) {
          .sidebar { 
            transform: translateX(-100%); 
            width: 280px;
          }
          .sidebar.open { 
            transform: translateX(0); 
            box-shadow: 4px 0 20px rgba(0,0,0,0.3);
          }
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .close-sidebar {
          display: none;
          margin-left: auto;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 20px;
          cursor: pointer;
          padding: 4px 8px;
        }

        @media (max-width: 768px) {
          .close-sidebar { display: block; }
        }

        .close-sidebar:hover {
          color: white;
        }

        .logo { font-size: 28px; }
        .logo-text { font-size: 18px; font-weight: 600; flex: 1; }

        .nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          border-radius: 10px;
          margin-bottom: 4px;
          transition: all 0.2s;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(102, 126, 234, 0.2);
          color: white;
        }

        .nav-icon { font-size: 18px; }
        .nav-label { font-size: 14px; font-weight: 500; }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-details {
          overflow: hidden;
        }

        .user-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 12px; color: rgba(255,255,255,0.5); }

        .logout-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        .logout-btn:hover { background: rgba(255,255,255,0.2); }

        .main-content {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; }
        }

        .top-bar {
          background: white;
          padding: 12px 16px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .menu-toggle {
          display: none;
          background: #f0f0f0;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .menu-toggle:hover {
          background: #e0e0e0;
        }

        @media (max-width: 768px) {
          .menu-toggle { display: block; }
        }

        .referral-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 480px) {
          .referral-badge {
            font-size: 11px;
            padding: 6px 10px;
          }
        }

        .content {
          padding: 16px;
          flex: 1;
        }

        @media (min-width: 768px) {
          .content {
            padding: 24px;
          }
        }
      `}</style>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
