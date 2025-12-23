'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Send, Loader2, ThumbsUp } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import AdBanner from '@/components/ads/AdBanner';

interface Story {
    _id: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        isVerified?: boolean;
        bio?: string;
        followersCount: number;
    };
    content: string;
    images: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked: boolean;
    createdAt: string;
}

interface Comment {
    _id: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    content: string;
    likesCount: number;
    repliesCount: number;
    isLiked: boolean;
    createdAt: string;
}

export default function StoryPage() {
    const params = useParams();
    const { data: session } = useSession();
    const storyId = params?.id as string || '';
    const { isMobile } = useResponsive();

    const [story, setStory] = useState<Story | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storyRes, commentsRes] = await Promise.all([
                    fetch(`/api/stories/${storyId}`),
                    fetch(`/api/stories/${storyId}/comments`),
                ]);

                const storyData = await storyRes.json();
                const commentsData = await commentsRes.json();

                if (storyData.story) {
                    setStory(storyData.story);
                    setIsLiked(storyData.story.isLiked);
                    setLikesCount(storyData.story.likesCount);
                }

                if (commentsData.comments) {
                    setComments(commentsData.comments);
                }
            } catch (error) {
                console.error('Failed to fetch story');
            } finally {
                setLoading(false);
            }
        };

        if (storyId) {
            fetchData();
        }
    }, [storyId]);

    const handleLike = async () => {
        if (!session) return;

        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await fetch(`/api/stories/${storyId}/like`, { method: 'POST' });
        } catch (error) {
            setIsLiked(isLiked);
            setLikesCount(likesCount);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session || submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/stories/${storyId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });

            const data = await res.json();
            if (data.comment) {
                setComments(prev => [data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Shared styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
    };

    const actionBtnStyle = (active: boolean, color: string) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '10px',
        background: active ? `${color}15` : 'transparent',
        border: 'none',
        color: active ? color : '#666',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!story) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Story not found</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>This story may have been deleted.</p>
                    <Link href="/" style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        color: '#000',
                        fontWeight: 600,
                        borderRadius: '10px',
                        textDecoration: 'none',
                    }}>
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '16px 12px' : '24px'
        }}>
            {/* Back Button */}
            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#888',
                    fontSize: '14px',
                    textDecoration: 'none',
                    marginBottom: '24px',
                }}
            >
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
                Back to Feed
            </Link>

            <AdBanner />

            {/* Story Card */}
            <article style={{ ...cardStyle, marginBottom: '24px' }}>
                {/* Author Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
                    <Link href={`/profile/${story.author.username}`}>
                        {story.author.avatar ? (
                            <img
                                src={story.author.avatar}
                                alt={story.author.name}
                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #333' }}
                            />
                        ) : (
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '22px',
                            }}>
                                {story.author.name.charAt(0)}
                            </div>
                        )}
                    </Link>
                    <div style={{ flex: 1 }}>
                        <Link href={`/profile/${story.author.username}`} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{story.author.name}</h3>
                                {story.author.isVerified && (
                                    <svg style={{ width: '18px', height: '18px', color: '#d4a54a' }} fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                )}
                            </div>
                            <p style={{ fontSize: '14px', color: '#666', margin: '2px 0 0' }}>@{story.author.username}</p>
                        </Link>
                        <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                            {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {/* Content */}
                {(() => {
                    const paragraphs = story.content.split('\n');
                    // Inject ad after 4 paragraphs if story is long enough (approx > 6 paragraphs)
                    // This approximates "30 lines" or a good reading break
                    if (paragraphs.length > 6) {
                        const part1 = paragraphs.slice(0, 4).join('\n');
                        const part2 = paragraphs.slice(4).join('\n');
                        const pStyle = {
                            fontSize: isMobile ? '15px' : '16px',
                            lineHeight: '1.7',
                            color: '#e0e0e0',
                            whiteSpace: 'pre-wrap' as const,
                            marginBottom: '20px'
                        };

                        return (
                            <>
                                <p style={pStyle}>{part1}</p>
                                <AdBanner />
                                <p style={pStyle}>{part2}</p>
                            </>
                        );
                    }

                    return (
                        <p style={{
                            fontSize: isMobile ? '15px' : '16px',
                            lineHeight: '1.7',
                            color: '#e0e0e0',
                            whiteSpace: 'pre-wrap',
                            marginBottom: '20px'
                        }}>
                            {story.content}
                        </p>
                    );
                })()}

                {/* Images */}
                {story.images.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {story.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Story image ${index + 1}`}
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid #222' }}
                            />
                        ))}
                    </div>
                )}

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #222' }}>
                    <button onClick={handleLike} disabled={!session} style={actionBtnStyle(isLiked, '#f87171')}>
                        <Heart style={{ width: '20px', height: '20px', fill: isLiked ? '#f87171' : 'transparent' }} />
                        <span>{likesCount}</span>
                    </button>

                    <div style={{ ...actionBtnStyle(false, '#60a5fa'), cursor: 'default' }}>
                        <MessageCircle style={{ width: '20px', height: '20px' }} />
                        <span>{comments.length}</span>
                    </div>

                    <button style={actionBtnStyle(false, '#4ade80')}>
                        <Share2 style={{ width: '20px', height: '20px' }} />
                    </button>

                    <button style={actionBtnStyle(false, '#d4a54a')}>
                        <Bookmark style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
            </article>
            <AdBanner />
            {/* Comments Section */}
            <div style={cardStyle}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
                    Comments ({comments.length})
                </h2>

                {/* New Comment Form */}
                {session ? (
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                        {session.user?.image ? (
                            <img
                                src={session.user.image}
                                alt=""
                                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #333' }}
                            />
                        ) : (
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#000',
                                fontWeight: 600,
                                flexShrink: 0,
                            }}>
                                {session.user?.name?.charAt(0)}
                            </div>
                        )}
                        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                maxLength={2000}
                                style={{
                                    flex: 1,
                                    padding: '14px 16px',
                                    background: '#0a0a0a',
                                    border: '1px solid #222',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                style={{
                                    padding: '0 18px',
                                    borderRadius: '12px',
                                    background: newComment.trim() ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' : '#333',
                                    border: 'none',
                                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                                    color: newComment.trim() ? '#000' : '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {submitting ? (
                                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Send style={{ width: '18px', height: '18px' }} />
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div style={{
                        marginBottom: '28px',
                        padding: '20px',
                        background: '#0a0a0a',
                        borderRadius: '12px',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: '#888', fontSize: '14px' }}>
                            <Link href="/login" style={{ color: '#d4a54a', textDecoration: 'none' }}>Sign in</Link>
                            {' '}to leave a comment
                        </p>
                    </div>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '15px' }}>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {comments.map(comment => (
                            <div key={comment._id} style={{ display: 'flex', gap: '12px' }}>
                                <Link href={`/profile/${comment.author.username}`}>
                                    {comment.author.avatar ? (
                                        <img
                                            src={comment.author.avatar}
                                            alt={comment.author.name}
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#000',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            flexShrink: 0,
                                        }}>
                                            {comment.author.name.charAt(0)}
                                        </div>
                                    )}
                                </Link>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        background: '#0a0a0a',
                                        border: '1px solid #1a1a1a',
                                        borderRadius: '12px',
                                        padding: '14px 16px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <Link href={`/profile/${comment.author.username}`} style={{ fontWeight: 600, color: '#fff', fontSize: '14px', textDecoration: 'none' }}>
                                                {comment.author.name}
                                            </Link>
                                            <span style={{ fontSize: '12px', color: '#555' }}>
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{comment.content}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', paddingLeft: '8px' }}>
                                        <button style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            color: '#666',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}>
                                            <ThumbsUp style={{ width: '14px', height: '14px' }} />
                                            {comment.likesCount > 0 ? comment.likesCount : 'Like'}
                                        </button>
                                        <button style={{
                                            fontSize: '13px',
                                            color: '#666',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}>
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
