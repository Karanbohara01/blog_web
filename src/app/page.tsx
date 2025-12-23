'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import StoryCard from '@/components/story/StoryCard';
import { Loader2, PenSquare, TrendingUp, Users, Flame, Crown } from 'lucide-react';
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
  };
  content: string;
  images: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const { isMobile, isTablet } = useResponsive();

  const fetchStories = async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(activeTab === 'following' && { following: 'true' }),
      });

      const res = await fetch(`/api/stories?${params}`);
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
    setLoading(true);
    setPage(1);
    fetchStories(1, true);
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStories(nextPage);
  };

  const handleDelete = (storyId: string) => {
    setStories(prev => prev.filter(s => s._id !== storyId));
  };

  // Card style
  const cardStyle = {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '20px'
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ width: '24px', height: '24px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px'
    }}>
      <AdBanner />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="lg:!grid-cols-[2fr_1fr]">
        {/* Main Feed */}
        <div>
          {/* Create Story CTA */}
          {session && (
            <Link href="/create" style={{ display: 'block', marginBottom: '20px', textDecoration: 'none' }}>
              <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                {session.user?.image ? (
                  <img src={session.user.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #333' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '600' }}>
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span style={{ flex: 1, color: '#666', fontSize: '14px' }}>Share your story...</span>
                <PenSquare style={{ width: '20px', height: '20px', color: '#d4a54a' }} />
              </div>
            </Link>
          )}

          {/* Tabs */}
          {session && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('forYou')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: activeTab === 'forYou' ? 'none' : '1px solid #222',
                  background: activeTab === 'forYou' ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' : '#111',
                  color: activeTab === 'forYou' ? '#000' : '#888'
                }}
              >
                <Flame style={{ width: '16px', height: '16px' }} />
                Hot
              </button>
              <button
                onClick={() => setActiveTab('following')}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: activeTab === 'following' ? 'none' : '1px solid #222',
                  background: activeTab === 'following' ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' : '#111',
                  color: activeTab === 'following' ? '#000' : '#888'
                }}
              >
                <Users style={{ width: '16px', height: '16px' }} />
                Following
              </button>
            </div>
          )}

          {/* Stories */}
          {stories.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 8px' }}>No stories yet</h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px' }}>
                {activeTab === 'following' ? 'Follow some people to see their stories' : 'Be the first to share your story!'}
              </p>
              {session && (
                <Link href="/create" style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}>
                  Create Story
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {stories.map(story => (
                <StoryCard key={story._id} story={story} onDelete={handleDelete} />
              ))}
              {hasMore && (
                <button onClick={handleLoadMore} style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#888',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Load More
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:!block">
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Welcome Card */}
            {!session && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#000', fontWeight: 'bold', fontSize: '16px' }}>S</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>Join Stories</h3>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Share your world</p>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px', lineHeight: '1.5' }}>
                  Discover stories, connect with creators, and share content.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/register" style={{
                    display: 'block',
                    padding: '10px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}>
                    Join Now
                  </Link>
                  <Link href="/login" style={{
                    display: 'block',
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid #333',
                    color: '#d4a54a',
                    fontSize: '14px',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}>
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* Trending */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: '16px', height: '16px', color: '#d4a54a' }} />
                Trending
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['#fantasy', '#stories', '#creative', '#art', '#adventure'].map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#888',
                    textDecoration: 'none'
                  }}>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div style={{ ...cardStyle, borderColor: 'rgba(212, 165, 74, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Crown style={{ width: '16px', height: '16px', color: '#d4a54a' }} />
                <span style={{
                  padding: '3px 8px',
                  background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                  color: '#000',
                  fontSize: '10px',
                  fontWeight: '700',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>Premium</span>
              </div>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 12px' }}>Unlock exclusive features</p>
              <button onClick={() => window.open('https://www.effectivegatecpm.com/wqwadwdp?key=7542f1f2bbce4076ac21e01fd380463d', '_blank')} style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                color: '#000',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}>
                Upgrade
              </button>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#555' }}>
              <p style={{ margin: '0 0 4px' }}>© 2024 Stories</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Link href="/about" style={{ color: '#555', textDecoration: 'none' }}>About</Link>
                <Link href="/privacy" style={{ color: '#555', textDecoration: 'none' }}>Privacy</Link>
                <Link href="/terms" style={{ color: '#555', textDecoration: 'none' }}>Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdBanner />
    </div>
  );
}
