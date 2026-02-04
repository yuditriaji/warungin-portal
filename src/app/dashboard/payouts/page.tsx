'use client';

import { useEffect, useState } from 'react';
import { listAffiliators, recordPayout, PortalUser } from '@/lib/api';

export default function PayoutsPage() {
    const [affiliators, setAffiliators] = useState<(PortalUser & { tenant_count: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAff, setSelectedAff] = useState<PortalUser | null>(null);
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        listAffiliators()
            .then(setAffiliators)
            .finally(() => setLoading(false));
    }, []);

    const handlePayout = async () => {
        if (!selectedAff || !amount) return;
        setProcessing(true);
        setMessage('');

        try {
            const result = await recordPayout(selectedAff.id, parseFloat(amount));
            setMessage(result.message);
            setAmount('');
            setSelectedAff(null);
            // Refresh
            const data = await listAffiliators();
            setAffiliators(data);
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const affiliatorsWithPending = affiliators.filter((a) => a.pending_payout > 0);

    return (
        <div className="page">
            <div className="page-header">
                <h1>Payouts</h1>
                <p>Record manual payouts to affiliators</p>
            </div>

            {message && (
                <div className={`message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="payout-form">
                <h3>Record Payout</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Affiliator</label>
                        <select
                            value={selectedAff?.id || ''}
                            onChange={(e) => {
                                const aff = affiliators.find((a) => a.id === e.target.value);
                                setSelectedAff(aff || null);
                                if (aff) setAmount(aff.pending_payout.toString());
                            }}
                        >
                            <option value="">Select affiliator...</option>
                            {affiliatorsWithPending.map((aff) => (
                                <option key={aff.id} value={aff.id}>
                                    {aff.name} - {formatCurrency(aff.pending_payout)} pending
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Amount (IDR)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            disabled={!selectedAff}
                            max={selectedAff?.pending_payout}
                        />
                    </div>
                    <div className="form-group">
                        <label>&nbsp;</label>
                        <button
                            onClick={handlePayout}
                            disabled={!selectedAff || !amount || processing}
                        >
                            {processing ? 'Processing...' : 'Record Payout'}
                        </button>
                    </div>
                </div>

                {selectedAff && (
                    <div className="bank-info">
                        <h4>Bank Details</h4>
                        <p>
                            <strong>{selectedAff.bank_name || 'Not provided'}</strong><br />
                            {selectedAff.bank_account || '-'}<br />
                            {selectedAff.bank_holder || '-'}
                        </p>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Affiliator</th>
                                <th>Bank</th>
                                <th>Account</th>
                                <th>Pending</th>
                                <th>Total Paid</th>
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
                                    <td>{aff.bank_name || '-'}</td>
                                    <td>
                                        <div>
                                            <div>{aff.bank_account || '-'}</div>
                                            <div className="bank-holder">{aff.bank_holder}</div>
                                        </div>
                                    </td>
                                    <td className={aff.pending_payout > 0 ? 'pending' : ''}>
                                        {formatCurrency(aff.pending_payout)}
                                    </td>
                                    <td>{formatCurrency(aff.total_earnings)}</td>
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

        .message {
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }
        .message.success { background: #dcfce7; color: #16a34a; }
        .message.error { background: #fee2e2; color: #dc2626; }

        .payout-form {
          background: white;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .payout-form h3 { margin: 0 0 16px; }

        .form-grid {
          display: grid;
          grid-template-columns: 2fr 1fr auto;
          gap: 16px;
          align-items: end;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #666;
        }
        .form-group select,
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 14px;
        }
        .form-group button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .form-group button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .bank-info {
          margin-top: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 10px;
        }
        .bank-info h4 { margin: 0 0 8px; font-size: 14px; }
        .bank-info p { margin: 0; line-height: 1.6; }

        .loading { text-align: center; padding: 40px; color: #666; }

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

        .bank-holder { font-size: 12px; color: #666; }
        .pending { color: #f59e0b; font-weight: 600; }
      `}</style>
        </div>
    );
}
