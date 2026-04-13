import { useState } from "react";

const PRIDE_COLORS = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"];

/**
 * Spawns pride-colored star particles at a click/touch/keyboard position.
 * Returns { stars, onClick, onTouchStart, onKeyDown } to spread onto the target element.
 */
export function useStarBurst() {
  const [stars, setStars] = useState([]);

  function burst(containerEl, clientX, clientY) {
    const rect = containerEl.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newStars = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 * Math.PI) / 180; // evenly spaced around a circle
      const velocity = 2 + Math.random() * 2;
      return {
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2, // bias upward
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        color: PRIDE_COLORS[Math.floor(Math.random() * PRIDE_COLORS.length)],
      };
    });

    setStars((prev) => [...prev, ...newStars]);
    setTimeout(
      () => setStars((prev) => prev.filter((s) => !newStars.includes(s))),
      1500
    );
  }

  function onClick(e) {
    burst(e.currentTarget, e.clientX, e.clientY);
  }

  function onTouchStart(e) {
    if (e.cancelable) e.preventDefault();
    if (!e.touches?.length) return;
    burst(e.currentTarget, e.touches[0].clientX, e.touches[0].clientY);
  }

  function onKeyDown(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    // Fire from the center of the element when activated via keyboard
    const rect = e.currentTarget.getBoundingClientRect();
    burst(e.currentTarget, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  return { stars, onClick, onTouchStart, onKeyDown };
}
