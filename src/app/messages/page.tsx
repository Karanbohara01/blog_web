'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Send, ImagePlus, Search, ArrowLeft, MessageSquarePlus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
    _id: string;
    participants: any[];
    otherParticipant: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    unreadCount: number;
    lastMessageAt: string;
}

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    content: string;
    attachments: { type: string; url: string }[];
    createdAt: string;
}

function MessagesPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const userIdParam = searchParams?.get('user');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingRecipient, setPendingRecipient] = useState<any>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreivews, setImagePreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/messages');
        }
    }, [status, router]);

    // Fetch conversations on load
    useEffect(() => {
        if (session?.user?.id) {
            fetchConversations();
        }
    }, [session]);

    // Handle user param to start new conversation
    useEffect(() => {
        const initConversation = async () => {
            if (userIdParam && session?.user?.id && userIdParam !== session.user.id) {
                const existingConv = conversations.find(
                    c => c.otherParticipant?._id === userIdParam
                );

                if (existingConv) {
                    setSelectedConversation(existingConv);
                    setShowMobileList(false);
                } else {
                    try {
                        const res = await fetch(`/api/users/${userIdParam}`);
                        const data = await res.json();
                        if (data.user) {
                            setPendingRecipient(data.user);
                            setShowMobileList(false);
                        }
                    } catch (error) {
                        console.error('Failed to fetch user');
                    }
                }
            }
        };

        if (!loading && conversations.length >= 0) {
            initConversation();
        }
    }, [userIdParam, session, conversations, loading]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch messages when conversation selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            setPendingRecipient(null);
        }
    }, [selectedConversation]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            const data = await res.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Failed to fetch conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`/api/messages/${conversationId}`);
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages');
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 4 images
        const newFiles = files.slice(0, 4 - selectedImages.length);
        setSelectedImages(prev => [...prev, ...newFiles]);

        // Create previews
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        if (selectedImages.length === 0) return [];

        setUploading(true);
        try {
            const formData = new FormData();
            selectedImages.forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            return data.urls || [];
        } catch (error) {
            console.error('Failed to upload images');
            return [];
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && selectedImages.length === 0) || sending) return;
        if (!selectedConversation && !pendingRecipient) return;

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Upload images if any
        let attachments: { type: string; url: string }[] = [];
        if (selectedImages.length > 0) {
            const urls = await uploadImages();
            attachments = urls.map(url => ({ type: 'image', url }));
        }

        // Clear image selections
        setSelectedImages([]);
        setImagePreviews([]);

        // Optimistic update
        const tempMessage: Message = {
            _id: Date.now().toString(),
            sender: {
                _id: session?.user?.id || '',
                name: session?.user?.name || '',
                username: (session?.user as any)?.username || '',
                avatar: session?.user?.image || undefined,
            },
            content,
            attachments,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            if (selectedConversation) {
                const res = await fetch(`/api/messages/${selectedConversation._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, attachments }),
                });

                if (res.ok) {
                    fetchConversations();
                }
            } else if (pendingRecipient) {
                const res = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipientId: pendingRecipient._id,
                        content,
                        attachments,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    await fetchConversations();

                    const newConv = {
                        ...data.conversation,
                        otherParticipant: pendingRecipient,
                        unreadCount: 0,
                        lastMessageAt: new Date().toISOString(),
                    };
                    setSelectedConversation(newConv);
                    setPendingRecipient(null);
                    router.replace('/messages');
                }
            }
        } catch (error) {
            console.error('Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
        } finally {
            setSending(false);
        }
    };

    // Avatar component
    const Avatar = ({ user, size = 48 }: { user: { name?: string; avatar?: string }; size?: number }) => {
        if (user?.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                    }}
                />
            );
        }
        return (
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 600,
                fontSize: `${size * 0.4}px`,
                flexShrink: 0,
            }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
        );
    };

    // Styles
    const cardStyle = {
        background: '#111',
        border: '1px solid #222',
        borderRadius: '16px',
    };

    // Get recipient for display
    const displayRecipient = selectedConversation?.otherParticipant || pendingRecipient;

    if (status === 'loading' || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#d4a54a', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', height: 'calc(100vh - 100px)' }}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
            />

            <div style={{ ...cardStyle, height: '100%', display: 'flex', overflow: 'hidden' }}>
                {/* Conversation List */}
                <div style={{
                    width: '320px',
                    borderRight: '1px solid #222',
                    display: showMobileList ? 'flex' : 'none',
                    flexDirection: 'column',
                    flexShrink: 0,
                }} className="md:!flex">
                    {/* Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid #222' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Messages</h2>
                    </div>

                    {/* Search */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #222' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '18px',
                                height: '18px',
                                color: '#555',
                            }} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 42px',
                                    background: '#0a0a0a',
                                    border: '1px solid #222',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* Conversations */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {conversations.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto 16px',
                                    borderRadius: '50%',
                                    background: 'rgba(212, 165, 74, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <MessageSquarePlus style={{ width: '28px', height: '28px', color: '#d4a54a' }} />
                                </div>
                                <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>No conversations yet</p>
                                <p style={{ color: '#555', fontSize: '13px' }}>Start a conversation from someone's profile</p>
                            </div>
                        ) : (
                            conversations
                                .filter(conv =>
                                    !searchQuery ||
                                    conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    conv.otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(conv => (
                                    <button
                                        key={conv._id}
                                        onClick={() => {
                                            setSelectedConversation(conv);
                                            setPendingRecipient(null);
                                            setShowMobileList(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            textAlign: 'left',
                                            background: selectedConversation?._id === conv._id ? 'rgba(212, 165, 74, 0.1)' : 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid #1a1a1a',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <Avatar user={conv.otherParticipant} size={48} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>
                                                    {conv.otherParticipant?.name}
                                                </span>
                                                {conv.lastMessageAt && (
                                                    <span style={{ fontSize: '11px', color: '#555' }}>
                                                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '4px 0 0' }}>
                                                {conv.lastMessage?.content || 'Start a conversation'}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span style={{
                                                minWidth: '20px',
                                                height: '20px',
                                                padding: '0 6px',
                                                background: 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                color: '#000',
                                            }}>
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div style={{
                    flex: 1,
                    display: !showMobileList || (displayRecipient || selectedConversation) ? 'flex' : 'none',
                    flexDirection: 'column',
                }} className="md:!flex">
                    {displayRecipient ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowMobileList(true);
                                        setSelectedConversation(null);
                                        setPendingRecipient(null);
                                        router.replace('/messages');
                                    }}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#888',
                                        display: 'none',
                                    }}
                                    className="md:!hidden"
                                >
                                    <ArrowLeft style={{ width: '20px', height: '20px' }} />
                                </button>
                                <Avatar user={displayRecipient} size={44} />
                                <div>
                                    <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '16px', margin: 0 }}>{displayRecipient.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>@{displayRecipient.username}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {messages.length === 0 && pendingRecipient && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <p style={{ color: '#666', fontSize: '14px' }}>
                                            Start a conversation with {pendingRecipient.name}
                                        </p>
                                    </div>
                                )}
                                {messages.map(message => {
                                    const isOwn = message.sender._id === session?.user?.id;
                                    return (
                                        <div
                                            key={message._id}
                                            style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
                                        >
                                            <div style={{ maxWidth: '70%' }}>
                                                {/* Image attachments */}
                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: message.attachments.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                                        gap: '4px',
                                                        marginBottom: message.content ? '8px' : 0,
                                                        borderRadius: '12px',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {message.attachments.map((att, i) => (
                                                            <img
                                                                key={i}
                                                                src={att.url}
                                                                alt="Attachment"
                                                                style={{ width: '100%', maxWidth: '300px', borderRadius: '8px' }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                {message.content && (
                                                    <div
                                                        style={{
                                                            padding: '12px 16px',
                                                            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                            background: isOwn ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' : '#1a1a1a',
                                                            color: isOwn ? '#000' : '#fff',
                                                        }}
                                                    >
                                                        <p style={{ fontSize: '15px', lineHeight: '1.5', margin: 0 }}>{message.content}</p>
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '11px', color: '#555', marginTop: '6px', textAlign: isOwn ? 'right' : 'left' }}>
                                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Image Previews */}
                            {imagePreivews.length > 0 && (
                                <div style={{ padding: '12px 20px', borderTop: '1px solid #222', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {imagePreivews.map((preview, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    background: '#f87171',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                }}
                                            >
                                                <X style={{ width: '14px', height: '14px' }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid #222' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={selectedImages.length >= 4}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: selectedImages.length >= 4 ? 'not-allowed' : 'pointer',
                                            color: selectedImages.length >= 4 ? '#444' : '#d4a54a',
                                        }}
                                    >
                                        <ImagePlus style={{ width: '22px', height: '22px' }} />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        style={{
                                            flex: 1,
                                            padding: '14px 16px',
                                            background: '#0a0a0a',
                                            border: '1px solid #222',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: '15px',
                                            outline: 'none',
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && selectedImages.length === 0) || sending || uploading}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: (newMessage.trim() || selectedImages.length > 0) ? 'linear-gradient(135deg, #d4a54a 0%, #ff6b35 100%)' : '#333',
                                            border: 'none',
                                            cursor: (newMessage.trim() || selectedImages.length > 0) ? 'pointer' : 'not-allowed',
                                            color: (newMessage.trim() || selectedImages.length > 0) ? '#000' : '#666',
                                        }}
                                    >
                                        {(sending || uploading) ? (
                                            <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Send style={{ width: '20px', height: '20px' }} />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}>
                            <div>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 20px',
                                    borderRadius: '50%',
                                    background: 'rgba(212, 165, 74, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Send style={{ width: '36px', height: '36px', color: '#d4a54a' }} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Your Messages</h3>
                                <p style={{ color: '#666', fontSize: '14px' }}>Select a conversation or start a new one from someone's profile</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#d4a54a' }} />
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    );
}
