'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2, Send, Plus } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

export default function CreateStoryForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const { isMobile } = useResponsive();

    const handleImageUpload = async (files: FileList) => {
        if (images.length + files.length > 4) {
            setError('Maximum 4 images allowed');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setImages(prev => [...prev, ...data.urls]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
            handleImageUpload(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 10) {
            setTags(prev => [...prev, tag]);
            setTagInput('');
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const removeTag = (index: number) => {
        setTags(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Please add a title for your story');
            return;
        }
        if (!content.trim() && images.length === 0) {
            setError('Please add some content or images');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    images,
                    tags,
                    telegramLink: telegramLink.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create story');
            }

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to create story');
        } finally {
            setSubmitting(false);
        }
    };

    const titleMaxLength = 150;

    // Shared styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
    };

    const inputStyle = {
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#fff',
        fontSize: '16px',
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div style={{
                    padding: '14px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    color: '#f87171',
                    fontSize: '14px',
                    marginBottom: '24px',
                }}>
                    {error}
                </div>
            )}

            {/* Title Input */}
            <div style={{ ...cardStyle, padding: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
                    Story Title *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your story a captivating title..."
                    maxLength={titleMaxLength}
                    style={{
                        ...inputStyle,
                        fontSize: '22px',
                        fontWeight: 600,
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <span style={{
                        fontSize: '12px',
                        color: title.length > titleMaxLength * 0.9 ? '#ff6b35' : '#555',
                    }}>
                        {title.length}/{titleMaxLength}
                    </span>
                </div>
            </div>

            {/* Content Textarea */}
            <div style={{ ...cardStyle, padding: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
                    Story Content *
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell your story..."
                    style={{
                        ...inputStyle,
                        minHeight: '200px',
                        lineHeight: '1.6',
                        resize: 'vertical',
                        padding: isMobile ? '8px 0' : '0',
                    }}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    paddingTop: '12px',
                    borderTop: '1px solid #222',
                    marginTop: '12px',
                }}>
                    <span style={{
                        fontSize: '13px',
                        color: '#555',
                    }}>
                        {content.length.toLocaleString()} characters
                    </span>
                </div>
            </div>

            {/* Tags Input */}
            <div style={{ ...cardStyle, padding: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
                    Tags (optional)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: tags.length > 0 ? '12px' : '0' }}>
                    {tags.map((tag, index) => (
                        <span key={index} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'rgba(212, 165, 74, 0.15)',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: '#d4a54a',
                        }}>
                            #{tag}
                            <button type="button" onClick={() => removeTag(index)} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                color: '#d4a54a',
                                display: 'flex',
                            }}>
                                <X style={{ width: '14px', height: '14px' }} />
                            </button>
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add a tag (press Enter)"
                        maxLength={30}
                        disabled={tags.length >= 10}
                        style={{
                            ...inputStyle,
                            flex: 1,
                            padding: '8px 0',
                        }}
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        disabled={!tagInput.trim() || tags.length >= 10}
                        style={{
                            padding: '8px 16px',
                            background: tagInput.trim() ? 'rgba(212, 165, 74, 0.2)' : '#222',
                            border: 'none',
                            borderRadius: '8px',
                            color: tagInput.trim() ? '#d4a54a' : '#555',
                            cursor: tagInput.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '14px',
                        }}
                    >
                        <Plus style={{ width: '16px', height: '16px' }} />
                        Add
                    </button>
                </div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                    {tags.length}/10 tags • Helps readers discover your story
                </div>
            </div>

            {/* Telegram Link Input */}
            <div style={{ ...cardStyle, padding: '20px', marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: 500 }}>
                    Telegram Group/Channel Link (optional)
                </label>
                <input
                    type="url"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                    placeholder="https://t.me/yourgroup"
                    style={{
                        ...inputStyle,
                        padding: '8px 0',
                    }}
                />
                <div style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>
                    📱 Add your Telegram group or channel link for readers to join
                </div>
            </div>

            {/* Image Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                    ...cardStyle,
                    padding: isMobile ? '24px 16px' : '40px 24px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    borderColor: dragOver ? '#d4a54a' : '#333',
                    background: dragOver ? 'rgba(212, 165, 74, 0.05)' : '#111',
                    transition: 'all 0.2s',
                }}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="image-upload"
                    disabled={uploading || images.length >= 4}
                />
                <label
                    htmlFor="image-upload"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: images.length >= 4 ? 'not-allowed' : 'pointer',
                        opacity: images.length >= 4 ? 0.5 : 1,
                    }}
                >
                    {uploading ? (
                        <Loader2 style={{ width: '40px', height: '40px', color: '#d4a54a', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <ImagePlus style={{ width: '40px', height: '40px', color: '#d4a54a', marginBottom: '16px' }} />
                    )}
                    <span style={{ fontSize: '15px', color: '#888', fontWeight: 500 }}>
                        {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                        Max 4 images • PNG, JPG, GIF up to 5MB
                    </span>
                </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {images.map((url, index) => (
                        <div key={index} style={{ position: 'relative', aspectRatio: '1/1' }}>
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    border: '1px solid #222',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#fff',
                                }}
                            >
                                <X style={{ width: '16px', height: '16px' }} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting || !title.trim() || (!content.trim() && images.length === 0)}
                style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: (submitting || !title.trim() || (!content.trim() && images.length === 0))
                        ? '#333'
                        : 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    color: (submitting || !title.trim() || (!content.trim() && images.length === 0)) ? '#666' : '#000',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: (submitting || !title.trim() || (!content.trim() && images.length === 0)) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                }}
            >
                {submitting ? (
                    <>
                        <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                        Publishing...
                    </>
                ) : (
                    <>
                        <Send style={{ width: '20px', height: '20px' }} />
                        Publish Story
                    </>
                )}
            </button>
        </form>
    );
}
