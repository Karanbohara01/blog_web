'use client';

import React, { useEffect, useState } from 'react';

export default function AdBanner() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="w-full flex justify-center my-8">
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
                    height="300" // Adjustable height for 1:4 layout
                    style={{ border: 'none', overflow: 'hidden', minHeight: '300px' }}
                    title="Advertisement"
                />
            </div>
        </div>
    );
}
