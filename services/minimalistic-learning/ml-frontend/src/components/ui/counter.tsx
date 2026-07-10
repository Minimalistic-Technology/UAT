"use client";

import React, { useEffect, useState, useRef } from "react";

export function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.1 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        let cur = 0;
        const step = Math.ceil(target / 40);
        const t = setInterval(() => {
            cur += step;
            if (cur >= target) {
                setCount(target);
                clearInterval(t);
            } else {
                setCount(cur);
            }
        }, 30);
        return () => clearInterval(t);
    }, [visible, target]);

    return (
        <span ref={ref} className="tabular-nums">
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}
