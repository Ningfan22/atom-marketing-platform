interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export function SidebarDocIcon({
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="3" y="2.75" width="11" height="14.5" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
      <path d="M6.25 7H10.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M6.25 10H10.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M6.25 13H9.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M14.75 11.75V17.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M12 14.5H17.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function ResourceGlyph({
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 2.5L15.75 5.75V12.25L10 15.5L4.25 12.25V5.75L10 2.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M10 8.25L15.25 5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10 8.25L4.75 5.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M10 8.5V15.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function CapCutGlyph({
  size = 14,
  color = 'currentColor',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M2.25 3.5H11.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M2.25 10.5H11.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M3 10.25L11 3.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M3 3.75L11 10.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function CollapseGlyph({
  size = 18,
  color = 'currentColor',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2.25" y="2.25" width="13.5" height="13.5" rx="3" stroke={color} strokeWidth={strokeWidth} />
      <path d="M11.25 4.75V13.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8.5 9L6.25 6.75" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M8.5 9L6.25 11.25" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}
