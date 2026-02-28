import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import "./ComingSoon.css";
import LWCHomeBackground from "../assets/images/LWCHomeBackground.svg";

const ComingSoon = () => {
  const [stars, setStars] = useState([]);
  const heroImageRef = useRef(null);

  const createStarBurst = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create 12 stars that shoot out in different directions
    const newStars = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30 * Math.PI) / 180; // Spread evenly in a circle
      const velocity = 2 + Math.random() * 2; // Random velocity
      const size = 8 + Math.random() * 8; // Random size between 8-16px

      return {
        id: Date.now() + i,
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2, // Bias upward
        size,
        rotation: Math.random() * 360,
        color: [
          "#E40303",
          "#FF8C00",
          "#FFED00",
          "#008026",
          "#24408E",
          "#732982",
        ][Math.floor(Math.random() * 6)], // Pride colors
      };
    });

    setStars((prev) => [...prev, ...newStars]);

    // Remove stars after animation
    setTimeout(() => {
      setStars((prev) => prev.filter((star) => !newStars.includes(star)));
    }, 1500);
  };

  // Handle touch separately so we can prevent the default tap highlight
  // while still triggering the same starburst effect.
  const createStarBurstFromTouch = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (!e.touches || e.touches.length === 0) return;

    const touch = e.touches[0];
    createStarBurst({
      currentTarget: e.currentTarget,
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  };

  return (
    <div className="coming-soon">
      {/* Hero Section */}
      <section
        className="coming-soon-hero"
        style={{ backgroundImage: `url(${LWCHomeBackground})` }}
        aria-labelledby="coming-soon-title"
      >
        <div className="container coming-soon-container">
          <div className="coming-soon-content">
            <h1 id="coming-soon-title" className="coming-soon-title">
              <span className="title-block">A Life Worth</span>
              <span className="title-script" aria-label="Celebrating">
                <span aria-hidden="true">
                  <span className="letter-C">C</span>
                  <span className="letter-e1">e</span>
                  <span className="letter-l">l</span>
                  <span className="letter-e2">e</span>
                  <span className="letter-b">b</span>
                  <span className="letter-r">r</span>
                  <span className="letter-a">a</span>
                  <span className="letter-t">t</span>
                  <span className="letter-i">i</span>
                  <span className="letter-n">n</span>
                  <span className="letter-g">g</span>
                </span>
              </span>
            </h1>
            <p className="coming-soon-subtitle">
              Our new website is launching soon! We're creating an even better experience to celebrate our vibrant community.
            </p>
            <div className="coming-soon-message">
              <h2>Coming Soon</h2>
              <p>Stay tuned for something special!</p>
            </div>
            <div className="coming-soon-buttons">
              <Link to="/preview" className="btn btn-rainbow">
                Preview Site
              </Link>
            </div>
          </div>
          <div
            className="coming-soon-image"
            ref={heroImageRef}
            onClick={createStarBurst}
            onTouchStart={createStarBurstFromTouch}
            role="img"
            aria-label="Decorative celebration graphic - click or tap to create colorful stars"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                createStarBurst(e);
              }
            }}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {stars.map((star) => (
              <div
                key={star.id}
                className="star-particle"
                aria-hidden="true"
                style={{
                  left: `${star.x}px`,
                  top: `${star.y}px`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  "--vx": star.vx,
                  "--vy": star.vy,
                  "--rotation": `${star.rotation}deg`,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComingSoon;

