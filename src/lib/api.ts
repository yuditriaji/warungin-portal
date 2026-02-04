const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.warungin.com';

// Token management
export const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('portal_token');
};

export const setToken = (token: string) => {
    localStorage.setItem('portal_token', token);
};

export const removeToken = () => {
    localStorage.removeItem('portal_token');
};

export const isAuthenticated = () => {
    return !!getToken();
};

// API helper
async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// Types
export interface PortalUser {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: 'super_admin' | 'affiliator';
    referral_code: string;
    bank_name: string;
    bank_account: string;
    bank_holder: string;
    total_earnings: number;
    pending_payout: number;
    is_active: boolean;
    created_at: string;
}

export interface Tenant {
    id: string;
    name: string;
    email: string;
    business_type: string;
    created_at: string;
}

export interface AffiliateEarning {
    id: string;
    portal_user_id: string;
    tenant_id: string;
    subscription_plan: string;
    subscription_price: number;
    commission_rate: number;
    commission_amount: number;
    status: 'pending' | 'paid';
    paid_at: string | null;
    created_at: string;
    tenant?: Tenant;
    affiliator?: PortalUser;
}

export interface AffiliateTenant {
    id: string;
    portal_user_id: string;
    tenant_id: string;
    tenant?: Tenant & { subscription?: { plan: string; status: string } };
    created_at: string;
}

export interface DashboardStats {
    affiliator_count: number;
    tenant_count: number;
    referred_tenants: number;
    total_commission: number;
    pending_commission: number;
}

export interface MyStats {
    referral_code: string;
    tenant_count: number;
    pending_payout: number;
    total_earned: number;
    this_month_earnings: number;
}

// Auth
export async function login(email: string, password: string) {
    const res = await api<{ data: { access_token: string; user: PortalUser } }>('/portal/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(res.data.access_token);
    return res.data;
}

export async function getMe() {
    const res = await api<{ data: PortalUser }>('/portal/auth/me');
    return res.data;
}

export async function validateInvite(token: string) {
    const res = await api<{ data: { email: string; name: string } }>(`/portal/auth/invite/${token}`);
    return res.data;
}

export async function acceptInvite(token: string, password: string, phone?: string) {
    const res = await api<{ data: { access_token: string; user: PortalUser } }>('/portal/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify({ token, password, phone }),
    });
    setToken(res.data.access_token);
    return res.data;
}

export function logout() {
    removeToken();
    window.location.href = '/login';
}

// Super Admin - Affiliators
export async function inviteAffiliator(email: string, name: string) {
    const res = await api<{ data: { invite_url: string }; message: string }>('/portal/affiliators/invite', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
    });
    return res;
}

export async function listAffiliators() {
    const res = await api<{ data: (PortalUser & { tenant_count: number })[] }>('/portal/affiliators');
    return res.data;
}

export async function getAffiliator(id: string) {
    const res = await api<{ data: { affiliator: PortalUser; tenant_count: number; total_commission: number } }>(`/portal/affiliators/${id}`);
    return res.data;
}

export async function updateAffiliator(id: string, data: Partial<PortalUser>) {
    const res = await api<{ data: PortalUser }>(`/portal/affiliators/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return res.data;
}

export async function deleteAffiliator(id: string) {
    await api(`/portal/affiliators/${id}`, { method: 'DELETE' });
}

// Super Admin - Tenants
export async function listTenants() {
    const res = await api<{ data: (Tenant & { affiliator_name?: string; affiliator_id?: string })[] }>('/portal/tenants');
    return res.data;
}

export async function assignAffiliate(tenantId: string, portalUserId: string) {
    await api(`/portal/tenants/${tenantId}/assign-affiliate`, {
        method: 'POST',
        body: JSON.stringify({ portal_user_id: portalUserId }),
    });
}

// Super Admin - Dashboard
export async function getDashboardStats() {
    const res = await api<{ data: DashboardStats }>('/portal/dashboard');
    return res.data;
}

// Earnings (all roles)
export async function listEarnings() {
    const res = await api<{ data: { earnings: AffiliateEarning[]; total_pending: number; total_paid: number } }>('/portal/earnings');
    return res.data;
}

// Super Admin - Payouts
export async function recordPayout(portalUserId: string, amount: number, notes?: string) {
    const res = await api<{ message: string; data: { new_pending_payout: number; total_earnings: number } }>('/portal/payouts', {
        method: 'POST',
        body: JSON.stringify({ portal_user_id: portalUserId, amount, notes }),
    });
    return res;
}

// Affiliator - My data
export async function getMyTenants() {
    const res = await api<{ data: AffiliateTenant[] }>('/portal/my/tenants');
    return res.data;
}

export async function getMyStats() {
    const res = await api<{ data: MyStats }>('/portal/my/stats');
    return res.data;
}
