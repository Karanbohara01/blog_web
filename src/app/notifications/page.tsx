'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Heart, MessageCircle, UserPlus, Loader2, CheckCheck } from 'lucide-react';

interface Notification {
    _id: string;
    sender: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    type: 'like' | 'comment' | 'follow' | 'message' | 'mention';
    story?: {
        _id: string;
        content: string;
    };
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark notifications as read');
        }
    };

    const getNotificationIcon = (type: string) => {
        const iconStyle = { width: '18px', height: '18px' };
        switch (type) {
            case 'like':
                return <Heart style={{ ...iconStyle, color: '#f87171' }} />;
            case 'comment':
                return <MessageCircle style={{ ...iconStyle, color: '#60a5fa' }} />;
            case 'follow':
                return <UserPlus style={{ ...iconStyle, color: '#d4a54a' }} />;
            default:
                return <Bell style={{ ...iconStyle, color: '#888' }} />;
        }
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return (
                    <>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{notification.sender.name}</span>
                        <span style={{ color: '#888' }}> liked your story</span>
                    </>
                );
            case 'comment':
                return (
                    <>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{notification.sender.name}</span>
                        <span style={{ color: '#888' }}> commented on your story</span>
                    </>
                );
            case 'follow':
                return (
                    <>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{notification.sender.name}</span>
                        <span style={{ color: '#888' }}> started following you</span>
                    </>
                );
            default:
                return null;
        }
    };

    const getNotificationLink = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
            case 'comment':
                return notification.story ? `/story/${notification.story._id}` : '#';
            case 'follow':
                return `/profile/${notification.sender.username}`;
            default:
                return '#';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>Notifications</h1>
                    {unreadCount > 0 && (
                        <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{unreadCount} unread</p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'transparent',
                            border: '1px solid rgba(212, 165, 74, 0.3)',
                            borderRadius: '10px',
                            color: '#d4a54a',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <CheckCheck style={{ width: '18px', height: '18px' }} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '16px',
                    padding: '64px 32px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        background: 'rgba(212, 165, 74, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Bell style={{ width: '36px', height: '36px', color: '#d4a54a' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>No notifications yet</h3>
                    <p style={{ color: '#666' }}>When someone interacts with your content, you'll see it here.</p>
                </div>
            ) : (
                <div style={{
                    background: '#111',
                    border: '1px solid #222',
                    borderRadius: '16px',
                    overflow: 'hidden',
                }}>
                    {notifications.map((notification, index) => (
                        <Link
                            key={notification._id}
                            href={getNotificationLink(notification)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                padding: '20px',
                                textDecoration: 'none',
                                background: notification.isRead ? 'transparent' : 'rgba(212, 165, 74, 0.05)',
                                borderBottom: index < notifications.length - 1 ? '1px solid #222' : 'none',
                                transition: 'background 0.2s',
                            }}
                        >
                            {/* Avatar */}
                            {notification.sender.avatar ? (
                                <img
                                    src={notification.sender.avatar}
                                    alt={notification.sender.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    fontWeight: 600,
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}>
                                    {notification.sender.name.charAt(0)}
                                </div>
                            )}

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        padding: '6px',
                                        borderRadius: '8px',
                                        background: '#1a1a1a',
                                        flexShrink: 0,
                                    }}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
                                            {getNotificationText(notification)}
                                        </p>
                                        {notification.story && (
                                            <p style={{
                                                fontSize: '13px',
                                                color: '#555',
                                                marginTop: '6px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                "{notification.story.content.substring(0, 60)}..."
                                            </p>
                                        )}
                                        <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                    flexShrink: 0,
                                    marginTop: '8px',
                                }} />
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
