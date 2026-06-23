export default function LogoMark() {
  return (
    <svg viewBox="0 0 48 48" className="logo-svg" aria-label="7S" role="img">
      <text
        x="24"
        y="35"
        textAnchor="middle"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700,
          fontSize: 30,
          fill: 'var(--gold)',
          letterSpacing: '-0.5px',
        }}
      >
        7S
      </text>
    </svg>
  )
}
