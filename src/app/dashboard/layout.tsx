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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
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
          transition: transform 0.3s;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo { font-size: 28px; }
        .logo-text { font-size: 18px; font-weight: 600; }

        .nav {
          flex: 1;
          padding: 16px 12px;
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
        }

        .user-name { font-size: 14px; font-weight: 500; }
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
        }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; }
        }

        .top-bar {
          background: white;
          padding: 16px 24px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .menu-toggle { display: block; }
        }

        .referral-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
        }

        .content {
          padding: 24px;
        }
      `}</style>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
