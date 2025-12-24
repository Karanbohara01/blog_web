'use client';

import { useResponsive } from '@/hooks/useResponsive';

export default function SideAds() {
    // DISABLED: Set to false to re-enable sidebar ads
    const SIDEBAR_ADS_DISABLED = true;
    if (SIDEBAR_ADS_DISABLED) return null;

    const isDev = process.env.NODE_ENV === 'development';

    // Development placeholder style
    const placeholderStyle = {
        width: '160px',
        height: '600px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px dashed #333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
        fontSize: '12px',
        textAlign: 'center' as const,
        padding: '10px',
    };

    if (isDev) {
        return (
            <>
                {/* Left Placeholder */}
                <div className="hidden 2xl:block" style={{
                    position: 'fixed',
                    left: '20px',
                    top: '100px',
                    zIndex: 40
                }}>
                    <div style={placeholderStyle}>
                        📢<br />Side Ad<br />160x600<br /><br /><span style={{ fontSize: '10px' }}>Shows on Production</span>
                    </div>
                </div>

                {/* Right Placeholder */}
                <div className="hidden 2xl:block" style={{
                    position: 'fixed',
                    right: '20px',
                    top: '100px',
                    zIndex: 40
                }}>
                    <div style={placeholderStyle}>
                        📢<br />Side Ad<br />160x600<br /><br /><span style={{ fontSize: '10px' }}>Shows on Production</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Left Skyscraper */}
            <div className="hidden 2xl:block" style={{
                position: 'fixed',
                left: '20px',
                top: '100px',
                width: '160px',
                height: '600px',
                zIndex: 40
            }}>
                <iframe
                    src="/ads/banner_160x600.html"
                    width="160"
                    height="600"
                    style={{ border: 'none', overflow: 'hidden' }}
                    title="Advertisement Left"
                    scrolling="no"
                />
            </div>

            {/* Right Skyscraper */}
            <div className="hidden 2xl:block" style={{
                position: 'fixed',
                right: '20px',
                top: '100px',
                width: '160px',
                height: '600px',
                zIndex: 40
            }}>
                <iframe
                    src="/ads/banner_160x600.html"
                    width="160"
                    height="600"
                    style={{ border: 'none', overflow: 'hidden' }}
                    title="Advertisement Right"
                    scrolling="no"
                />
            </div>
        </>
    );
}
