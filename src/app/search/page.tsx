'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StoryCard from '@/components/story/StoryCard';
import { Search, User, FileText, Loader2, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface UserResult {
    _id: string;
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
    followersCount: number;
    isVerified: boolean;
    isFollowing: boolean;
}

interface StoryResult {
    _id: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        isVerified?: boolean;
    };
    content: string;
    images: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    createdAt: string;
}

function SearchPageContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams?.get('q') || '';
    const { isMobile, isTablet } = useResponsive();

    const [query, setQuery] = useState(initialQuery);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<'all' | 'users' | 'stories'>('all');
    const [users, setUsers] = useState<UserResult[]>([]);
    const [stories, setStories] = useState<StoryResult[]>([]);
    const [loading, setLoading] = useState(false);

    const performSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setUsers([]);
            setStories([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${activeTab}`);
            const data = await res.json();

            setUsers(data.users || []);
            setStories(data.stories || []);
        } catch (error) {
            console.error('Search failed');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (searchQuery) {
            performSearch(searchQuery);
        }
    }, [searchQuery, activeTab, performSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(query);
    };

    // Styles (responsive)
    const containerStyle: React.CSSProperties = {
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '16px 12px' : '32px 16px',
    };

    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        marginBottom: isMobile ? '20px' : '32px',
    };

    const titleStyle: React.CSSProperties = {
        fontSize: isMobile ? '24px' : '32px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #d4a54a 0%, #f4d48a 50%, #d4a54a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '8px',
    };

    const subtitleStyle: React.CSSProperties = {
        color: '#888',
        fontSize: isMobile ? '14px' : '16px',
        display: isMobile ? 'none' : 'block',
    };

    const searchContainerStyle: React.CSSProperties = {
        position: 'relative',
        marginBottom: isMobile ? '16px' : '24px',
    };

    const searchInputStyle: React.CSSProperties = {
        width: '100%',
        padding: isMobile ? '14px 80px 14px 44px' : '18px 140px 18px 56px',
        fontSize: isMobile ? '14px' : '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '2px solid rgba(212, 165, 74, 0.2)',
        borderRadius: isMobile ? '12px' : '16px',
        color: '#fff',
        outline: 'none',
        transition: 'all 0.3s ease',
    };

    const searchIconStyle: React.CSSProperties = {
        position: 'absolute',
        left: isMobile ? '14px' : '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#d4a54a',
        width: isMobile ? '18px' : '22px',
        height: isMobile ? '18px' : '22px',
    };

    const searchButtonStyle: React.CSSProperties = {
        position: 'absolute',
        right: isMobile ? '6px' : '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: isMobile ? '10px 16px' : '12px 28px',
        background: 'linear-gradient(135deg, #d4a54a 0%, #b8943f 100%)',
        border: 'none',
        borderRadius: isMobile ? '8px' : '12px',
        color: '#000',
        fontWeight: 600,
        fontSize: isMobile ? '12px' : '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
    };

    const tabContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: isMobile ? '4px' : '8px',
        marginBottom: isMobile ? '20px' : '32px',
        padding: isMobile ? '4px' : '6px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: isMobile ? '12px' : '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    };

    const getTabStyle = (isActive: boolean): React.CSSProperties => ({
        flex: 1,
        padding: isMobile ? '10px 8px' : '14px 24px',
        borderRadius: isMobile ? '8px' : '12px',
        fontWeight: 600,
        fontSize: isMobile ? '12px' : '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '4px' : '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: 'none',
        background: isActive
            ? 'linear-gradient(135deg, #d4a54a 0%, #b8943f 100%)'
            : 'transparent',
        color: isActive ? '#000' : '#888',
        boxShadow: isActive ? '0 4px 15px rgba(212, 165, 74, 0.3)' : 'none',
    });

    const emptyStateStyle: React.CSSProperties = {
        textAlign: 'center',
        padding: '80px 24px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
    };

    const emptyIconContainerStyle: React.CSSProperties = {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(212, 165, 74, 0.2) 0%, rgba(212, 165, 74, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
    };

    const sectionHeaderStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    };

    const sectionIconStyle: React.CSSProperties = {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(212, 165, 74, 0.2) 0%, rgba(212, 165, 74, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const userCardStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        color: 'inherit',
    };

    const avatarStyle: React.CSSProperties = {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(212, 165, 74, 0.3)',
    };

    const avatarPlaceholderStyle: React.CSSProperties = {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #d4a54a 0%, #b8943f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        fontWeight: 700,
        fontSize: '20px',
        flexShrink: 0,
    };

    const verifiedBadgeStyle: React.CSSProperties = {
        width: '18px',
        height: '18px',
        color: '#d4a54a',
    };

    const followerBadgeStyle: React.CSSProperties = {
        padding: '6px 14px',
        backgroundColor: 'rgba(212, 165, 74, 0.1)',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#d4a54a',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>Discover Stories</h1>
                <p style={subtitleStyle}>Search for amazing stories, creators, and trending topics</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
                <div style={searchContainerStyle}>
                    <Search style={searchIconStyle} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search stories, people, or #tags..."
                        style={searchInputStyle}
                        autoFocus
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(212, 165, 74, 0.5)';
                            e.target.style.boxShadow = '0 0 20px rgba(212, 165, 74, 0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(212, 165, 74, 0.2)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={query.length < 2}
                        style={{
                            ...searchButtonStyle,
                            opacity: query.length < 2 ? 0.5 : 1,
                            cursor: query.length < 2 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Tabs */}
            <div style={tabContainerStyle}>
                {[
                    { id: 'all', label: 'All Results', icon: Sparkles },
                    { id: 'users', label: 'People', icon: Users },
                    { id: 'stories', label: 'Stories', icon: FileText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={getTabStyle(activeTab === tab.id)}
                    >
                        <tab.icon style={{ width: '16px', height: '16px' }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Loader2
                            style={{
                                width: '40px',
                                height: '40px',
                                color: '#d4a54a',
                                animation: 'spin 1s linear infinite',
                            }}
                            className="animate-spin"
                        />
                        <p style={{ marginTop: '16px', color: '#888' }}>Searching...</p>
                    </div>
                </div>
            ) : searchQuery.length < 2 ? (
                <div style={emptyStateStyle}>
                    <div style={emptyIconContainerStyle}>
                        <Search style={{ width: '32px', height: '32px', color: '#d4a54a' }} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                        Start Your Search
                    </h3>
                    <p style={{ color: '#666', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
                        Discover amazing stories, connect with creators, and explore trending topics in our community
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        marginTop: '24px',
                        flexWrap: 'wrap',
                    }}>
                        {['#fantasy', '#romance', '#adventure', '#mystery'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setQuery(tag);
                                    setSearchQuery(tag);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'rgba(212, 165, 74, 0.1)',
                                    border: '1px solid rgba(212, 165, 74, 0.2)',
                                    borderRadius: '20px',
                                    color: '#d4a54a',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            ) : users.length === 0 && stories.length === 0 ? (
                <div style={emptyStateStyle}>
                    <div style={emptyIconContainerStyle}>
                        <Search style={{ width: '32px', height: '32px', color: '#666' }} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
                        No Results Found
                    </h3>
                    <p style={{ color: '#666', fontSize: '15px', maxWidth: '350px', margin: '0 auto' }}>
                        We couldn't find anything matching "{searchQuery}". Try different keywords or check your spelling.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Users Results */}
                    {users.length > 0 && (activeTab === 'all' || activeTab === 'users') && (
                        <div>
                            <div style={sectionHeaderStyle}>
                                <div style={sectionIconStyle}>
                                    <Users style={{ width: '18px', height: '18px', color: '#d4a54a' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                        People
                                    </h2>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                        {users.length} {users.length === 1 ? 'person' : 'people'} found
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {users.map((user) => (
                                    <Link
                                        key={user._id}
                                        href={`/profile/${user.username}`}
                                        style={userCardStyle}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(212, 165, 74, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} style={avatarStyle} />
                                        ) : (
                                            <div style={avatarPlaceholderStyle}>
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <h3 style={{ fontWeight: 600, fontSize: '16px', color: '#fff', margin: 0 }}>
                                                    {user.name}
                                                </h3>
                                                {user.isVerified && (
                                                    <svg style={verifiedBadgeStyle} fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p style={{ color: '#888', fontSize: '14px', margin: '2px 0 0' }}>
                                                @{user.username}
                                            </p>
                                            {user.bio && (
                                                <p style={{
                                                    color: '#666',
                                                    fontSize: '14px',
                                                    margin: '8px 0 0',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                        <div style={followerBadgeStyle}>
                                            <TrendingUp style={{ width: '14px', height: '14px' }} />
                                            {user.followersCount.toLocaleString()}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stories Results */}
                    {stories.length > 0 && (activeTab === 'all' || activeTab === 'stories') && (
                        <div>
                            <div style={sectionHeaderStyle}>
                                <div style={sectionIconStyle}>
                                    <FileText style={{ width: '18px', height: '18px', color: '#d4a54a' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>
                                        Stories
                                    </h2>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                                        {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {stories.map((story) => (
                                    <StoryCard key={story._id} story={story} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4a54a' }} />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
