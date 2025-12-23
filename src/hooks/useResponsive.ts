'use client';

import { useState, useEffect } from 'react';

interface ResponsiveState {
    isMobile: boolean;      // < 640px
    isTablet: boolean;      // 640px - 1024px
    isDesktop: boolean;     // > 1024px
    width: number;
}

export function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setState({
                isMobile: width < 640,
                isTablet: width >= 640 && width < 1024,
                isDesktop: width >= 1024,
                width,
            });
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return state;
}
