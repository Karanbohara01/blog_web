'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, Edit2, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Calculate estimated read time (average 200 words per minute)
const getReadTime = (content: string): string => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes <= 1 ? '1 min read' : `${minutes} min read`;
};

interface StoryCardProps {
    story: {
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
    };
    onLike?: (storyId: string) => void;
    onDelete?: (storyId: string) => void;
}

export default function StoryCard({ story, onLike, onDelete }: StoryCardProps) {
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(story.isLiked || false);
    const [likesCount, setLikesCount] = useState(story.likesCount);
    const [isBookmarked, setIsBookmarked] = useState(story.isBookmarked || false);
    const [showMenu, setShowMenu] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);

    // Reaction state
    const [showReactions, setShowReactions] = useState(false);
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [reactionsCount, setReactionsCount] = useState(0);
    const [isReacting, setIsReacting] = useState(false);

    const REACTIONS = [
        { type: 'love', emoji: '❤️', label: 'Love' },
        { type: 'laugh', emoji: '😂', label: 'Haha' },
        { type: 'sad', emoji: '😢', label: 'Sad' },
        { type: 'fire', emoji: '🔥', label: 'Fire' },
        { type: 'clap', emoji: '👏', label: 'Clap' },
    ];

    const readTime = getReadTime(story.content);

    const isAuthor = session?.user?.id === story.author._id;

    const handleReaction = async (reactionType: string) => {
        if (isReacting || !session) return;

        setIsReacting(true);
        setShowReactions(false);

        // Optimistic update
        const wasReacted = userReaction === reactionType;
        setUserReaction(wasReacted ? null : reactionType);
        setReactionsCount(prev => wasReacted ? prev - 1 : (userReaction ? prev : prev + 1));

        try {
            const res = await fetch(`/api/stories/${story._id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reactionType }),
            });

            if (res.ok) {
                const data = await res.json();
                setUserReaction(data.userReaction);
                setReactionsCount(data.totalReactions);
            }
        } catch (error) {
            // Revert on error
            setUserReaction(userReaction);
        } finally {
            setIsReacting(false);
        }
    };

    const handleBookmark = async () => {
        if (isBookmarking || !session) return;

        setIsBookmarking(true);
        setIsBookmarked(!isBookmarked);

        try {
            const res = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storyId: story._id }),
            });

            if (!res.ok) {
                setIsBookmarked(isBookmarked);
            }
        } catch (error) {
            setIsBookmarked(isBookmarked);
        } finally {
            setIsBookmarking(false);
        }
    };

    const handleLike = async () => {
        if (isLiking || !session) return;

        setIsLiking(true);
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/stories/${story._id}/like`, {
                method: 'POST',
            });

            if (!res.ok) {
                setIsLiked(isLiked);
                setLikesCount(story.likesCount);
            }

            onLike?.(story._id);
        } catch (error) {
            setIsLiked(isLiked);
            setLikesCount(story.likesCount);
        } finally {
            setIsLiking(false);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/story/${story._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Story by ${story.author.name}`,
                    text: story.content.substring(0, 100),
                    url,
                });
            } catch (err) {
                // User cancelled sharing
            }
        } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this story?')) return;

        try {
            const res = await fetch(`/api/stories/${story._id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                onDelete?.(story._id);
            }
        } catch (error) {
            console.error('Failed to delete story');
        }
    };

    // Card and content styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
        padding: '20px',
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
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    return (
        <article style={cardStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Link href={`/profile/${story.author.username}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    {story.author.avatar ? (
                        <img
                            src={story.author.avatar}
                            alt={story.author.name}
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
                            fontSize: '18px',
                        }}>
                            {story.author.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{story.author.name}</span>
                            {story.author.isVerified && (
                                <svg style={{ width: '16px', height: '16px', color: '#d4a54a' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                            @{story.author.username} · {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                        </span>
                        <span style={{
                            fontSize: '12px',
                            color: '#888',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '2px'
                        }}>
                            <Clock style={{ width: '12px', height: '12px' }} />
                            {readTime}
                        </span>
                    </div>
                </Link>

                {/* Menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#666',
                        }}
                    >
                        <MoreHorizontal style={{ width: '20px', height: '20px' }} />
                    </button>

                    {showMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '8px',
                            width: '180px',
                            background: '#111',
                            border: '1px solid #222',
                            borderRadius: '12px',
                            padding: '8px 0',
                            zIndex: 10,
                        }}>
                            {isAuthor && (
                                <>
                                    <Link
                                        href={`/story/${story._id}/edit`}
                                        onClick={() => setShowMenu(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 16px',
                                            color: '#ccc',
                                            textDecoration: 'none',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <Edit2 style={{ width: '16px', height: '16px' }} />
                                        Edit Story
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            color: '#f87171',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <Trash2 style={{ width: '16px', height: '16px' }} />
                                        Delete Story
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => {
                                    handleShare();
                                    setShowMenu(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 16px',
                                    width: '100%',
                                    textAlign: 'left',
                                    color: '#ccc',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                <Share2 style={{ width: '16px', height: '16px' }} />
                                Copy Link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <Link href={`/story/${story._id}`} style={{ textDecoration: 'none' }}>
                {/* Title */}
                {story.title && (
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '8px',
                        lineHeight: 1.4,
                    }}>
                        {story.title}
                    </h3>
                )}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {story.tags.slice(0, 5).map((tag, idx) => (
                            <span key={idx} style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                background: 'rgba(212, 165, 74, 0.1)',
                                color: '#d4a54a',
                                fontSize: '12px',
                                fontWeight: 500,
                            }}>
                                #{tag}
                            </span>
                        ))}
                        {story.tags.length > 5 && (
                            <span style={{ color: '#666', fontSize: '12px', alignSelf: 'center' }}>
                                +{story.tags.length - 5} more
                            </span>
                        )}
                    </div>
                )}

                <p style={{ color: '#b0b0b0', whiteSpace: 'pre-wrap', marginBottom: '16px', lineHeight: '1.6', fontSize: '15px' }}>
                    {story.content.length > 200 ? (
                        <>
                            {story.content.substring(0, 200)}...
                            <span style={{ color: '#d4a54a', fontWeight: 600, marginLeft: '6px' }}>Read more</span>
                        </>
                    ) : (
                        story.content
                    )}
                </p>
            </Link>

            {/* Images */}
            {story.images.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: story.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                    gap: '4px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                }}>
                    {story.images.slice(0, 4).map((image, index) => (
                        <div key={index} style={{ position: 'relative', aspectRatio: story.images.length === 1 ? '16/9' : '1/1' }}>
                            <img
                                src={image}
                                alt={`Story image ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {index === 3 && story.images.length > 4 && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>+{story.images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #222' }}>
                <button
                    onClick={handleLike}
                    disabled={!session}
                    style={actionBtnStyle(isLiked, '#f87171')}
                >
                    <Heart style={{ width: '18px', height: '18px', fill: isLiked ? '#f87171' : 'transparent' }} />
                    <span>{likesCount}</span>
                </button>

                {/* Reaction Button with Picker */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => session && setShowReactions(!showReactions)}
                        disabled={!session}
                        style={{
                            ...actionBtnStyle(!!userReaction, '#fbbf24'),
                            fontSize: userReaction ? '18px' : '14px',
                        }}
                    >
                        {userReaction
                            ? REACTIONS.find(r => r.type === userReaction)?.emoji
                            : '😊'}
                        {reactionsCount > 0 && <span style={{ marginLeft: '4px' }}>{reactionsCount}</span>}
                    </button>

                    {/* Emoji Picker Popup */}
                    {showReactions && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginBottom: '8px',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '24px',
                            padding: '8px 12px',
                            display: 'flex',
                            gap: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            zIndex: 50,
                        }}>
                            {REACTIONS.map(reaction => (
                                <button
                                    key={reaction.type}
                                    onClick={() => handleReaction(reaction.type)}
                                    title={reaction.label}
                                    style={{
                                        background: userReaction === reaction.type ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '50%',
                                        padding: '8px',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, background 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    {reaction.emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <Link
                    href={`/story/${story._id}`}
                    style={{ ...actionBtnStyle(false, '#60a5fa'), textDecoration: 'none' }}
                >
                    <MessageCircle style={{ width: '18px', height: '18px' }} />
                    <span>{story.commentsCount}</span>
                </Link>

                <button onClick={handleShare} style={actionBtnStyle(false, '#4ade80')}>
                    <Share2 style={{ width: '18px', height: '18px' }} />
                    <span>{story.sharesCount}</span>
                </button>

                <button
                    onClick={handleBookmark}
                    disabled={!session}
                    style={actionBtnStyle(isBookmarked, '#d4a54a')}
                >
                    <Bookmark style={{ width: '18px', height: '18px', fill: isBookmarked ? '#d4a54a' : 'transparent' }} />
                </button>
            </div>
        </article>
    );
}
