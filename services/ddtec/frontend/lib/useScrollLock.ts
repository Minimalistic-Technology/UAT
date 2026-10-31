"use client";

import { useEffect } from "react";

let activeLocks = 0;
let originalOverflow = "";
let originalPaddingRight = "";

/**
 * Custom hook to lock scrolling of document.body when `isLocked` is true.
 * Automatically restores previous overflow and padding styles when unmounted or unlocked.
 * Prevents layout shift by compensating for the scrollbar width.
 */
export function useScrollLock(isLocked: boolean = true) {
    useEffect(() => {
        if (!isLocked) return;
        if (typeof document === "undefined") return;

        if (activeLocks === 0) {
            originalOverflow = document.body.style.overflow;
            originalPaddingRight = document.body.style.paddingRight;

            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

            document.body.style.overflow = "hidden";
            if (scrollBarWidth > 0) {
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
        }
        activeLocks++;

        return () => {
            activeLocks = Math.max(0, activeLocks - 1);
            if (activeLocks === 0) {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
            }
        };
    }, [isLocked]);
}
