interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export default function Logo({ size = 20, showText = false, className = '' }: LogoProps) {
  const textSize = size * 0.72
  const gap = size * 0.35

  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Terminal window shape */}
        <rect
          x="1.5"
          y="1.5"
          width="21"
          height="21"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Title bar line */}
        <line
          x1="1.5"
          y1="6.5"
          x2="22.5"
          y2="6.5"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.25"
        />
        {/* Title bar dots */}
        <circle cx="5" cy="4" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="8" cy="4" r="1" fill="currentColor" opacity="0.35" />
        {/* Checkmark - test passed */}
        <polyline
          points="7,13 10.5,16.5 17,10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: 'var(--accent)' }}>mcp</span>
          <span style={{ color: 'var(--text-dim)' }}>-test</span>
        </span>
      )}
    </span>
  )
}
