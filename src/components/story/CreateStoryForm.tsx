'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2, Send } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

export default function CreateStoryForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    content: content.trim(),
                    images,
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

    const maxLength = 10000;

    // Shared styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
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

            {/* Content Textarea */}
            <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px' }}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell your story..."
                    maxLength={maxLength}
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '16px',
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
                        color: content.length > maxLength * 0.9 ? '#ff6b35' : '#555',
                    }}>
                        {content.length.toLocaleString()}/{maxLength.toLocaleString()}
                    </span>
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
                disabled={submitting || (!content.trim() && images.length === 0)}
                style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: (submitting || (!content.trim() && images.length === 0))
                        ? '#333'
                        : 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                    color: (submitting || (!content.trim() && images.length === 0)) ? '#666' : '#000',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: (submitting || (!content.trim() && images.length === 0)) ? 'not-allowed' : 'pointer',
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
