'use client';

import { useResponsive } from '@/hooks/useResponsive';

export default function SideAds() {
    // Only show on very large screens where there is space
    // 160px width * 2 + content width (~1100px) + margins

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
