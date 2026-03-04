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
                                <th>Assign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td data-label="Tenant">
                                        <div className="tenant-name">{tenant.name}</div>
                                        <div className="tenant-email">{tenant.email}</div>
                                    </td>
                                    <td data-label="Business">{tenant.business_type || '-'}</td>
                                    <td data-label="Registered">{formatDate(tenant.created_at)}</td>
                                    <td data-label="Affiliate">
                                        {tenant.affiliator_name ? (
                                            <span className="affiliate-badge">{tenant.affiliator_name}</span>
                                        ) : (
                                            <span className="no-affiliate">No affiliate</span>
                                        )}
                                    </td>
                                    <td data-label="Assign">
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
        h1 { margin: 0; font-size: 24px; color: #1a1a2e; }
        .page-header p { margin: 4px 0 0; color: #666; font-size: 14px; }

        .loading, .empty-state { text-align: center; padding: 60px 20px; color: #666; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty-state h3 { margin: 0; color: #1a1a2e; }

        /* Desktop table */
        .table-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
        th { background: #f9fafb; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; white-space: nowrap; }
        tr:last-child td { border-bottom: none; }

        .tenant-name { font-weight: 500; color: #1a1a2e; font-size: 14px; }
        .tenant-email { font-size: 12px; color: #888; margin-top: 2px; }
        .affiliate-badge { background: #dbeafe; color: #2563eb; padding: 3px 10px; border-radius: 20px; font-size: 12px; }
        .no-affiliate { color: #bbb; font-size: 12px; }
        .assign-select { padding: 7px 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 13px; cursor: pointer; width: 100%; max-width: 180px; background: white; }
        .assign-select:focus { outline: none; border-color: #667eea; }

        /* Mobile card layout */
        @media (max-width: 640px) {
          .table-card { background: transparent; box-shadow: none; border-radius: 0; }
          table, thead, tbody, tr, td { display: block; width: 100%; }
          thead { display: none; }
          tr { background: white; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.07); margin-bottom: 12px; overflow: hidden; }
          td { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; border-bottom: 1px solid #f5f5f5; gap: 12px; }
          tr td:last-child { border-bottom: none; }
          td::before { content: attr(data-label); font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; min-width: 76px; }
          .assign-select { max-width: none; flex: 1; }
        }
      `}</style>
        </div>
    );
}
