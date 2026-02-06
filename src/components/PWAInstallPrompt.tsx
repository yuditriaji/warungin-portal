'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isInStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        setIsStandalone(isInStandalone);

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
        setIsIOS(isIOSDevice);

        // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner after a short delay to not be too intrusive
            setTimeout(() => setShowInstallBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show banner after delay if not in standalone
        if (isIOSDevice && !isInStandalone) {
            setTimeout(() => setShowInstallBanner(true), 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowInstallBanner(false);
        // Store dismissal in localStorage to not show again for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Check if banner was recently dismissed
    useEffect(() => {
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < sevenDays) {
                setShowInstallBanner(false);
            }
        }
    }, []);

    // Don't show if already installed or banner dismissed
    if (isStandalone || !showInstallBanner) {
        return null;
    }

    const styles = {
        container: {
            position: 'fixed' as const,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '12px',
        },
        card: {
            maxWidth: '380px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
        },
        header: {
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        iconBox: {
            width: '40px',
            height: '40px',
            background: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            color: 'white',
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
        },
        subtitle: {
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontSize: '12px',
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '20px',
        },
        body: {
            padding: '16px',
        },
        bodyText: {
            fontSize: '13px',
            color: '#666',
            marginBottom: '12px',
        },
        step: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#333',
            marginBottom: '8px',
        },
        stepNumber: {
            width: '22px',
            height: '22px',
            background: '#f0e6ff',
            color: '#7c3aed',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
        },
        buttons: {
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
        },
        laterBtn: {
            flex: 1,
            padding: '12px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#666',
            cursor: 'pointer',
        },
        installBtn: {
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
        },
    };

    // iOS specific instructions
    if (isIOS) {
        return (
            <div style={styles.container} className="animate-slide-up">
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.headerContent}>
                            <div style={styles.iconBox}>
                                <span style={{ fontSize: '20px' }}>🎯</span>
                            </div>
                            <div>
                                <h3 style={styles.title}>Install Portal</h3>
                                <p style={styles.subtitle}>Akses cepat dari Home Screen</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} style={styles.closeBtn}>✕</button>
                    </div>
                    <div style={styles.body}>
                        <p style={styles.bodyText}>Untuk install di iPhone/iPad:</p>
                        <div style={styles.step}>
                            <span style={styles.stepNumber}>1</span>
                            <span>Tap <strong>Share</strong> di Safari ⬆️</span>
                        </div>
                        <div style={styles.step}>
                            <span style={styles.stepNumber}>2</span>
                            <span>Pilih <strong>&quot;Add to Home Screen&quot;</strong></span>
                        </div>
                        <div style={styles.step}>
                            <span style={styles.stepNumber}>3</span>
                            <span>Tap <strong>&quot;Add&quot;</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Android/Desktop install prompt
    if (deferredPrompt) {
        return (
            <div style={styles.container} className="animate-slide-up">
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.headerContent}>
                            <div style={styles.iconBox}>
                                <span style={{ fontSize: '20px' }}>🎯</span>
                            </div>
                            <div>
                                <h3 style={styles.title}>Install Portal</h3>
                                <p style={styles.subtitle}>Akses cepat dari Home Screen</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} style={styles.closeBtn}>✕</button>
                    </div>
                    <div style={styles.body}>
                        <p style={styles.bodyText}>
                            Install Warungin Portal untuk akses lebih cepat tanpa buka browser.
                        </p>
                        <div style={styles.buttons}>
                            <button onClick={handleDismiss} style={styles.laterBtn}>
                                Nanti
                            </button>
                            <button onClick={handleInstallClick} style={styles.installBtn}>
                                ⬇️ Install
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
