'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, BookmarkIcon, ArrowLeft, BookOpen } from 'lucide-react';
import StoryCard from '@/components/story/StoryCard';

interface Story {
    _id: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        isVerified?: boolean;
    };
    title?: string;
    content: string;
    images: string[];
    tags?: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    createdAt: string;
    bookmarkedAt?: string;
}

export default function LibraryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/library');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchBookmarks();
        }
    }, [session]);

    const fetchBookmarks = async () => {
        try {
            const res = await fetch(`/api/bookmarks?page=${page}&limit=20`);
            const data = await res.json();

            if (page === 1) {
                setStories(data.stories || []);
            } else {
                setStories(prev => [...prev, ...(data.stories || [])]);
            }
            setHasMore(data.pagination?.hasMore || false);
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (storyId: string) => {
        try {
            await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storyId }),
            });
            setStories(prev => prev.filter(s => s._id !== storyId));
        } catch (error) {
            console.error('Failed to remove bookmark:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '24px 16px',
            minHeight: '100vh',
        }}>
            {/* Back Button */}
            <Link href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#888',
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '24px',
            }}>
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Home
            </Link>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <BookmarkIcon style={{ width: '28px', height: '28px', color: '#d4a54a' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                        My Library
                    </h1>
                </div>
                <p style={{ color: '#666' }}>
                    Stories you've saved for later
                </p>
            </div>

            {/* Stories */}
            {stories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#111',
                    borderRadius: '16px',
                    border: '1px solid #222',
                }}>
                    <BookOpen style={{ width: '48px', height: '48px', color: '#333', margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#fff', marginBottom: '8px' }}>No bookmarks yet</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Save stories by clicking the bookmark icon
                    </p>
                    <Link href="/browse" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        color: '#000',
                        fontWeight: 600,
                        borderRadius: '10px',
                        textDecoration: 'none',
                    }}>
                        Browse Stories
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {stories.map(story => (
                        <StoryCard
                            key={story._id}
                            story={story}
                            onDelete={() => handleRemoveBookmark(story._id)}
                        />
                    ))}

                    {hasMore && (
                        <button
                            onClick={() => {
                                setPage(prev => prev + 1);
                                fetchBookmarks();
                            }}
                            style={{
                                padding: '14px 24px',
                                background: '#111',
                                border: '1px solid #222',
                                borderRadius: '12px',
                                color: '#888',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
