'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Clock, ArrowLeft, BookOpen, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProgressStory {
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
    progress: number;
    lastReadAt: string;
}

export default function ContinueReadingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stories, setStories] = useState<ProgressStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/continue-reading');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchProgress();
        }
    }, [session]);

    const fetchProgress = async () => {
        try {
            const res = await fetch('/api/progress?limit=20');
            const data = await res.json();
            setStories(data.stories || []);
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        } finally {
            setLoading(false);
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
                    <Clock style={{ width: '28px', height: '28px', color: '#d4a54a' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                        Continue Reading
                    </h1>
                </div>
                <p style={{ color: '#666' }}>
                    Pick up where you left off
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
                    <h3 style={{ color: '#fff', marginBottom: '8px' }}>No stories in progress</h3>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Start reading and your progress will be saved automatically
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
                        <Link
                            key={story._id}
                            href={`/story/${story._id}`}
                            style={{
                                display: 'block',
                                padding: '20px',
                                background: '#111',
                                border: '1px solid #222',
                                borderRadius: '16px',
                                textDecoration: 'none',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {/* Cover/Image */}
                                {story.images?.[0] ? (
                                    <img
                                        src={story.images[0]}
                                        alt=""
                                        style={{
                                            width: '80px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '80px',
                                        height: '100px',
                                        background: 'linear-gradient(135deg, #333 0%, #222 100%)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <BookOpen style={{ width: '24px', height: '24px', color: '#555' }} />
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        fontSize: '17px',
                                        fontWeight: 600,
                                        color: '#fff',
                                        marginBottom: '6px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {story.title || story.content.substring(0, 50) + '...'}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>
                                        by {story.author.name}
                                    </p>

                                    {/* Progress Bar */}
                                    <div style={{
                                        width: '100%',
                                        height: '6px',
                                        background: '#222',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        marginBottom: '8px',
                                    }}>
                                        <div style={{
                                            width: `${story.progress}%`,
                                            height: '100%',
                                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                            borderRadius: '3px',
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#666' }}>
                                            {Math.round(story.progress)}% complete
                                        </span>
                                        <span style={{ fontSize: '13px', color: '#555' }}>
                                            {formatDistanceToNow(new Date(story.lastReadAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>

                                {/* Continue Button */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Play style={{ width: '18px', height: '18px', color: '#000', marginLeft: '2px' }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
