'use client';

import { useEffect, useState } from 'react';
import { listTenants, listAffiliators, assignAffiliate, PortalUser } from '@/lib/api';

interface TenantWithAffiliate {
    id: string;
    name: string;
    email: string;
    business_type: string;
    created_at: string;
    affiliator_name?: string;
    affiliator_id?: string;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<TenantWithAffiliate[]>([]);
    const [affiliators, setAffiliators] = useState<PortalUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [tenantsData, affiliatorsData] = await Promise.all([
                listTenants(),
                listAffiliators(),
            ]);
            setTenants(tenantsData);
            setAffiliators(affiliatorsData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAssign = async (tenantId: string, affiliatorId: string) => {
        setAssigning(tenantId);
        try {
            await assignAffiliate(tenantId, affiliatorId);
            loadData();
        } finally {
            setAssigning(null);
        }
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
                <h1>Tenants</h1>
                <p>View and assign affiliates to tenants</p>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : tenants.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🏪</div>
                    <h3>No tenants yet</h3>
                </div>
            ) : (
                <div className="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Business</th>
                                <th>Registered</th>
                                <th>Affiliate</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="tenant-name">{tenant.name}</div>
                                            <div className="tenant-email">{tenant.email}</div>
                                        </div>
                                    </td>
                                    <td>{tenant.business_type || '-'}</td>
                                    <td>{formatDate(tenant.created_at)}</td>
                                    <td>
                                        {tenant.affiliator_name ? (
                                            <span className="affiliate-badge">{tenant.affiliator_name}</span>
                                        ) : (
                                            <span className="no-affiliate">No affiliate</span>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            value={tenant.affiliator_id || ''}
                                            onChange={(e) => handleAssign(tenant.id, e.target.value)}
                                            disabled={assigning === tenant.id}
                                            className="assign-select"
                                        >
                                            <option value="">Assign affiliate...</option>
                                            {affiliators.map((aff) => (
                                                <option key={aff.id} value={aff.id}>
                                                    {aff.name}
                                                </option>
                                            ))}
                                        </select>
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

        .loading, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0; color: #1a1a2e; }

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

        .tenant-cell { }
        .tenant-name { font-weight: 500; color: #1a1a2e; }
        .tenant-email { font-size: 13px; color: #666; }

        .affiliate-badge {
          background: #dbeafe;
          color: #2563eb;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
        }

        .no-affiliate {
          color: #999;
          font-size: 13px;
        }

        .assign-select {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          min-width: 160px;
        }
        .assign-select:focus {
          outline: none;
          border-color: #667eea;
        }
      `}</style>
        </div>
    );
}
