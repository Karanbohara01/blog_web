'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, Shield, Loader2, Camera, Upload, Check } from 'lucide-react';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'privacy'>('profile');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: '',
        isPrivate: false,
    });

    const [notifications, setNotifications] = useState({
        likes: true,
        comments: true,
        followers: true,
        messages: true,
    });

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                avatar: session.user.image || '',
            }));
            setAvatarPreview(session.user.image || null);
        }
    }, [session]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploadingAvatar(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            const uploadFormData = new FormData();
            uploadFormData.append('files', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!res.ok) throw new Error('Failed to upload image');

            const data = await res.json();
            setFormData(prev => ({ ...prev, avatar: data.urls[0] }));
            setSuccess('Avatar uploaded! Click Save Changes to apply.');
        } catch (err: any) {
            setError(err.message || 'Failed to upload avatar');
            setAvatarPreview(session?.user?.image || null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const data = await res.json();
            if (data.user?.avatar) setAvatarPreview(data.user.avatar);

            setSuccess('Profile updated successfully!');
            await update();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'account', label: 'Account', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ];

    // Shared styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '24px',
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        background: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        color: '#888',
        marginBottom: '8px',
    };

    const toggleItemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: '#0a0a0a',
        border: '1px solid #222',
        borderRadius: '12px',
        cursor: 'pointer',
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
                Settings
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px' }} className="settings-grid">
                {/* Sidebar */}
                <div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: isActive ? 'rgba(212, 165, 74, 0.12)' : 'transparent',
                                        color: isActive ? '#d4a54a' : '#888',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Icon style={{ width: '20px', height: '20px' }} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div style={cardStyle}>
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSubmit}>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>
                                Edit Profile
                            </h2>

                            {error && (
                                <div style={{
                                    padding: '14px 16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#f87171',
                                    fontSize: '14px',
                                    marginBottom: '20px',
                                }}>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div style={{
                                    padding: '14px 16px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '10px',
                                    color: '#4ade80',
                                    fontSize: '14px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <Check style={{ width: '16px', height: '16px' }} />
                                    {success}
                                </div>
                            )}

                            {/* Avatar Section */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                padding: '24px',
                                background: '#0a0a0a',
                                borderRadius: '12px',
                                marginBottom: '24px',
                            }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            style={{
                                                width: '88px',
                                                height: '88px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid rgba(212, 165, 74, 0.4)',
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '88px',
                                            height: '88px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#000',
                                            fontSize: '32px',
                                            fontWeight: 600,
                                        }}>
                                            {session?.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        disabled={uploadingAvatar}
                                        style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            right: '0',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#d4a54a',
                                            border: '3px solid #111',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {uploadingAvatar ? (
                                            <Loader2 style={{ width: '14px', height: '14px', color: '#000', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Camera style={{ width: '14px', height: '14px', color: '#000' }} />
                                        )}
                                    </button>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                                        {session?.user?.name || 'User'}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                                        @{session?.user?.username || 'username'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: '#d4a54a',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Upload style={{ width: '14px', height: '14px' }} />
                                        Change Photo
                                    </button>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your display name"
                                    maxLength={100}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Bio Input */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    maxLength={500}
                                    style={{
                                        ...inputStyle,
                                        minHeight: '120px',
                                        resize: 'vertical',
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#555', marginTop: '8px', textAlign: 'right' }}>
                                    {formData.bio.length}/500
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                    color: '#000',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </form>
                    )}

                    {activeTab === 'account' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                                Account Settings
                            </h2>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                                Manage your account settings and password.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Email Card */}
                                <div style={{
                                    padding: '20px',
                                    background: '#0a0a0a',
                                    border: '1px solid #222',
                                    borderRadius: '12px',
                                }}>
                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>Email Address</p>
                                    <p style={{ fontSize: '15px', color: '#fff' }}>{session?.user?.email || 'Not set'}</p>
                                </div>

                                {/* Change Password Button */}
                                <button style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(212, 165, 74, 0.4)',
                                    borderRadius: '10px',
                                    color: '#d4a54a',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}>
                                    Change Password
                                </button>

                                {/* Delete Account Button */}
                                <button style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#f87171',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                                Notification Preferences
                            </h2>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                                Choose what notifications you want to receive.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { key: 'likes', label: 'Likes', desc: 'When someone likes your story' },
                                    { key: 'comments', label: 'Comments', desc: 'When someone comments on your story' },
                                    { key: 'followers', label: 'New Followers', desc: 'When someone follows you' },
                                    { key: 'messages', label: 'Messages', desc: 'When you receive a new message' },
                                ].map(item => (
                                    <label key={item.key} style={toggleItemStyle}>
                                        <div>
                                            <p style={{ fontSize: '15px', color: '#fff', marginBottom: '2px' }}>{item.label}</p>
                                            <p style={{ fontSize: '13px', color: '#555' }}>{item.desc}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={(notifications as any)[item.key]}
                                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                accentColor: '#d4a54a',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                                Privacy Settings
                            </h2>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
                                Control who can see your content and profile.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <label style={toggleItemStyle}>
                                    <div>
                                        <p style={{ fontSize: '15px', color: '#fff', marginBottom: '2px' }}>Private Account</p>
                                        <p style={{ fontSize: '13px', color: '#555' }}>Only approved followers can see your stories</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrivate}
                                        onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            accentColor: '#d4a54a',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .settings-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
