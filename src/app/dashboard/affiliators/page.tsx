'use client';

import { useEffect, useState } from 'react';
import { listAffiliators, inviteAffiliator, PortalUser } from '@/lib/api';

export default function AffiliatorsPage() {
    const [affiliators, setAffiliators] = useState<(PortalUser & { tenant_count: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviting, setInviting] = useState(false);
    const [inviteUrl, setInviteUrl] = useState('');
    const [error, setError] = useState('');

    const loadAffiliators = async () => {
        try {
            const data = await listAffiliators();
            setAffiliators(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAffiliators();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setError('');
        setInviteUrl('');

        try {
            const result = await inviteAffiliator(inviteEmail, inviteName);
            setInviteUrl(result.data.invite_url);
            setInviteEmail('');
            setInviteName('');
            loadAffiliators();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Affiliators</h1>
                    <p>Manage your affiliate partners</p>
                </div>
                <button onClick={() => setShowInvite(!showInvite)} className="primary-btn">
                    + Invite Affiliator
                </button>
            </div>

            {showInvite && (
                <div className="invite-form">
                    <h3>Invite New Affiliator</h3>
                    <form onSubmit={handleInvite}>
                        <div className="form-row">
                            <input
                                type="text"
                                placeholder="Name"
                                value={inviteName}
                                onChange={(e) => setInviteName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={inviting}>
                                {inviting ? 'Sending...' : 'Send Invite'}
                            </button>
                        </div>
                    </form>
                    {inviteUrl && (
                        <div className="invite-success">
                            <p>✅ Invitation created! Share this link:</p>
                            <div className="invite-link">
                                <code>{inviteUrl}</code>
                                <button onClick={() => navigator.clipboard.writeText(inviteUrl)}>Copy</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && <div className="error-box">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : affiliators.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No affiliators yet</h3>
                    <p>Invite your first affiliate partner to get started</p>
                </div>
            ) : (
                <div className="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Referral Code</th>
                                <th>Tenants</th>
                                <th>Pending</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {affiliators.map((aff) => (
                                <tr key={aff.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">{aff.name.charAt(0)}</div>
                                            <span>{aff.name}</span>
                                        </div>
                                    </td>
                                    <td>{aff.email}</td>
                                    <td><code className="code">{aff.referral_code}</code></td>
                                    <td>{aff.tenant_count}</td>
                                    <td>{formatCurrency(aff.pending_payout)}</td>
                                    <td>
                                        <span className={`badge ${aff.is_active ? 'active' : 'inactive'}`}>
                                            {aff.is_active ? 'Active' : 'Inactive'}
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
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        h1 { margin: 0; font-size: 28px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; }

        .primary-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .invite-form {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .invite-form h3 { margin: 0 0 16px; }
        
        .form-row {
          display: flex;
          gap: 12px;
        }
        .form-row input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
        }
        .form-row button {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
        }

        .invite-success {
          margin-top: 16px;
          padding: 16px;
          background: #ecfdf5;
          border-radius: 10px;
        }
        .invite-success p { margin: 0 0 8px; color: #059669; }
        .invite-link {
          display: flex;
          gap: 8px;
        }
        .invite-link code {
          flex: 1;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .invite-link button {
          padding: 8px 16px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .error-box {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

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
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
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

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .code {
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge.active { background: #dcfce7; color: #16a34a; }
        .badge.inactive { background: #fee2e2; color: #dc2626; }
      `}</style>
        </div>
    );
}
