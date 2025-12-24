'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoryCard from '@/components/story/StoryCard';
import { Loader2, ArrowLeft, TrendingUp, Sparkles, Clock } from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';

interface Story {
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
    isLiked?: boolean;
    createdAt: string;
}

export default function BrowsePage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeTab, setActiveTab] = useState('trending');

    const fetchStories = async (pageNum: number, reset = false) => {
        try {
            const res = await fetch(`/api/stories?page=${pageNum}&limit=12`);
            const data = await res.json();

            if (reset) {
                setStories(data.stories || []);
            } else {
                setStories(prev => [...prev, ...(data.stories || [])]);
            }
            setHasMore(data.pagination?.hasMore || false);
        } catch (error) {
            setStories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories(1, true);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchStories(nextPage);
    };

    const tabs = [
        { key: 'trending', label: 'Trending', icon: TrendingUp },
        { key: 'new', label: 'New', icon: Sparkles },
        { key: 'recent', label: 'Recent', icon: Clock },
    ];

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '24px 16px',
            minHeight: '100vh',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#888',
                    textDecoration: 'none',
                    fontSize: '14px',
                    marginBottom: '16px',
                }}>
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                    Back to Home
                </Link>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '8px',
                }}>
                    Browse Stories
                </h1>
                <p style={{ color: '#666' }}>
                    Discover amazing stories from our community
                </p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '24px',
                borderBottom: '1px solid #222',
                paddingBottom: '12px',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 16px',
                            background: activeTab === tab.key ? 'rgba(212, 165, 74, 0.1)' : 'transparent',
                            border: activeTab === tab.key ? '1px solid rgba(212, 165, 74, 0.3)' : '1px solid transparent',
                            borderRadius: '8px',
                            color: activeTab === tab.key ? '#d4a54a' : '#888',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <tab.icon style={{ width: '16px', height: '16px' }} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AdBanner />

            {/* Stories Grid */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
                    <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
                </div>
            ) : stories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#111',
                    borderRadius: '16px',
                    border: '1px solid #222',
                }}>
                    <h3 style={{ color: '#fff', marginBottom: '8px' }}>No stories yet</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Be the first to share your story!</p>
                    <Link href="/register" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        color: '#000',
                        fontWeight: 600,
                        borderRadius: '10px',
                        textDecoration: 'none',
                    }}>
                        Start Writing
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {stories.map((story, index) => (
                        <div key={story._id}>
                            <StoryCard story={story} />
                            {/* Ad after every 4 stories */}
                            {(index + 1) % 4 === 0 && index < stories.length - 1 && (
                                <div style={{ marginTop: '16px' }}>
                                    <AdBanner />
                                </div>
                            )}
                        </div>
                    ))}

                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            style={{
                                padding: '14px 24px',
                                background: '#111',
                                border: '1px solid #222',
                                borderRadius: '12px',
                                color: '#888',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginTop: '8px',
                            }}
                        >
                            Load More Stories
                        </button>
                    )}
                </div>
            )}

            <div style={{ marginTop: '32px' }}>
                <AdBanner />
            </div>

            {/* Sign up prompt */}
            <div style={{
                marginTop: '40px',
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(212, 165, 74, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(212, 165, 74, 0.2)',
                textAlign: 'center',
            }}>
                <h3 style={{ color: '#fff', marginBottom: '8px' }}>Want to write your own stories?</h3>
                <p style={{ color: '#888', marginBottom: '20px' }}>Join our community of writers and share your creativity!</p>
                <Link href="/register" style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    color: '#000',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textDecoration: 'none',
                }}>
                    Get Started Free
                </Link>
            </div>
        </div>
    );
}
