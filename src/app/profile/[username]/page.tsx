'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StoryCard from '@/components/story/StoryCard';
import { Loader2, Calendar, Settings, UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
    _id: string;
    username: string;
    name: string;
    bio: string;
    avatar: string;
    coverImage: string;
    followersCount: number;
    followingCount: number;
    storiesCount: number;
    isVerified: boolean;
    isFollowing: boolean;
    isOwnProfile: boolean;
    createdAt: string;
}

interface Story {
    _id: string;
    author: any;
    content: string;
    images: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    createdAt: string;
}

export default function ProfilePage() {
    const params = useParams();
    const { data: session } = useSession();
    const username = params?.username as string || '';

    const [user, setUser] = useState<UserProfile | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'stories' | 'likes'>('stories');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, storiesRes] = await Promise.all([
                    fetch(`/api/users/${username}`),
                    fetch(`/api/stories?userId=${username}`),
                ]);

                const userData = await userRes.json();
                const storiesData = await storiesRes.json();

                if (userData.user) {
                    setUser(userData.user);
                    setIsFollowing(userData.user.isFollowing);
                    setFollowersCount(userData.user.followersCount);
                }

                if (storiesData.stories) {
                    setStories(storiesData.stories);
                }
            } catch (error) {
                console.error('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfile();
        }
    }, [username]);

    const handleFollow = async () => {
        if (!session || !user) return;

        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            await fetch(`/api/users/${user._id}/follow`, {
                method: 'POST',
            });
        } catch (error) {
            setIsFollowing(isFollowing);
            setFollowersCount(followersCount);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>User not found</h2>
                    <p style={{ color: '#666' }}>The user you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Cover Image */}
            <div style={{
                height: '200px',
                background: user.coverImage ? `url(${user.coverImage}) center/cover` : 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                position: 'relative',
            }} />

            {/* Profile Info */}
            <div style={{ padding: '0 24px', marginTop: '-60px', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Avatar Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    border: '4px solid #0a0a0a',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid #0a0a0a',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '40px', fontWeight: 700, color: '#000' }}>{user.name.charAt(0)}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '8px' }}>
                            {user.isOwnProfile ? (
                                <Link href="/settings" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    borderRadius: '10px',
                                    color: '#d4a54a',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                }}>
                                    <Settings style={{ width: '18px', height: '18px' }} />
                                    Edit Profile
                                </Link>
                            ) : session ? (
                                <>
                                    <button
                                        onClick={handleFollow}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 20px',
                                            background: isFollowing ? 'transparent' : 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                            border: isFollowing ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                            borderRadius: '10px',
                                            color: isFollowing ? '#f87171' : '#000',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus style={{ width: '18px', height: '18px' }} />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus style={{ width: '18px', height: '18px' }} />
                                                Follow
                                            </>
                                        )}
                                    </button>
                                    <Link href={`/messages?user=${user._id}`} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        background: 'transparent',
                                        border: '1px solid #333',
                                        borderRadius: '10px',
                                        color: '#888',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                    }}>
                                        <MessageCircle style={{ width: '18px', height: '18px' }} />
                                        Message
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Name & Username */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{user.name}</h1>
                            {user.isVerified && (
                                <svg style={{ width: '20px', height: '20px', color: '#d4a54a' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </div>
                        <p style={{ color: '#666', fontSize: '15px' }}>@{user.username}</p>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', maxWidth: '600px' }}>{user.bio}</p>
                    )}

                    {/* Meta Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666', fontSize: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar style={{ width: '16px', height: '16px' }} />
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{user.storiesCount}</span>
                            <span style={{ color: '#666', marginLeft: '6px' }}>Stories</span>
                        </button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{followersCount}</span>
                            <span style={{ color: '#666', marginLeft: '6px' }}>Followers</span>
                        </button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>{user.followingCount}</span>
                            <span style={{ color: '#666', marginLeft: '6px' }}>Following</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #222', padding: '0 24px', marginTop: '24px' }}>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <button
                        onClick={() => setActiveTab('stories')}
                        style={{
                            padding: '16px 0',
                            fontWeight: 500,
                            fontSize: '15px',
                            color: activeTab === 'stories' ? '#fff' : '#666',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                    >
                        Stories
                        {activeTab === 'stories' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                borderRadius: '2px 2px 0 0',
                            }} />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('likes')}
                        style={{
                            padding: '16px 0',
                            fontWeight: 500,
                            fontSize: '15px',
                            color: activeTab === 'likes' ? '#fff' : '#666',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                        }}
                    >
                        Likes
                        {activeTab === 'likes' && (
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                borderRadius: '2px 2px 0 0',
                            }} />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
                {stories.length === 0 ? (
                    <div style={{
                        background: '#111',
                        border: '1px solid #222',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: '#666' }}>No stories yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {stories.map(story => (
                            <StoryCard key={story._id} story={story} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
