'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import {
    Home,
    Search,
    PlusSquare,
    MessageCircle,
    Bell,
    User,
    LogOut,
    Settings,
    Menu,
    X,
} from 'lucide-react';
import { useNotifications } from '@/contexts/SocketContext';

export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef<HTMLDivElement>(null);

    // Get counts from notification context
    const { messageCount, notificationCount, setMessageCount, setNotificationCount } = useNotifications();

    // Reset counts when visiting those pages
    useEffect(() => {
        if (pathname === '/messages') {
            setMessageCount(0);
        }
        if (pathname === '/notifications') {
            setNotificationCount(0);
        }
    }, [pathname, setMessageCount, setNotificationCount]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length >= 2) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    // Badge component
    const Badge = ({ count }: { count: number }) => {
        if (count === 0) return null;
        return (
            <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {count > 99 ? '99+' : count}
            </span>
        );
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #1a1a1a'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
                gap: '24px'
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    flexShrink: 0
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: '#000', fontWeight: 'bold', fontSize: '18px' }}>S</span>
                    </div>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#fff',
                        display: 'block'
                    }}>
                        Stories
                    </span>
                </Link>

                {/* Search Bar - Desktop */}
                <form onSubmit={handleSearch} style={{
                    flex: '1',
                    maxWidth: '400px',
                    display: 'none'
                }} className="md:!flex">
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            color: '#666'
                        }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 40px',
                                background: '#141414',
                                border: '1px solid #222',
                                borderRadius: '10px',
                                fontSize: '14px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                </form>

                {/* Navigation Links - Desktop */}
                <div style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '4px'
                }} className="md:!flex">
                    {status === 'authenticated' ? (
                        <>
                            <Link href="/" style={{
                                padding: '10px',
                                borderRadius: '10px',
                                color: pathname === '/' ? '#d4a54a' : '#888',
                                display: 'flex'
                            }}>
                                <Home style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link href="/create" style={{
                                padding: '10px',
                                borderRadius: '10px',
                                color: pathname === '/create' ? '#d4a54a' : '#888',
                                display: 'flex'
                            }}>
                                <PlusSquare style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link href="/messages" style={{
                                padding: '10px',
                                borderRadius: '10px',
                                color: pathname?.startsWith('/messages') ? '#d4a54a' : '#888',
                                display: 'flex',
                                position: 'relative',
                            }}>
                                <MessageCircle style={{ width: '20px', height: '20px' }} />
                                <Badge count={messageCount} />
                            </Link>
                            <Link href="/notifications" style={{
                                padding: '10px',
                                borderRadius: '10px',
                                color: pathname?.startsWith('/notifications') ? '#d4a54a' : '#888',
                                display: 'flex',
                                position: 'relative',
                            }}>
                                <Bell style={{ width: '20px', height: '20px' }} />
                                <Badge count={notificationCount} />
                            </Link>

                            {/* Profile Dropdown */}
                            <div style={{ position: 'relative', marginLeft: '8px' }} ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    style={{
                                        padding: '4px',
                                        borderRadius: '10px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex'
                                    }}
                                >
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt=""
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '1px solid #333'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <span style={{ color: '#000', fontSize: '14px', fontWeight: '600' }}>
                                                {session.user?.name?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </button>

                                {isProfileOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        marginTop: '8px',
                                        width: '200px',
                                        background: '#141414',
                                        border: '1px solid #222',
                                        borderRadius: '12px',
                                        padding: '8px 0',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                                    }}>
                                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                                            <p style={{ fontWeight: '500', color: '#fff', fontSize: '14px' }}>{session.user?.name}</p>
                                            <p style={{ fontSize: '12px', color: '#666' }}>@{(session.user as any)?.username}</p>
                                        </div>
                                        <Link href={`/profile/${(session.user as any)?.username}`} onClick={() => setIsProfileOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '14px', color: '#888', textDecoration: 'none' }}>
                                            <User style={{ width: '16px', height: '16px' }} />
                                            Profile
                                        </Link>
                                        <Link href="/settings" onClick={() => setIsProfileOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '14px', color: '#888', textDecoration: 'none' }}>
                                            <Settings style={{ width: '16px', height: '16px' }} />
                                            Settings
                                        </Link>
                                        <div style={{ margin: '4px 0', borderTop: '1px solid #222' }} />
                                        <button onClick={() => signOut()}
                                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '14px', color: '#f87171', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                            <LogOut style={{ width: '16px', height: '16px' }} />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Link href="/login" style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                color: '#888',
                                textDecoration: 'none'
                            }}>
                                Sign In
                            </Link>
                            <Link href="/register" style={{
                                padding: '8px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                color: '#000',
                                borderRadius: '8px',
                                textDecoration: 'none'
                            }}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#888',
                        display: 'flex',
                        position: 'relative',
                    }}
                    className="md:!hidden"
                >
                    {isMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
                    {(messageCount + notificationCount) > 0 && !isMenuOpen && (
                        <span style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                            borderRadius: '50%',
                        }} />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a1a' }} className="md:hidden">
                    <form onSubmit={handleSearch} style={{ marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#666' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                style={{ width: '100%', padding: '10px 16px 10px 40px', background: '#141414', border: '1px solid #222', borderRadius: '10px', fontSize: '14px', color: '#fff', outline: 'none' }}
                            />
                        </div>
                    </form>

                    {status === 'authenticated' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Link href="/" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                <Home style={{ width: '20px', height: '20px' }} /> Home
                            </Link>
                            <Link href="/create" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                <PlusSquare style={{ width: '20px', height: '20px' }} /> Create
                            </Link>
                            <Link href="/messages" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MessageCircle style={{ width: '20px', height: '20px' }} /> Messages
                                </span>
                                {messageCount > 0 && (
                                    <span style={{
                                        minWidth: '20px',
                                        height: '20px',
                                        padding: '0 6px',
                                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {messageCount}
                                    </span>
                                )}
                            </Link>
                            <Link href="/notifications" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Bell style={{ width: '20px', height: '20px' }} /> Notifications
                                </span>
                                {notificationCount > 0 && (
                                    <span style={{
                                        minWidth: '20px',
                                        height: '20px',
                                        padding: '0 6px',
                                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#000',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {notificationCount}
                                    </span>
                                )}
                            </Link>
                            <Link href={`/profile/${(session.user as any)?.username}`} onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                <User style={{ width: '20px', height: '20px' }} /> Profile
                            </Link>
                            <button onClick={() => signOut()} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: '#f87171', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
                                <LogOut style={{ width: '20px', height: '20px' }} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', border: '1px solid #333', borderRadius: '8px', color: '#888', textDecoration: 'none' }}>
                                Sign In
                            </Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)', borderRadius: '8px', color: '#000', fontWeight: '500', textDecoration: 'none' }}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
