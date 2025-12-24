'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    PenSquare,
    Users,
    Heart,
    Sparkles,
    TrendingUp,
    ArrowRight,
    Star,
    MessageCircle,
    Eye,
    Zap,
    Globe,
    Award
} from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';

interface Story {
    _id: string;
    author: {
        name: string;
        username: string;
        avatar?: string;
    };
    content: string;
    images: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

interface Stats {
    stories: number;
    users: number;
    reads: number;
}

export default function LandingPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [stats, setStats] = useState<Stats>({ stories: 0, users: 0, reads: 0 });
    const [loading, setLoading] = useState(true);
    const [animatedStats, setAnimatedStats] = useState({ stories: 0, users: 0, reads: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storiesRes, statsRes] = await Promise.all([
                    fetch('/api/stories?limit=6'),
                    fetch('/api/stats'),
                ]);

                const storiesData = await storiesRes.json();
                const statsData = await statsRes.json();

                setStories(storiesData.stories || []);
                setStats(statsData);
            } catch (error) {
                console.error('Failed to fetch landing data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Animate stats counting up
    useEffect(() => {
        if (stats.stories > 0 || stats.users > 0) {
            const duration = 2000;
            const steps = 50;
            const interval = duration / steps;

            let step = 0;
            const timer = setInterval(() => {
                step++;
                setAnimatedStats({
                    stories: Math.floor((stats.stories / steps) * step),
                    users: Math.floor((stats.users / steps) * step),
                    reads: Math.floor((stats.reads / steps) * step),
                });
                if (step >= steps) clearInterval(timer);
            }, interval);

            return () => clearInterval(timer);
        }
    }, [stats]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const features = [
        {
            icon: PenSquare,
            title: 'Write Freely',
            description: 'Unleash your creativity with our powerful editor. No limits, just stories.',
            gradient: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
        },
        {
            icon: Globe,
            title: 'Reach Millions',
            description: 'Your stories reach readers worldwide. Build a global fanbase.',
            gradient: 'linear-gradient(135deg, #9f7aea 0%, #667eea 100%)',
        },
        {
            icon: Users,
            title: 'Build Community',
            description: 'Connect with readers, get feedback, and grow together.',
            gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        },
        {
            icon: Award,
            title: 'Get Recognized',
            description: 'Featured stories, trending lists, and community awards await.',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        },
    ];

    // Floating book covers for visual appeal
    const floatingCovers = [
        { top: '10%', left: '5%', rotate: '-15deg', delay: '0s', size: 80 },
        { top: '20%', right: '8%', rotate: '12deg', delay: '0.5s', size: 70 },
        { top: '60%', left: '3%', rotate: '8deg', delay: '1s', size: 60 },
        { top: '70%', right: '5%', rotate: '-10deg', delay: '1.5s', size: 75 },
    ];

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', overflow: 'hidden' }}>
            {/* CSS Keyframes */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
                    50% { transform: translateY(-20px) rotate(var(--rotate)); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(212, 165, 74, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(212, 165, 74, 0.6); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                }
                .gradient-animated {
                    background-size: 200% 200%;
                    animation: gradient-shift 4s ease infinite;
                }
            `}</style>

            {/* Hero Section with Floating Elements */}
            <section style={{
                position: 'relative',
                padding: '100px 24px 80px',
                textAlign: 'center',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {/* Animated Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(ellipse at 30% 20%, rgba(212, 165, 74, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }} />

                {/* Floating Books */}
                {floatingCovers.map((cover, i) => (
                    <div key={i} className="animate-float" style={{
                        position: 'absolute',
                        top: cover.top,
                        left: cover.left,
                        right: cover.right,
                        width: cover.size,
                        height: cover.size * 1.5,
                        background: `linear-gradient(135deg, hsl(${i * 60 + 30}, 70%, 50%) 0%, hsl(${i * 60 + 60}, 70%, 35%) 100%)`,
                        borderRadius: '8px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        animationDelay: cover.delay,
                        ['--rotate' as any]: cover.rotate,
                        opacity: 0.7,
                        display: window.innerWidth > 768 ? 'block' : 'none',
                    }} />
                ))}

                <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', zIndex: 10 }}>
                    {/* Badge */}
                    <div className="animate-slide-up" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 20px',
                        background: 'rgba(212, 165, 74, 0.1)',
                        borderRadius: '9999px',
                        marginBottom: '32px',
                        border: '1px solid rgba(212, 165, 74, 0.3)',
                        backdropFilter: 'blur(10px)',
                        animationDelay: '0.1s',
                    }}>
                        <Sparkles style={{ width: '18px', height: '18px', color: '#d4a54a' }} />
                        <span style={{ color: '#d4a54a', fontSize: '15px', fontWeight: 600 }}>
                            🔥 Join {formatNumber(stats.users)}+ storytellers worldwide
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="animate-slide-up gradient-animated" style={{
                        fontSize: 'clamp(3rem, 10vw, 5rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '28px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 50%, #d4a54a 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animationDelay: '0.2s',
                    }}>
                        Where Stories<br />Come Alive
                    </h1>

                    {/* Subheadline */}
                    <p className="animate-slide-up" style={{
                        fontSize: '1.35rem',
                        color: '#b0b0b0',
                        maxWidth: '650px',
                        margin: '0 auto 48px',
                        lineHeight: 1.8,
                        animationDelay: '0.3s',
                    }}>
                        Discover millions of stories from writers around the world.
                        Share your creativity. Build your audience. <span style={{ color: '#d4a54a' }}>Start your journey today.</span>
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-slide-up" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.4s' }}>
                        <Link href="/register" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '18px 40px',
                            background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                            color: '#000',
                            fontWeight: 700,
                            borderRadius: '14px',
                            textDecoration: 'none',
                            fontSize: '17px',
                            boxShadow: '0 10px 30px rgba(212, 165, 74, 0.4)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                        }}>
                            <Zap style={{ width: '22px', height: '22px' }} />
                            Start Writing Free
                        </Link>
                        <Link href="/browse" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '18px 40px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textDecoration: 'none',
                            fontSize: '17px',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <BookOpen style={{ width: '22px', height: '22px' }} />
                            Browse Stories
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="animate-slide-up" style={{
                        marginTop: '60px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '40px',
                        opacity: 0.6,
                        animationDelay: '0.5s',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>✓ Free to use</span>
                        <span style={{ color: '#666', fontSize: '14px' }}>✓ No ads for writers</span>
                        <span style={{ color: '#666', fontSize: '14px' }}>✓ Instant publishing</span>
                    </div>
                </div>
            </section>

            {/* Ad Banner */}
            <AdBanner />

            {/* Animated Stats Section */}
            <section style={{
                padding: '80px 24px',
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)',
            }}>
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '40px',
                    textAlign: 'center',
                }}>
                    {[
                        { value: animatedStats.stories, label: 'Stories Published', icon: BookOpen },
                        { value: animatedStats.users, label: 'Active Writers', icon: PenSquare },
                        { value: animatedStats.reads, label: 'Total Reads', icon: Eye },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: '32px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}>
                            <stat.icon style={{ width: '32px', height: '32px', color: '#d4a54a', marginBottom: '16px' }} />
                            <div style={{
                                fontSize: '3.5rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                {formatNumber(stat.value)}+
                            </div>
                            <div style={{ color: '#888', marginTop: '8px', fontSize: '15px' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section - Cards with Hover Effects */}
            <section style={{ padding: '100px 24px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            background: 'rgba(159, 122, 234, 0.1)',
                            borderRadius: '8px',
                            color: '#9f7aea',
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '16px',
                        }}>
                            ✨ WHY CHOOSE US
                        </span>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 700,
                            color: '#fff',
                            marginBottom: '16px',
                        }}>
                            Everything You Need to Succeed
                        </h2>
                        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                            From writing to publishing to building your audience — we've got you covered.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '24px',
                    }}>
                        {features.map((feature, index) => (
                            <div key={index} style={{
                                padding: '36px 28px',
                                background: '#111',
                                borderRadius: '20px',
                                border: '1px solid #222',
                                transition: 'transform 0.3s, border-color 0.3s',
                                cursor: 'pointer',
                            }} onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.borderColor = '#444';
                            }} onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = '#222';
                            }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: feature.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '24px',
                                }}>
                                    <feature.icon style={{ width: '28px', height: '28px', color: '#fff' }} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: 1.7 }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ad Banner */}
            <AdBanner />

            {/* Trending Stories - Glassmorphism Cards */}
            <section style={{ padding: '100px 24px', background: '#0d0d0d' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                        <div>
                            <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>
                                🔥 TRENDING NOW
                            </span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
                                Popular Stories
                            </h2>
                        </div>
                        <Link href="/browse" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 24px',
                            background: 'rgba(212, 165, 74, 0.1)',
                            color: '#d4a54a',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            border: '1px solid rgba(212, 165, 74, 0.2)',
                        }}>
                            View All <ArrowRight style={{ width: '16px', height: '16px' }} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                border: '3px solid #222',
                                borderTopColor: '#d4a54a',
                                borderRadius: '50%',
                                margin: '0 auto 16px',
                                animation: 'spin 1s linear infinite',
                            }} />
                            Loading amazing stories...
                        </div>
                    ) : stories.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px',
                            background: '#111',
                            borderRadius: '20px',
                            border: '1px solid #222',
                        }}>
                            <PenSquare style={{ width: '48px', height: '48px', color: '#d4a54a', marginBottom: '16px' }} />
                            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>No stories yet!</h3>
                            <p style={{ color: '#666' }}>Be the first to share your story with the world.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                            gap: '24px',
                        }}>
                            {stories.slice(0, 6).map((story, idx) => {
                                const title = story.content.split('\n')[0]?.substring(0, 50) || 'Untitled';
                                const preview = story.content.substring(0, 100);

                                return (
                                    <Link href={`/story/${story._id}`} key={story._id} style={{
                                        display: 'block',
                                        padding: '24px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        textDecoration: 'none',
                                        transition: 'transform 0.3s, border-color 0.3s, background 0.3s',
                                        backdropFilter: 'blur(10px)',
                                    }} onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.borderColor = 'rgba(212, 165, 74, 0.3)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                    }} onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    }}>
                                        {story.images[0] ? (
                                            <img
                                                src={story.images[0]}
                                                alt={title}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: '14px',
                                                    marginBottom: '20px',
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '180px',
                                                borderRadius: '14px',
                                                marginBottom: '20px',
                                                background: `linear-gradient(135deg, hsl(${idx * 50 + 20}, 70%, 45%) 0%, hsl(${idx * 50 + 50}, 70%, 30%) 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <BookOpen style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.3)' }} />
                                            </div>
                                        )}
                                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                                            {title}
                                        </h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
                                            {preview}...
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {story.author.avatar ? (
                                                    <img
                                                        src={story.author.avatar}
                                                        alt={story.author.name}
                                                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: '#000',
                                                    }}>
                                                        {story.author.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span style={{ color: '#aaa', fontSize: '14px' }}>{story.author.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#555', fontSize: '13px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Heart style={{ width: '14px', height: '14px' }} />
                                                    {story.likesCount}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MessageCircle style={{ width: '14px', height: '14px' }} />
                                                    {story.commentsCount}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Final CTA - Full Width Gradient */}
            <section style={{
                padding: '120px 24px',
                background: 'linear-gradient(180deg, #111 0%, #0a0a0a 50%, #111 100%)',
                textAlign: 'center',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(212, 165, 74, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '24px',
                    }}>
                        Ready to Write Your Story?
                    </h2>
                    <p style={{
                        color: '#888',
                        fontSize: '1.2rem',
                        maxWidth: '550px',
                        margin: '0 auto 40px',
                        lineHeight: 1.8,
                    }}>
                        Join thousands of writers who've already started their journey.
                        It's free, it's easy, and your story deserves to be told.
                    </p>
                    <Link href="/register" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '20px 48px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        color: '#000',
                        fontWeight: 700,
                        borderRadius: '16px',
                        textDecoration: 'none',
                        fontSize: '18px',
                        boxShadow: '0 15px 40px rgba(212, 165, 74, 0.4)',
                    }}>
                        Get Started — It's Free
                        <ArrowRight style={{ width: '22px', height: '22px' }} />
                    </Link>
                </div>
            </section>

            {/* Ad Banner */}
            <AdBanner />

            {/* Footer */}
            <footer style={{
                padding: '48px 24px',
                borderTop: '1px solid #1a1a1a',
                textAlign: 'center',
            }}>
                <div style={{ color: '#444', fontSize: '14px', marginBottom: '20px' }}>
                    © 2024 Stories. Made with ❤️ for storytellers everywhere.
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                    <Link href="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                        Sign In
                    </Link>
                    <Link href="/register" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                        Sign Up
                    </Link>
                </div>
            </footer>
        </div>
    );
}
