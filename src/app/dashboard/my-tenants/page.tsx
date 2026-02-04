'use client';

import { useEffect, useState } from 'react';
import { getMyTenants, AffiliateTenant } from '@/lib/api';

export default function MyTenantsPage() {
    const [tenants, setTenants] = useState<AffiliateTenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyTenants()
            .then(setTenants)
            .finally(() => setLoading(false));
    }, []);

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
                <h1>My Referred Tenants</h1>
                <p>Tenants who signed up using your referral code</p>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : tenants.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏪</div>
                    <h3>No referred tenants yet</h3>
                    <p>Share your referral code to start earning commissions!</p>
                </div>
            ) : (
                <div className="tenants-grid">
                    {tenants.map((affTenant) => (
                        <div key={affTenant.id} className="tenant-card">
                            <div className="tenant-header">
                                <div className="tenant-avatar">
                                    {affTenant.tenant?.name?.charAt(0) || 'T'}
                                </div>
                                <div className="tenant-info">
                                    <div className="tenant-name">{affTenant.tenant?.name || 'Unknown'}</div>
                                    <div className="tenant-email">{affTenant.tenant?.email}</div>
                                </div>
                            </div>
                            <div className="tenant-details">
                                <div className="detail-row">
                                    <span className="detail-label">Business</span>
                                    <span className="detail-value">{affTenant.tenant?.business_type || '-'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Joined</span>
                                    <span className="detail-value">{formatDate(affTenant.created_at)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Plan</span>
                                    <span className="plan-badge">
                                        {affTenant.tenant?.subscription?.plan || 'Trial'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .page { max-width: 1200px; }
        
        .page-header { margin-bottom: 24px; }
        h1 { margin: 0; font-size: 28px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; }

        .loading, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
        .empty-state p { margin: 0; }

        .tenants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .tenant-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .tenant-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .tenant-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        .tenant-name {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
        }
        .tenant-email {
          font-size: 13px;
          color: #666;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .detail-label {
          font-size: 13px;
          color: #666;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
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
      `}</style>
        </div>
    );
}
