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
                                    <td data-label="Date">{formatDate(earning.created_at)}</td>
                                    <td data-label="Tenant">{earning.tenant?.name || '-'}</td>
                                    <td data-label="Plan">
                                        <span className="plan-badge">{earning.subscription_plan}</span>
                                    </td>
                                    <td data-label="Price">{formatCurrency(earning.subscription_price)}</td>
                                    <td data-label="Commission" className="commission">{formatCurrency(earning.commission_amount)}</td>
                                    <td data-label="Status">
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
        h1 { margin: 0; font-size: 24px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; font-size: 14px; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: white; padding: 16px 20px; border-radius: 16px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .stat-icon { font-size: 28px; flex-shrink: 0; }
        .stat-label { font-size: 12px; color: #666; }
        .stat-value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .stat-card.pending { border-left: 4px solid #f59e0b; }
        .stat-card.paid { border-left: 4px solid #10b981; }
        .stat-card.total { border-left: 4px solid #667eea; }

        .loading, .empty-state { text-align: center; padding: 60px 20px; color: #666; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
        .empty-state p { margin: 0; }

        /* Desktop table */
        .table-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 13px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
        th { background: #f9fafb; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; white-space: nowrap; }
        tr:last-child td { border-bottom: none; }

        .plan-badge { background: #ede9fe; color: #7c3aed; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; text-transform: capitalize; }
        .commission { font-weight: 600; color: #10b981; }
        .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; white-space: nowrap; }
        .status-badge.pending { background: #fef3c7; color: #d97706; }
        .status-badge.paid { background: #dcfce7; color: #16a34a; }

        /* Mobile card layout */
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr; gap: 10px; }
          .table-card { background: transparent; box-shadow: none; border-radius: 0; }
          table, thead, tbody, tr, td { display: block; width: 100%; }
          thead { display: none; }
          tr { background: white; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.07); margin-bottom: 12px; overflow: hidden; }
          td { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-bottom: 1px solid #f5f5f5; gap: 12px; }
          tr td:last-child { border-bottom: none; }
          td::before { content: attr(data-label); font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; min-width: 80px; }
          h1 { font-size: 20px; }
        }
      `}</style>
        </div>
    );
}
