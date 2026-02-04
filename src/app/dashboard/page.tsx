'use client';

import { useEffect, useState } from 'react';
import { getMe, getDashboardStats, getMyStats, PortalUser, DashboardStats, MyStats } from '@/lib/api';

export default function DashboardPage() {
    const [user, setUser] = useState<PortalUser | null>(null);
    const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
    const [myStats, setMyStats] = useState<MyStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await getMe();
                setUser(userData);

                if (userData.role === 'super_admin') {
                    const stats = await getDashboardStats();
                    setAdminStats(stats);
                } else {
                    const stats = await getMyStats();
                    setMyStats(stats);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="dashboard">
            <h1>Welcome, {user?.name}! 👋</h1>

            {user?.role === 'super_admin' && adminStats && (
                <div className="stats-grid">
                    <div className="stat-card purple">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-value">{adminStats.affiliator_count}</div>
                            <div className="stat-label">Total Affiliators</div>
                        </div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-icon">🏪</div>
                        <div className="stat-content">
                            <div className="stat-value">{adminStats.referred_tenants}</div>
                            <div className="stat-label">Referred Tenants</div>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <div className="stat-value">{formatCurrency(adminStats.total_commission)}</div>
                            <div className="stat-label">Total Commission</div>
                        </div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <div className="stat-value">{formatCurrency(adminStats.pending_commission)}</div>
                            <div className="stat-label">Pending Payouts</div>
                        </div>
                    </div>
                </div>
            )}

            {user?.role === 'affiliator' && myStats && (
                <>
                    <div className="referral-box">
                        <div className="referral-label">Your Referral Code</div>
                        <div className="referral-code">{myStats.referral_code}</div>
                        <button
                            onClick={() => navigator.clipboard.writeText(`https://warungin.com?ref=${myStats.referral_code}`)}
                            className="copy-btn"
                        >
                            Copy Link 📋
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-icon">🏪</div>
                            <div className="stat-content">
                                <div className="stat-value">{myStats.tenant_count}</div>
                                <div className="stat-label">Referred Tenants</div>
                            </div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-icon">💵</div>
                            <div className="stat-content">
                                <div className="stat-value">{formatCurrency(myStats.this_month_earnings)}</div>
                                <div className="stat-label">This Month</div>
                            </div>
                        </div>
                        <div className="stat-card orange">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <div className="stat-value">{formatCurrency(myStats.pending_payout)}</div>
                                <div className="stat-label">Pending Payout</div>
                            </div>
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <div className="stat-value">{formatCurrency(myStats.total_earned)}</div>
                                <div className="stat-label">Total Earned</div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
        .dashboard { max-width: 1200px; }
        h1 { margin: 0 0 24px; font-size: 28px; color: #1a1a2e; }
        .loading { padding: 40px; text-align: center; color: #666; }

        .referral-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          text-align: center;
        }
        .referral-label { font-size: 14px; opacity: 0.9; margin-bottom: 8px; }
        .referral-code { font-size: 32px; font-weight: 700; letter-spacing: 2px; margin-bottom: 16px; }
        .copy-btn {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.3); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-card.purple .stat-icon { background: rgba(102, 126, 234, 0.15); }
        .stat-card.blue .stat-icon { background: rgba(59, 130, 246, 0.15); }
        .stat-card.green .stat-icon { background: rgba(16, 185, 129, 0.15); }
        .stat-card.orange .stat-icon { background: rgba(245, 158, 11, 0.15); }

        .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
        .stat-label { font-size: 14px; color: #666; margin-top: 4px; }
      `}</style>
        </div>
    );
}
