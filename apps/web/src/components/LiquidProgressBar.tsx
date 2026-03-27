import { useEffect, useRef } from "react";
import "./LiquidProgressBar.css";

type Props = {
  value: number; // 0〜100
};

export function LiquidProgressBar({ value }: Props) {
  const bubblesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = bubblesRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const bubble = document.createElement("div");
      const size = 4 + Math.random() * 8;
      const left = 5 + Math.random() * 85;
      const dur = 1.4 + Math.random() * 1.8;

      bubble.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.55);
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        bottom: 0;
        animation: bubbleRise ${dur}s linear forwards;
        pointer-events: none;
      `;

      container.appendChild(bubble);
      setTimeout(() => bubble.remove(), dur * 1000 + 100);
    }, 350);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lp-outer">
      <div className="lp-fill" style={{ width: `${value}%` }}>
        <div className="lp-wave" />
        <div className="lp-wave lp-wave--2" />
        <div ref={bubblesRef} className="lp-bubbles" />
        <div className="lp-shine" />
      </div>
      <div className="lp-glow" />
    </div>
  );
}