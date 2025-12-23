'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                router.push('/login');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/' });
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        background: '#0a0a0a',
        border: '1px solid #222',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#fff',
        outline: 'none',
        boxSizing: 'border-box' as const
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: '#000', fontWeight: 'bold', fontSize: '22px' }}>S</span>
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 6px' }}>Create Account</h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Start sharing your stories</p>
                </div>

                {/* Card */}
                <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '28px' }}>
                    {error && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            color: '#f87171',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Username */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                placeholder="johndoe"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputStyle, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#666',
                                        padding: 0,
                                        display: 'flex'
                                    }}
                                >
                                    {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '8px' }}>
                                Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                color: '#000',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: '#222' }} />
                        <span style={{ padding: '0 12px', fontSize: '12px', color: '#555' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: '#222' }} />
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        style={{
                            width: '100%',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: '#d4a54a',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Sign In Link */}
                    <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#d4a54a', textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
