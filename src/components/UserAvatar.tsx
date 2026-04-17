interface UserAvatarProps {
  size?: number
}

export default function UserAvatar({ size = 34 }: UserAvatarProps) {
  const headSize = Math.round(size * 0.3)
  const bodyWidth = Math.round(size * 0.48)
  const bodyHeight = Math.round(size * 0.28)

  return (
    <div
      className="relative overflow-hidden rounded-full bg-[#f5de39] flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute rounded-full bg-[#171923]"
        style={{
          width: headSize,
          height: headSize,
          left: `calc(50% - ${headSize / 2}px)`,
          top: Math.round(size * 0.16),
        }}
      />
      <div
        className="absolute rounded-t-full bg-[#171923]"
        style={{
          width: bodyWidth,
          height: bodyHeight,
          left: `calc(50% - ${bodyWidth / 2}px)`,
          bottom: Math.round(size * 0.12),
        }}
      />
    </div>
  )
}
