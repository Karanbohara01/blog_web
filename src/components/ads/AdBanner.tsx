'use client';

import React, { useEffect, useState } from 'react';

export default function AdBanner() {
    const [mounted, setMounted] = useState(false);
    const isDev = process.env.NODE_ENV === 'development';

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Show placeholder in development
    if (isDev) {
        return (
            <div className="w-full flex justify-center mb-6">
                {/* Desktop Placeholder */}
                <div className="hidden md:flex" style={{
                    width: '728px',
                    height: '90px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px dashed #333',
                    borderRadius: '8px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#555',
                    fontSize: '14px',
                }}>
                    📢 Ad Banner (728x90) - Shows on Production
                </div>

                {/* Mobile Placeholder */}
                <div className="flex md:hidden w-full px-4">
                    <div style={{
                        width: '100%',
                        height: '250px',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        border: '1px dashed #333',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#555',
                        fontSize: '14px',
                    }}>
                        📢 Native Ad - Shows on Production
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center mb-6">
            {/* Desktop Ad (728x90) - Hidden on mobile */}
            <div className="hidden md:block">
                <iframe
                    src="/ads/banner_728x90.html"
                    width="730"
                    height="92"
                    style={{ border: 'none', overflow: 'hidden' }}
                    title="Advertisement"
                />
            </div>

            {/* Mobile Ad (Native Banner) - Hidden on desktop */}
            <div className="block md:hidden w-full px-4">
                <iframe
                    src="/ads/native_banner.html"
                    width="100%"
                    height="300"
                    style={{ border: 'none', overflow: 'hidden', minHeight: '300px' }}
                    title="Advertisement"
                />
            </div>
        </div>
    );
}
