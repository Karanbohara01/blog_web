'use client';

import { useState, useEffect } from 'react';

export default function AgeVerificationModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has already verified age
        const verified = localStorage.getItem('age_verified');
        if (!verified) {
            setIsOpen(true);
        }
    }, []);

    const handleVerify = () => {
        localStorage.setItem('age_verified', 'true');
        localStorage.setItem('age_verified_date', new Date().toISOString());
        setIsOpen(false);
    };

    const handleExit = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    padding: '40px',
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                {/* Warning Icon */}
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}
                >
                    <span style={{ fontSize: '40px' }}>⚠️</span>
                </div>

                {/* Title */}
                <h2
                    style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '16px',
                    }}
                >
                    Age Verification Required
                </h2>

                {/* Description */}
                <p
                    style={{
                        fontSize: '15px',
                        color: '#888',
                        lineHeight: 1.6,
                        marginBottom: '24px',
                    }}
                >
                    This website contains adult content intended for individuals
                    <strong style={{ color: '#ff6b6b' }}> 18 years of age or older</strong>.
                    By entering, you confirm that you are of legal age to view adult content
                    in your jurisdiction.
                </p>

                {/* Legal Notice */}
                <div
                    style={{
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '24px',
                    }}
                >
                    <p style={{ fontSize: '12px', color: '#ff6b6b', margin: 0 }}>
                        🔞 You must be 18+ to enter. All characters depicted are 18+.
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleExit}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: '1px solid #333',
                            background: '#1a1a1a',
                            color: '#888',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        I'm Under 18 - Exit
                    </button>
                    <button
                        onClick={handleVerify}
                        style={{
                            flex: 1,
                            padding: '14px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                            color: '#000',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        I'm 18+ - Enter
                    </button>
                </div>

                {/* Footer */}
                <p
                    style={{
                        fontSize: '11px',
                        color: '#555',
                        marginTop: '20px',
                    }}
                >
                    By clicking "I'm 18+ - Enter", you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
