'use client';

import { useState, useEffect, useRef } from 'react';
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
    Award,
    ChevronLeft,
    ChevronRight,
    Flame,
    Clock,
    BookMarked,
    Feather,
    Crown,
    Play
} from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';

interface Story {
    _id: string;
    title?: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        isVerified?: boolean;
    };
    content: string;
    images: string[];
    tags?: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

interface Stats {
    stories: number;
    users: number;
    reads: number;
}

// Genre data with gradients, icons, and background images
const genres = [
    { name: 'Fantasy', icon: '🐉', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', count: '2.3M', image: 'https://d2kedo66kb0tvz.cloudfront.net/q:85/w:1080/h:1622/blur:0/bG9jYWw6Ly8vMjAyNC8wNy8yODQtU1RPUlktQk9PSy1DT1ZFUi0zLmpwZw' },
    { name: 'Romance', icon: '💕', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', count: '4.1M', image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80' },
    { name: 'Sci-Fi', icon: '🚀', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', count: '1.8M', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80' },
    { name: 'Mystery', icon: '🔍', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)', count: '980K', image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&q=80' },
    { name: 'Horror', icon: '👻', gradient: 'linear-gradient(135deg, #c31432 0%, #240b36 100%)', count: '750K', image: 'https://w0.peakpx.com/wallpaper/181/545/HD-wallpaper-spook-deadly-horror-spooky-horror-nun-thumbnail.jpg' },
    { name: 'Adventure', icon: '⚔️', gradient: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)', count: '1.5M', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80' },
    { name: 'Drama', icon: '🎭', gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', count: '890K', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
    { name: 'Comedy', icon: '😂', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', count: '620K', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&q=80' },
];

// How it works steps
const howItWorks = [
    { step: 1, title: 'Create Account', description: 'Sign up free in seconds', icon: Feather },
    { step: 2, title: 'Write Your Story', description: 'Use our powerful editor', icon: PenSquare },
    { step: 3, title: 'Get Readers', description: 'Reach millions worldwide', icon: Globe },
];

export default function LandingPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [stats, setStats] = useState<Stats>({ stories: 0, users: 0, reads: 0 });
    const [loading, setLoading] = useState(true);
    const [animatedStats, setAnimatedStats] = useState({ stories: 0, users: 0, reads: 0 });
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storiesRes, statsRes] = await Promise.all([
                    fetch('/api/stories?limit=12'),
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

    // Animate stats
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

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 320;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', overflow: 'hidden' }}>
            {/* CSS Keyframes */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
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
                @keyframes typewriter {
                    from { width: 0; }
                    to { width: 100%; }
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
                .carousel-scroll::-webkit-scrollbar {
                    display: none;
                }
                .hover-scale:hover {
                    transform: scale(1.03);
                }
            `}</style>

            {/* ========== HERO SECTION ========== */}
            <section style={{
                position: 'relative',
                padding: '80px 24px 60px',
                minHeight: '85vh',
                display: 'flex',
                alignItems: 'center',
            }}>
                {/* Animated Background */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(ellipse at 20% 30%, rgba(212, 165, 74, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    {/* Left Content */}
                    <div style={{ zIndex: 10 }}>
                        {/* Badge */}
                        <div className="animate-slide-up" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: 'rgba(212, 165, 74, 0.1)',
                            borderRadius: '50px',
                            marginBottom: '24px',
                            border: '1px solid rgba(212, 165, 74, 0.2)',
                        }}>
                            <Flame style={{ width: '16px', height: '16px', color: '#ff6b35' }} />
                            <span style={{ color: '#d4a54a', fontSize: '14px', fontWeight: 600 }}>
                                {formatNumber(stats.users)}+ writers online now
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="animate-slide-up gradient-animated" style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #fff 0%, #d4a54a 50%, #ff6b35 100%)',
                            backgroundSize: '200% 200%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Discover Stories<br />That Move You
                        </h1>

                        {/* Subheadline */}
                        <p className="animate-slide-up" style={{
                            fontSize: '1.2rem',
                            color: '#999',
                            marginBottom: '32px',
                            lineHeight: 1.7,
                            maxWidth: '500px',
                        }}>
                            Join millions of readers and writers sharing stories across every genre.
                            Your next favorite story is waiting.
                        </p>

                        {/* CTA Buttons */}
                        <div className="animate-slide-up" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/register" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '16px 32px',
                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                color: '#000',
                                fontWeight: 700,
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                boxShadow: '0 10px 30px rgba(212, 165, 74, 0.3)',
                                transition: 'transform 0.2s',
                            }}>
                                <Zap style={{ width: '20px', height: '20px' }} />
                                Start Writing
                            </Link>
                            <Link href="/browse" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '16px 32px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                textDecoration: 'none',
                                fontSize: '16px',
                            }}>
                                <BookOpen style={{ width: '20px', height: '20px' }} />
                                Start Reading
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="animate-slide-up" style={{
                            marginTop: '48px',
                            display: 'flex',
                            gap: '40px',
                        }}>
                            {[
                                { label: 'Stories', value: animatedStats.stories, icon: BookOpen },
                                { label: 'Writers', value: animatedStats.users, icon: PenSquare },
                                { label: 'Reads', value: animatedStats.reads, icon: Eye },
                            ].map((stat, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 800,
                                        color: '#d4a54a',
                                    }}>
                                        {formatNumber(stat.value)}+
                                    </div>
                                    <div style={{ color: '#666', fontSize: '13px' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Floating Book Covers with Story Images */}
                    <div style={{ position: 'relative', height: '500px', display: 'none' }} className="md:block">
                        {stories.slice(0, 5).map((story, i) => {
                            const positions = [
                                { top: '5%', left: '10%', rotate: -12, delay: 0 },
                                { top: '15%', left: '55%', rotate: 8, delay: 0.5 },
                                { top: '45%', left: '5%', rotate: 5, delay: 1 },
                                { top: '40%', left: '50%', rotate: -8, delay: 1.5 },
                                { top: '70%', left: '25%', rotate: 10, delay: 2 },
                            ];
                            const pos = positions[i];
                            const colors = ['#667eea', '#f093fb', '#4facfe', '#f2994a', '#c31432'];

                            return (
                                <Link href={`/story/${story._id}`} key={story._id} className="animate-float" style={{
                                    position: 'absolute',
                                    top: pos.top,
                                    left: pos.left,
                                    width: '120px',
                                    height: '170px',
                                    borderRadius: '8px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    transform: `rotate(${pos.rotate}deg)`,
                                    animationDelay: `${pos.delay}s`,
                                    overflow: 'hidden',
                                    textDecoration: 'none',
                                }}>
                                    {story.images[0] ? (
                                        <img
                                            src={story.images[0]}
                                            alt={story.title || 'Story'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(135deg, ${colors[i]} 0%, ${colors[i]}99 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <BookOpen style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.5)' }} />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========== GENRE GRID ========== */}
            <section style={{
                padding: '80px 24px',
                background: '#0d0d0d'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '20px',
                            color: '#667eea',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '12px',
                        }}>
                            📚 EXPLORE GENRES
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
                            Find Your Next Obsession
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '16px',
                    }}>
                        {genres.map((genre, i) => (
                            <Link href={`/browse?genre=${genre.name.toLowerCase()}`} key={i} style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                padding: '28px 16px',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                overflow: 'hidden',
                                minHeight: '160px',
                            }} className="hover-scale">
                                {/* Background Image */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundImage: `url(${genre.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }} />
                                {/* Gradient Overlay for text readability */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: `${genre.gradient}, linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)`,
                                    opacity: 0.85,
                                }} />
                                {/* Content */}
                                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>{genre.icon}</span>
                                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', display: 'block' }}>{genre.name}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{genre.count} stories</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <AdBanner />

            {/* ========== FEATURED STORIES CAROUSEL ========== */}
            <section style={{
                padding: '80px 24px',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                        <div>
                            <span style={{ color: '#d4a54a', fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>
                                ⭐ FEATURED
                            </span>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '8px' }}>
                                Editor's Picks
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => scrollCarousel('left')} style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ChevronLeft style={{ width: '20px', height: '20px' }} />
                            </button>
                            <button onClick={() => scrollCarousel('right')} style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ChevronRight style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={carouselRef}
                        className="carousel-scroll"
                        style={{
                            display: 'flex',
                            gap: '20px',
                            overflowX: 'auto',
                            paddingBottom: '20px',
                            scrollSnapType: 'x mandatory',
                        }}
                    >
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} style={{
                                    minWidth: '300px',
                                    height: '400px',
                                    background: '#111',
                                    borderRadius: '16px',
                                    animation: 'pulse 2s infinite',
                                }} />
                            ))
                        ) : stories.slice(0, 8).map((story, idx) => (
                            <Link href={`/story/${story._id}`} key={story._id} style={{
                                minWidth: '280px',
                                background: '#111',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                scrollSnapAlign: 'start',
                                transition: 'transform 0.2s',
                                border: '1px solid #1a1a1a',
                            }} className="hover-scale">
                                {/* Cover Image */}
                                {story.images[0] ? (
                                    <img src={story.images[0]} alt="" style={{
                                        width: '100%', height: '200px', objectFit: 'cover',
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '200px',
                                        background: `linear-gradient(135deg, hsl(${idx * 45 + 200}, 60%, 40%) 0%, hsl(${idx * 45 + 230}, 60%, 25%) 100%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <BookOpen style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                )}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{
                                        color: '#fff', fontSize: '1rem', fontWeight: 600,
                                        marginBottom: '8px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {story.title || story.content.substring(0, 40) + '...'}
                                    </h3>
                                    <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                                        by {story.author.name}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#555', fontSize: '13px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Heart style={{ width: '14px', height: '14px' }} />
                                            {formatNumber(story.likesCount)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MessageCircle style={{ width: '14px', height: '14px' }} />
                                            {story.commentsCount}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== HOT THIS WEEK - LEADERBOARD ========== */}
            <section style={{
                padding: '80px 24px',
                background: '#0d0d0d'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: 'rgba(255, 107, 53, 0.1)',
                            borderRadius: '20px',
                            color: '#ff6b35',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '12px',
                        }}>
                            <Flame style={{ width: '14px', height: '14px' }} />
                            HOT THIS WEEK
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
                            Trending Stories
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stories.slice(0, 5).map((story, idx) => (
                            <Link href={`/story/${story._id}`} key={story._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '20px 24px',
                                background: idx === 0 ? 'linear-gradient(135deg, rgba(212, 165, 74, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)' : '#111',
                                border: idx === 0 ? '1px solid rgba(212, 165, 74, 0.3)' : '1px solid #1a1a1a',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                transition: 'transform 0.2s, border-color 0.2s',
                            }} className="hover-scale">
                                {/* Rank */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' :
                                        idx === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #888 100%)' :
                                            idx === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)' : '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: idx < 3 ? '#000' : '#666',
                                    fontWeight: 800,
                                    fontSize: '18px',
                                    flexShrink: 0,
                                }}>
                                    {idx === 0 ? <Crown style={{ width: '20px', height: '20px' }} /> : idx + 1}
                                </div>

                                {/* Cover */}
                                {story.images[0] ? (
                                    <img src={story.images[0]} alt="" style={{
                                        width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0,
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '60px', height: '80px', borderRadius: '8px', flexShrink: 0,
                                        background: `linear-gradient(135deg, hsl(${idx * 60 + 100}, 50%, 35%) 0%, hsl(${idx * 60 + 130}, 50%, 20%) 100%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <BookOpen style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.4)' }} />
                                    </div>
                                )}

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {story.title || story.content.substring(0, 50) + '...'}
                                    </h3>
                                    <p style={{ color: '#666', fontSize: '13px' }}>
                                        by {story.author.name}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#555', fontSize: '13px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Heart style={{ width: '14px', height: '14px', color: '#ff6b35' }} />
                                        {formatNumber(story.likesCount)}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Eye style={{ width: '14px', height: '14px' }} />
                                        {formatNumber(story.likesCount * 8)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link href="/browse" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid #333',
                            borderRadius: '10px',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            View All Stories <ArrowRight style={{ width: '16px', height: '16px' }} />
                        </Link>
                    </div>
                </div>
            </section>

            <AdBanner />

            {/* ========== HOW IT WORKS ========== */}
            <section style={{
                padding: '100px 24px',
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '20px',
                            color: '#22c55e',
                            fontSize: '13px',
                            fontWeight: 600,
                            marginBottom: '12px',
                        }}>
                            ✨ SIMPLE STEPS
                        </span>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
                            Start Your Journey
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '32px',
                    }}>
                        {howItWorks.map((step, i) => (
                            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                                {/* Connector Line */}
                                {i < 2 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '40px',
                                        right: '-16px',
                                        width: '32px',
                                        height: '2px',
                                        background: 'linear-gradient(90deg, #d4a54a, transparent)',
                                    }} />
                                )}

                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 20px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <step.icon style={{ width: '36px', height: '36px', color: '#000' }} />
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#d4a54a',
                                    fontWeight: 700,
                                    marginBottom: '8px',
                                }}>
                                    STEP {step.step}
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                                    {step.title}
                                </h3>
                                <p style={{ color: '#666', fontSize: '14px' }}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section style={{
                padding: '120px 24px',
                background: 'linear-gradient(180deg, #0d0d0d 0%, #111 50%, #0a0a0a 100%)',
                textAlign: 'center',
                position: 'relative',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(212, 165, 74, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '24px',
                    }}>
                        Your Story Starts Here
                    </h2>
                    <p style={{
                        color: '#888',
                        fontSize: '1.1rem',
                        maxWidth: '550px',
                        margin: '0 auto 40px',
                        lineHeight: 1.8,
                    }}>
                        Join our community of passionate writers and readers.
                        It's free, it's fun, and your story deserves to be told.
                    </p>
                    <Link href="/register" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '18px 40px',
                        background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                        color: '#000',
                        fontWeight: 700,
                        borderRadius: '14px',
                        textDecoration: 'none',
                        fontSize: '17px',
                        boxShadow: '0 15px 40px rgba(212, 165, 74, 0.3)',
                    }}>
                        Create Free Account
                        <ArrowRight style={{ width: '20px', height: '20px' }} />
                    </Link>
                </div>
            </section>

            <AdBanner />

            {/* ========== FOOTER ========== */}
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
                    <Link href="/browse" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                        Browse
                    </Link>
                </div>
            </footer>
        </div>
    );
}
