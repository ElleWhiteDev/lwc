import { useCallback, useEffect, useState } from "react";
import "./Countdown.css";

const TARGET_DATE = new Date(2026, 9, 3, 14, 0, 0); // October 3, 2026, 2:00 PM
const EVENT_NAME = "Winchester Pride and Inclusion Festival";

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

const Countdown = ({ photos = [] }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const carouselPrev = useCallback(() => {
    setCarouselIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  }, [photos.length]);

  const carouselNext = useCallback(() => {
    setCarouselIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
  }, [photos.length]);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(carouselNext, 4000);
    return () => clearInterval(id);
  }, [photos.length, carouselNext]);

  const readableCountdown = timeLeft
    ? `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, and ${timeLeft.seconds} seconds until the ${EVENT_NAME} on October 3, 2026`
    : `Today is the day! The ${EVENT_NAME} is here!`;

  return (
    <section className="countdown-section section" aria-labelledby="countdown-heading">
      <div className="container">
        <div className="countdown-card">
          <p className="countdown-eyebrow" aria-hidden="true">
            🌈 Save the Date 🌈
          </p>
          <h2 id="countdown-heading" className="countdown-title">
            Countdown to the
            <br />
            <span>{EVENT_NAME}</span>
          </h2>
          <p className="countdown-date">October 3, 2026</p>

          <p className="visually-hidden">{readableCountdown}</p>

          {timeLeft ? (
            <div className="countdown-timer" aria-hidden="true">
              {UNITS.map(({ key, label }) => (
                <div key={key} className={`countdown-unit countdown-unit-${key}`}>
                  <span className="countdown-number">{String(timeLeft[key]).padStart(2, "0")}</span>
                  <span className="countdown-label">{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="countdown-arrived" aria-hidden="true">
              🎉 It&apos;s Festival Day! 🎉
            </p>
          )}

          {photos.length > 0 ? (
            <section className="photo-carousel countdown-carousel" aria-label="Festival photo carousel">
              <div className="carousel-track">
                <img
                  key={photos[carouselIndex]}
                  src={photos[carouselIndex]}
                  alt={`${EVENT_NAME} — ${carouselIndex + 1} of ${photos.length}`}
                  className="carousel-image"
                />
                {photos.length > 1 && (
                  <>
                    <button className="carousel-btn carousel-btn-prev" onClick={carouselPrev} aria-label="Previous photo">&#8249;</button>
                    <button className="carousel-btn carousel-btn-next" onClick={carouselNext} aria-label="Next photo">&#8250;</button>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="carousel-dots" role="tablist" aria-label="Photo navigation">
                  {photos.map((url, i) => (
                    <button
                      key={url}
                      className={`carousel-dot${i === carouselIndex ? " active" : ""}`}
                      onClick={() => setCarouselIndex(i)}
                      role="tab"
                      aria-selected={i === carouselIndex}
                      aria-label={`Go to photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <div className="photo-carousel countdown-carousel">
              <output className="carousel-placeholder" aria-label="Photo gallery placeholder">
                <span aria-hidden="true">📸</span>
                <p>Photo Gallery Coming Soon</p>
              </output>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Countdown;
