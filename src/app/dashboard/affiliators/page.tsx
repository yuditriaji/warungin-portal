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
                  <td data-label="Name">
                    <div className="user-cell">
                      <div className="avatar">{aff.name.charAt(0)}</div>
                      <span>{aff.name}</span>
                    </div>
                  </td>
                  <td data-label="Email">{aff.email}</td>
                  <td data-label="Referral"><code className="code">{aff.referral_code}</code></td>
                  <td data-label="Tenants">{aff.tenant_count}</td>
                  <td data-label="Pending">{formatCurrency(aff.pending_payout)}</td>
                  <td data-label="Status">
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
        .page { max-width: 1200px; overflow: hidden; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
        h1 { margin: 0; font-size: 24px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; font-size: 14px; }
        .primary-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }

        .invite-form { background: white; padding: 20px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .invite-form h3 { margin: 0 0 16px; }
        .form-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .form-row input { flex: 1; min-width: 140px; padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; }
        .form-row button { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 500; flex-shrink: 0; }

        .invite-success { margin-top: 16px; padding: 16px; background: #ecfdf5; border-radius: 10px; }
        .invite-success p { margin: 0 0 8px; color: #059669; }
        .invite-link { display: flex; gap: 8px; flex-wrap: wrap; }
        .invite-link code { flex: 1; min-width: 120px; padding: 8px 12px; background: white; border-radius: 6px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; word-break: break-all; }
        .invite-link button { padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; white-space: nowrap; }

        .error-box { background: #fee2e2; color: #dc2626; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; }
        .loading, .empty-state { text-align: center; padding: 60px 20px; color: #666; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
        .empty-state p { margin: 0; }

        /* Desktop table */
        .table-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
        th { background: #f9fafb; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; white-space: nowrap; }
        tr:last-child td { border-bottom: none; }

        .user-cell { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; flex-shrink: 0; }
        .code { background: #f5f5f5; padding: 3px 7px; border-radius: 4px; font-size: 12px; }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .badge.active { background: #dcfce7; color: #16a34a; }
        .badge.inactive { background: #fee2e2; color: #dc2626; }

        /* Mobile card layout */
        @media (max-width: 640px) {
          .table-card { background: transparent; box-shadow: none; border-radius: 0; overflow: visible; }
          table, thead, tbody { display: block; width: 100%; }
          thead { display: none; }
          tr { display: block; background: white; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.07); margin-bottom: 12px; overflow: hidden; width: 100%; }
          td {
            display: flex; align-items: center; padding: 11px 16px;
            border-bottom: 1px solid #f5f5f5; gap: 12px; overflow: hidden;
            width: 100%; box-sizing: border-box;
          }
          tr td:last-child { border-bottom: none; }
          td::before {
            content: attr(data-label); font-size: 11px; font-weight: 700;
            color: #aaa; text-transform: uppercase; letter-spacing: 0.5px;
            flex: 0 0 72px; white-space: nowrap;
          }
          td > div, td > span, td > code {
            flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis;
            text-align: right; white-space: nowrap;
          }
          .user-cell { white-space: nowrap; }
          h1 { font-size: 20px; }
          .invite-form { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
