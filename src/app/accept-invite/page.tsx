'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateInvite, acceptInvite } from '@/lib/api';

function AcceptInviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [inviteData, setInviteData] = useState<{ email: string; name: string } | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid invitation link');
            setLoading(false);
            return;
        }

        validateInvite(token)
            .then(setInviteData)
            .catch(() => setError('Invitation expired or invalid'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setSubmitting(true);
        try {
            await acceptInvite(token!, password, phone);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="loading">Loading...</div>
                </div>
                <style jsx>{`
          .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .card { background: white; padding: 40px; border-radius: 16px; }
          .loading { color: #666; }
        `}</style>
            </div>
        );
    }

    if (error && !inviteData) {
        return (
            <div className="container">
                <div className="card">
                    <div className="error-icon">❌</div>
                    <h2>Invalid Invitation</h2>
                    <p>{error}</p>
                    <a href="/login" className="link">Go to Login</a>
                </div>
                <style jsx>{`
          .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
          .card { background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; }
          .error-icon { font-size: 48px; margin-bottom: 16px; }
          h2 { margin: 0 0 8px; color: #1a1a2e; }
          p { color: #666; margin: 0 0 20px; }
          .link { color: #667eea; text-decoration: none; font-weight: 500; }
        `}</style>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="header">
                    <div className="icon">🎉</div>
                    <h1>Welcome, {inviteData?.name}!</h1>
                    <p>Set up your affiliate account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={inviteData?.email || ''} disabled />
                    </div>

                    <div className="form-group">
                        <label>Phone (Optional)</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>

            <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .icon { font-size: 48px; margin-bottom: 12px; }
        h1 { margin: 0; font-size: 22px; color: #1a1a2e; }
        .header p { margin: 4px 0 0; color: #666; font-size: 14px; }

        .form-group { margin-bottom: 18px; }
        label { display: block; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 6px; }
        input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
          box-sizing: border-box;
        }
        input:focus { outline: none; border-color: #667eea; }
        input:disabled { background: #f5f5f5; color: #666; }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:hover:not(:disabled) { transform: translateY(-2px); }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    color: '#666'
                }}>
                    Loading...
                </div>
            </div>
        }>
            <AcceptInviteContent />
        </Suspense>
    );
}
