'use client';

interface VideoEmbedProps {
    url: string;
}

// Extract video ID and create embed URL
function getEmbedUrl(url: string): string | null {
    // Clean up input
    url = url.trim();

    // Check if input is an iframe string or contains HTML and extract src
    if (url.includes('<iframe') || url.includes('<IFRAME') || (url.includes('src=') && url.includes('>'))) {
        const srcMatch = url.match(/src=["'](.*?)["']/);
        if (srcMatch) {
            url = srcMatch[1];
        } else {
            // If it looks like HTML but we couldn't extract src, return null to avoid breaking the UI
            return null;
        }
    }

    // YouTube patterns
    const youtubePatterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }

    // Vimeo pattern
    const vimeoPattern = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoPattern);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Pornhub pattern
    const pornhubPattern = /pornhub\.com\/view_video\.php\?viewkey=([a-zA-Z0-9]+)/;
    const pornhubMatch = url.match(pornhubPattern);
    if (pornhubMatch) {
        return `https://www.pornhub.com/embed/${pornhubMatch[1]}`;
    }

    // XVideos pattern
    const xvideosPattern = /xvideos\.com\/video(\d+)\//; // Matches /video12345/
    const xvideosMatch = url.match(xvideosPattern);
    if (xvideosMatch) {
        return `https://www.xvideos.com/embedframe/${xvideosMatch[1]}`;
    }

    // RedTube pattern
    const redtubePattern = /redtube\.com\/(\d+)/;
    const redtubeMatch = url.match(redtubePattern);
    if (redtubeMatch) {
        return `https://embed.redtube.com/?id=${redtubeMatch[1]}`;
    }

    // XNXX pattern
    const xnxxPattern = /xnxx\.com\/video-([a-zA-Z0-9]+)\//;
    const xnxxMatch = url.match(xnxxPattern);
    if (xnxxMatch) {
        return `https://www.xnxx.com/embedframe/${xnxxMatch[1]}`;
    }

    // SpankBang pattern
    const spankbangPattern = /spankbang\.com\/([a-zA-Z0-9]+)\/video\//;
    const spankbangMatch = url.match(spankbangPattern);
    if (spankbangMatch) {
        return `https://spankbang.com/${spankbangMatch[1]}/embed/`;
    }

    // Eporner pattern
    const epornerPattern = /eporner\.com\/(?:video\/|embed\/)([\w-]+)/;
    const epornerMatch = url.match(epornerPattern);
    if (epornerMatch) {
        return `https://www.eporner.com/embed/${epornerMatch[1]}/`;
    }

    // Check if the URL is already a valid embed URL from supported sites
    // IMPORTANT: Ensure it doesn't look like an HTML tag and starts with http
    const isSupportedDomain =
        url.includes('eporner.com/embed/') ||
        url.includes('pornhub.com/embed/') ||
        url.includes('xvideos.com/embedframe/') ||
        url.includes('embed.redtube.com/') ||
        url.includes('xnxx.com/embedframe/') ||
        (url.includes('spankbang.com/') && url.includes('/embed/')) ||
        url.includes('youtube.com/embed/') ||
        url.includes('player.vimeo.com/video/');

    if (isSupportedDomain && !url.includes('<') && !url.includes('>') && url.startsWith('http')) {
        return url;
    }

    return null;
}

export default function VideoEmbed({ url }: VideoEmbedProps) {
    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                color: '#666',
            }}>
                <p>⚠️ Invalid video URL</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#d4a54a' }}
                >
                    Open video link →
                </a>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#000',
                marginBottom: '8px',
            }}>
                <iframe
                    src={embedUrl}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Embedded video"
                />
            </div>
            <div style={{ textAlign: 'right' }}>
                <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize: '12px',
                        color: '#666',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    Link not working? <span style={{ color: '#d4a54a', textDecoration: 'underline' }}>Open video directly ↗</span>
                </a>
            </div>
        </div>
    );
}
