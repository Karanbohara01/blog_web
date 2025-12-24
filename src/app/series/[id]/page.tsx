'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, ArrowLeft, BookOpen, Heart, MessageCircle, ChevronRight, CheckCircle } from 'lucide-react';

interface Series {
    _id: string;
    author: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
        isVerified?: boolean;
    };
    title: string;
    description: string;
    coverImage?: string;
    tags: string[];
    storiesCount: number;
    isComplete: boolean;
    createdAt: string;
}

interface Chapter {
    _id: string;
    title: string;
    chapterNumber: number;
    chapterTitle?: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

export default function SeriesPage() {
    const params = useParams();
    const seriesId = params?.id as string;
    const [series, setSeries] = useState<Series | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (seriesId) {
            fetchSeries();
        }
    }, [seriesId]);

    const fetchSeries = async () => {
        try {
            const res = await fetch(`/api/series/${seriesId}`);
            const data = await res.json();
            setSeries(data.series);
            setChapters(data.chapters || []);
        } catch (error) {
            console.error('Failed to fetch series:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!series) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h2 style={{ color: '#fff', marginBottom: '8px' }}>Series not found</h2>
                <Link href="/browse" style={{ color: '#d4a54a' }}>Browse Stories</Link>
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
            <Link href="/browse" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#888',
                fontSize: '14px',
                textDecoration: 'none',
                marginBottom: '24px',
            }}>
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Browse
            </Link>

            {/* Series Header */}
            <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
            }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                    {/* Cover */}
                    {series.coverImage ? (
                        <img
                            src={series.coverImage}
                            alt={series.title}
                            style={{
                                width: '160px',
                                height: '220px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                flexShrink: 0,
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '160px',
                            height: '220px',
                            background: 'linear-gradient(135deg, #333 0%, #222 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <BookOpen style={{ width: '48px', height: '48px', color: '#555' }} />
                        </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>
                                {series.title}
                            </h1>
                            {series.isComplete && (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    background: 'rgba(74, 222, 128, 0.1)',
                                    borderRadius: '12px',
                                    color: '#4ade80',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                }}>
                                    <CheckCircle style={{ width: '12px', height: '12px' }} />
                                    Complete
                                </span>
                            )}
                        </div>

                        <Link href={`/profile/${series.author.username}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: '#888',
                            textDecoration: 'none',
                            marginBottom: '12px',
                        }}>
                            by {series.author.name}
                            {series.author.isVerified && (
                                <svg style={{ width: '14px', height: '14px', color: '#d4a54a' }} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            )}
                        </Link>

                        {series.description && (
                            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                                {series.description}
                            </p>
                        )}

                        {/* Tags */}
                        {series.tags?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                {series.tags.map((tag, idx) => (
                                    <span key={idx} style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        background: 'rgba(212, 165, 74, 0.1)',
                                        color: '#d4a54a',
                                        fontSize: '12px',
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p style={{ color: '#666', fontSize: '13px' }}>
                            {chapters.length} chapters · Started {formatDistanceToNow(new Date(series.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Start Reading Button */}
            {chapters.length > 0 && (
                <Link href={`/story/${chapters[0]._id}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    borderRadius: '12px',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '16px',
                    textDecoration: 'none',
                    marginBottom: '24px',
                }}>
                    <BookOpen style={{ width: '20px', height: '20px' }} />
                    Start Reading
                </Link>
            )}

            {/* Chapters List */}
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
                Chapters
            </h2>

            {chapters.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#111',
                    borderRadius: '12px',
                    border: '1px solid #222',
                    color: '#666',
                }}>
                    No chapters yet
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chapters.map((chapter, index) => (
                        <Link
                            key={chapter._id}
                            href={`/story/${chapter._id}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px 20px',
                                background: '#111',
                                border: '1px solid #222',
                                borderRadius: '12px',
                                textDecoration: 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(212, 165, 74, 0.1)',
                                    color: '#d4a54a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}>
                                    {chapter.chapterNumber || index + 1}
                                </span>
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>
                                        {chapter.chapterTitle || chapter.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#666' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Heart style={{ width: '12px', height: '12px' }} />
                                            {chapter.likesCount}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MessageCircle style={{ width: '12px', height: '12px' }} />
                                            {chapter.commentsCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight style={{ width: '20px', height: '20px', color: '#555' }} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
