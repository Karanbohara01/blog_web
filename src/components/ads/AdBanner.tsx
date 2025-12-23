'use client';

import { useResponsive } from '@/hooks/useResponsive';

export default function AdBanner() {
    const { isMobile } = useResponsive();

    // 728x90 is too wide for mobile devices
    if (isMobile) {
        return null;
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0',
            width: '100%',
            overflow: 'hidden'
        }}>
            <iframe
                src="/ads/banner_728x90.html"
                width="728"
                height="90"
                style={{
                    border: 'none',
                    overflow: 'hidden',
                    maxWidth: '100%'
                }}
                title="Advertisement"
                scrolling="no"
            />
        </div>
    );
}
