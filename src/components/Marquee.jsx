export default function Marquee({ text, speed = 42 }) {
  const items = new Array(8).fill(text);
  return (
    <div className="marquee">
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {items.map((t, i) => (
          <span className="marquee__item" key={i}>
            {t}
          </span>
        ))}
        {items.map((t, i) => (
          <span className="marquee__item" key={`dup-${i}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
