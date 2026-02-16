'use client';

import { useEffect, useState } from 'react';
import {
    listPromoCodes,
    createPromoCode,
    updatePromoCode,
    deactivatePromoCode,
    getPromoCodeUsages,
    listAffiliators,
    PromoCode,
    PromoCodeUsage,
    PortalUser,
} from '@/lib/api';

export default function PromoCodesPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('');
    const [affiliators, setAffiliators] = useState<(PortalUser & { tenant_count: number })[]>([]);

    // Form state
    const [formCode, setFormCode] = useState('');
    const [formReferralCode, setFormReferralCode] = useState('');
    const [formDiscountType, setFormDiscountType] = useState('percentage');
    const [formDiscountValue, setFormDiscountValue] = useState('');
    const [formValidFrom, setFormValidFrom] = useState('');
    const [formValidUntil, setFormValidUntil] = useState('');
    const [formMaxUses, setFormMaxUses] = useState('');
    const [formApplicablePlans, setFormApplicablePlans] = useState('');

    // Usage drawer
    const [usagePromo, setUsagePromo] = useState<PromoCode | null>(null);
    const [usages, setUsages] = useState<PromoCodeUsage[]>([]);
    const [usageLoading, setUsageLoading] = useState(false);

    const loadPromoCodes = async () => {
        try {
            const res = await listPromoCodes(filter || undefined);
            setPromoCodes(res.promo_codes || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAffiliators = async () => {
        try {
            const data = await listAffiliators();
            setAffiliators(data);
        } catch { }
    };

    useEffect(() => {
        loadPromoCodes();
        loadAffiliators();
    }, [filter]);

    const resetForm = () => {
        setFormCode('');
        setFormReferralCode('');
        setFormDiscountType('percentage');
        setFormDiscountValue('');
        setFormValidFrom('');
        setFormValidUntil('');
        setFormMaxUses('');
        setFormApplicablePlans('');
        setEditingPromo(null);
    };

    const openCreate = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = (promo: PromoCode) => {
        setEditingPromo(promo);
        setFormCode(promo.code);
        setFormReferralCode(promo.referral_code || '');
        setFormDiscountType(promo.discount_type);
        setFormDiscountValue(String(promo.discount_value));
        setFormValidFrom(promo.valid_from.slice(0, 10));
        setFormValidUntil(promo.valid_until.slice(0, 10));
        setFormMaxUses(promo.max_uses ? String(promo.max_uses) : '');
        setFormApplicablePlans(promo.applicable_plans);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const data: any = {
                discount_type: formDiscountType,
                discount_value: parseFloat(formDiscountValue),
                valid_from: formValidFrom,
                valid_until: formValidUntil,
                applicable_plans: formApplicablePlans,
            };
            if (formMaxUses) data.max_uses = parseInt(formMaxUses);

            if (editingPromo) {
                if (formReferralCode && !editingPromo.referral_code) {
                    data.referral_code = formReferralCode;
                }
                await updatePromoCode(editingPromo.id, data);
                setSuccess('Kode promo berhasil diperbarui');
            } else {
                data.code = formCode;
                if (formReferralCode) data.referral_code = formReferralCode;
                await createPromoCode(data);
                setSuccess('Kode promo berhasil dibuat');
            }

            setShowForm(false);
            resetForm();
            loadPromoCodes();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (promo: PromoCode) => {
        if (!confirm(`Nonaktifkan promo "${promo.full_code}"?`)) return;
        try {
            await deactivatePromoCode(promo.id);
            setSuccess('Kode promo dinonaktifkan');
            loadPromoCodes();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleToggleActive = async (promo: PromoCode) => {
        try {
            await updatePromoCode(promo.id, { is_active: !promo.is_active });
            loadPromoCodes();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openUsages = async (promo: PromoCode) => {
        setUsagePromo(promo);
        setUsageLoading(true);
        try {
            const res = await getPromoCodeUsages(promo.id);
            setUsages(res.usages || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUsageLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    const isExpired = (promo: PromoCode) => new Date(promo.valid_until) < new Date();
    const isUpcoming = (promo: PromoCode) => new Date(promo.valid_from) > new Date();

    const getStatus = (promo: PromoCode) => {
        if (!promo.is_active) return { label: 'Nonaktif', className: 'inactive' };
        if (isExpired(promo)) return { label: 'Kedaluwarsa', className: 'expired' };
        if (isUpcoming(promo)) return { label: 'Akan Datang', className: 'upcoming' };
        return { label: 'Aktif', className: 'active' };
    };

    const getDiscountDisplay = (promo: PromoCode) => {
        if (promo.discount_type === 'percentage') return `${promo.discount_value}%`;
        return formatCurrency(promo.discount_value);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Promo Codes</h1>
                    <p>Kelola kode promo dan diskon</p>
                </div>
                <div className="header-actions">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                        <option value="">Semua</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                    <button onClick={openCreate} className="primary-btn">+ Buat Promo</button>
                </div>
            </div>

            {error && <div className="error-box">{error} <button onClick={() => setError('')}>✕</button></div>}
            {success && <div className="success-box">{success} <button onClick={() => setSuccess('')}>✕</button></div>}

            {/* Create/Edit Form */}
            {showForm && (
                <div className="form-card">
                    <div className="form-header">
                        <h3>{editingPromo ? 'Edit Promo' : 'Buat Promo Baru'}</h3>
                        <button onClick={() => { setShowForm(false); resetForm(); }} className="close-btn">✕</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {!editingPromo && (
                                <div className="form-group">
                                    <label>Kode Promo (3-10 karakter)</label>
                                    <input
                                        type="text"
                                        value={formCode}
                                        onChange={(e) => setFormCode(e.target.value.toUpperCase().slice(0, 10))}
                                        placeholder="LAUNCH"
                                        required
                                        maxLength={10}
                                        minLength={3}
                                        pattern="[A-Z0-9]{3,10}"
                                        title="3-10 karakter alfanumerik"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Kode Referral {editingPromo?.referral_code ? '(terkunci)' : '(opsional)'}</label>
                                <select
                                    value={formReferralCode}
                                    onChange={(e) => setFormReferralCode(e.target.value)}
                                    disabled={!!editingPromo?.referral_code}
                                >
                                    <option value="">Tanpa referral</option>
                                    {affiliators
                                        .filter(a => a.is_active && a.referral_code)
                                        .map(a => (
                                            <option key={a.id} value={a.referral_code}>
                                                {a.referral_code} — {a.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tipe Diskon</label>
                                <select value={formDiscountType} onChange={(e) => setFormDiscountType(e.target.value)}>
                                    <option value="percentage">Persentase (%)</option>
                                    <option value="fixed">Nominal Tetap (Rp)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Nilai Diskon {formDiscountType === 'percentage' ? '(1-99%)' : '(Rp)'}</label>
                                <input
                                    type="number"
                                    value={formDiscountValue}
                                    onChange={(e) => setFormDiscountValue(e.target.value)}
                                    placeholder={formDiscountType === 'percentage' ? '20' : '50000'}
                                    required
                                    min={1}
                                    max={formDiscountType === 'percentage' ? 99 : undefined}
                                />
                            </div>
                            <div className="form-group">
                                <label>Berlaku Dari</label>
                                <input type="date" value={formValidFrom} onChange={(e) => setFormValidFrom(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Berlaku Sampai</label>
                                <input type="date" value={formValidUntil} onChange={(e) => setFormValidUntil(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Maks. Penggunaan (kosongkan = tanpa batas)</label>
                                <input
                                    type="number"
                                    value={formMaxUses}
                                    onChange={(e) => setFormMaxUses(e.target.value)}
                                    placeholder="100"
                                    min={1}
                                />
                            </div>
                            <div className="form-group">
                                <label>Paket Berlaku (kosongkan = semua)</label>
                                <input
                                    type="text"
                                    value={formApplicablePlans}
                                    onChange={(e) => setFormApplicablePlans(e.target.value)}
                                    placeholder="pemula,bisnis"
                                />
                                <small>Pisahkan dengan koma: pemula, bisnis</small>
                            </div>
                        </div>

                        {formCode && (
                            <div className="preview-box">
                                <span className="preview-label">Preview Kode:</span>
                                <code className="preview-code">{formReferralCode ? `${formReferralCode}${formCode}` : formCode}</code>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="cancel-btn">Batal</button>
                            <button type="submit" disabled={submitting} className="submit-btn">
                                {submitting ? 'Menyimpan...' : (editingPromo ? 'Simpan Perubahan' : 'Buat Promo')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Promo Codes Table */}
            {loading ? (
                <div className="loading">Loading...</div>
            ) : promoCodes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🎟️</div>
                    <h3>Belum ada kode promo</h3>
                    <p>Buat kode promo pertama untuk mulai memberikan diskon</p>
                </div>
            ) : (
                <div className="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Diskon</th>
                                <th>Periode</th>
                                <th>Penggunaan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoCodes.map((promo) => {
                                const status = getStatus(promo);
                                return (
                                    <tr key={promo.id}>
                                        <td>
                                            <div>
                                                <code className="code full-code">{promo.full_code}</code>
                                                {promo.referral_code && (
                                                    <div className="ref-tag">🔗 {promo.referral_code}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="discount-badge">
                                                {getDiscountDisplay(promo)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="period-cell">
                                                {formatDate(promo.valid_from)} — {formatDate(promo.valid_until)}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className="usage-link"
                                                onClick={() => openUsages(promo)}
                                            >
                                                {promo.current_uses}{promo.max_uses ? ` / ${promo.max_uses}` : ''}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${status.className}`}>{status.label}</span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => openEdit(promo)} className="action-btn edit" title="Edit">✏️</button>
                                                <button onClick={() => handleToggleActive(promo)} className="action-btn toggle"
                                                    title={promo.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                                                    {promo.is_active ? '🔴' : '🟢'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Usage Drawer */}
            {usagePromo && (
                <div className="drawer-overlay" onClick={() => setUsagePromo(null)}>
                    <div className="drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3>Penggunaan: <code>{usagePromo.full_code}</code></h3>
                            <button onClick={() => setUsagePromo(null)} className="close-btn">✕</button>
                        </div>
                        <div className="drawer-body">
                            {usageLoading ? (
                                <div className="loading">Loading...</div>
                            ) : usages.length === 0 ? (
                                <div className="empty-state small">
                                    <p>Belum ada penggunaan</p>
                                </div>
                            ) : (
                                <div className="usage-list">
                                    {usages.map((u) => (
                                        <div key={u.id} className="usage-item">
                                            <div className="usage-tenant">{u.tenant?.name || u.tenant_id}</div>
                                            <div className="usage-meta">
                                                <span>Diskon: {formatCurrency(u.discount_amount)}</span>
                                                <span>{formatDate(u.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page { max-width: 1200px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
                h1 { margin: 0; font-size: 28px; color: #1a1a2e; }
                .page-header p { margin: 4px 0 0; color: #666; }
                .header-actions { display: flex; gap: 12px; align-items: center; }
                .filter-select { padding: 10px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; background: white; }
                .primary-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; white-space: nowrap; }
                .primary-btn:hover { opacity: 0.9; }

                .error-box, .success-box { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
                .error-box { background: #fee2e2; color: #dc2626; }
                .success-box { background: #dcfce7; color: #16a34a; }
                .error-box button, .success-box button { background: none; border: none; cursor: pointer; font-size: 16px; padding: 0 4px; }

                .form-card { background: white; padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
                .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .form-header h3 { margin: 0; font-size: 18px; }
                .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #666; padding: 4px 8px; }
                .close-btn:hover { color: #333; }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 13px; font-weight: 600; color: #444; }
                .form-group input, .form-group select { padding: 10px 14px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; }
                .form-group input:focus, .form-group select:focus { border-color: #667eea; outline: none; }
                .form-group small { color: #999; font-size: 12px; }

                .preview-box { margin-top: 16px; padding: 12px 16px; background: #f0f4ff; border-radius: 10px; display: flex; align-items: center; gap: 12px; }
                .preview-label { font-size: 13px; color: #667eea; font-weight: 600; }
                .preview-code { font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #1a1a2e; background: white; padding: 6px 14px; border-radius: 8px; }

                .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
                .cancel-btn { padding: 10px 24px; border: 2px solid #e0e0e0; border-radius: 10px; background: white; cursor: pointer; font-weight: 500; }
                .submit-btn { padding: 10px 24px; background: #10b981; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .loading, .empty-state { text-align: center; padding: 60px 20px; color: #666; }
                .empty-icon { font-size: 48px; margin-bottom: 12px; }
                .empty-state h3 { margin: 0 0 8px; color: #1a1a2e; }
                .empty-state p { margin: 0; }
                .empty-state.small { padding: 30px 20px; }

                .table-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; min-width: 700px; }
                th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #f0f0f0; }
                th { background: #f9fafb; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }

                .code { background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
                .full-code { font-size: 14px; font-weight: 600; letter-spacing: 1px; }
                .ref-tag { font-size: 11px; color: #667eea; margin-top: 4px; }

                .discount-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #78350f; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }

                .period-cell { font-size: 13px; color: #555; white-space: nowrap; }

                .usage-link { cursor: pointer; color: #667eea; font-weight: 600; }
                .usage-link:hover { text-decoration: underline; }

                .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
                .badge.active { background: #dcfce7; color: #16a34a; }
                .badge.inactive { background: #fee2e2; color: #dc2626; }
                .badge.expired { background: #f3f4f6; color: #6b7280; }
                .badge.upcoming { background: #dbeafe; color: #2563eb; }

                .actions { display: flex; gap: 4px; }
                .action-btn { background: none; border: 1px solid #e0e0e0; border-radius: 8px; padding: 6px 10px; cursor: pointer; font-size: 14px; }
                .action-btn:hover { background: #f5f5f5; }

                .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 2000; display: flex; justify-content: flex-end; }
                .drawer { width: 420px; max-width: 90vw; background: white; height: 100vh; overflow-y: auto; box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
                .drawer-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
                .drawer-header h3 { margin: 0; font-size: 16px; }
                .drawer-header code { font-size: 14px; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
                .drawer-body { padding: 24px; }
                .usage-list { display: flex; flex-direction: column; gap: 12px; }
                .usage-item { padding: 14px; background: #f9fafb; border-radius: 10px; }
                .usage-tenant { font-weight: 600; margin-bottom: 6px; }
                .usage-meta { display: flex; justify-content: space-between; font-size: 13px; color: #666; }
            `}</style>
        </div>
    );
}
