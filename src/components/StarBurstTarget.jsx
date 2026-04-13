import { useStarBurst } from "../hooks/useStarBurst";

/**
 * A clickable/tappable zone that spawns pride-colored star particles on interaction.
 * Accepts all standard div props plus className; star particles are layered inside.
 */
const StarBurstTarget = ({ className, children, ...props }) => {
  const { stars, onClick, onTouchStart, onKeyDown } = useStarBurst();

  return (
    <div
      className={className}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onKeyDown={onKeyDown}
      role="img"
      aria-label="Decorative celebration graphic - click or tap to create colorful stars"
      tabIndex={0}
      style={{ cursor: "pointer", position: "relative" }}
      {...props}
    >
      {children}
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
  );
};

export default StarBurstTarget;
