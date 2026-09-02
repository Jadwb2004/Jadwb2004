import { Star } from 'lucide-react'

export function Stars({
  rating,
  count,
  className = '',
  size = 14,
}: {
  rating: number
  count?: number
  className?: string
  size?: number
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating)
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              strokeWidth={1.25}
              className={filled ? 'fill-gold text-gold' : 'fill-transparent text-border'}
            />
          )
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">({count.toLocaleString()})</span>
      )}
    </div>
  )
}
