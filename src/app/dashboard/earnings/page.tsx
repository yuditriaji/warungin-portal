'use client';

import { useEffect, useState } from 'react';
import { listEarnings, AffiliateEarning } from '@/lib/api';

export default function EarningsPage() {
    const [earnings, setEarnings] = useState<AffiliateEarning[]>([]);
    const [totalPending, setTotalPending] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listEarnings()
            .then((data) => {
                setEarnings(data.earnings);
                setTotalPending(data.total_pending);
                setTotalPaid(data.total_paid);
            })
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Earnings</h1>
                    <p>Commission history from referrals</p>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div>
                        <div className="stat-label">Pending</div>
                        <div className="stat-value">{formatCurrency(totalPending)}</div>
                    </div>
                </div>
                <div className="stat-card paid">
                    <div className="stat-icon">✅</div>
                    <div>
                        <div className="stat-label">Paid</div>
                        <div className="stat-value">{formatCurrency(totalPaid)}</div>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">💰</div>
                    <div>
                        <div className="stat-label">Total</div>
                        <div className="stat-value">{formatCurrency(totalPending + totalPaid)}</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : earnings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💰</div>
                    <h3>No earnings yet</h3>
                    <p>Earnings will appear here when referred tenants make subscription payments</p>
                </div>
            ) : (
                <div className="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Tenant</th>
                                <th>Plan</th>
                                <th>Price</th>
                                <th>Commission</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.map((earning) => (
                                <tr key={earning.id}>
                                    <td>{formatDate(earning.created_at)}</td>
                                    <td>{earning.tenant?.name || '-'}</td>
                                    <td>
                                        <span className="plan-badge">{earning.subscription_plan}</span>
                                    </td>
                                    <td>{formatCurrency(earning.subscription_price)}</td>
                                    <td className="commission">{formatCurrency(earning.commission_amount)}</td>
                                    <td>
                                        <span className={`status-badge ${earning.status}`}>
                                            {earning.status === 'pending' ? '⏳ Pending' : '✅ Paid'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
        .page { max-width: 1200px; }
        
        .page-header { margin-bottom: 24px; }
        h1 { margin: 0; font-size: 28px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .stat-icon { font-size: 32px; }
        .stat-label { font-size: 13px; color: #666; }
        .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }

        .stat-card.pending { border-left: 4px solid #f59e0b; }
        .stat-card.paid { border-left: 4px solid #10b981; }
        .stat-card.total { border-left: 4px solid #667eea; }

        .loading, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
        .empty-state p { margin: 0; }

        .table-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        
        table { width: 100%; border-collapse: collapse; }
        th, td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }
        th {
          background: #f9fafb;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }

        .plan-badge {
          background: #ede9fe;
          color: #7c3aed;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .commission {
          font-weight: 600;
          color: #10b981;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge.pending { background: #fef3c7; color: #d97706; }
        .status-badge.paid { background: #dcfce7; color: #16a34a; }
      `}</style>
        </div>
    );
}
