import { ArrowUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function FloatingConciergeComposer() {
  const location = useLocation()
  const navigate = useNavigate()
  const laneRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [laneWidth, setLaneWidth] = useState(0)
  const isHome = location.pathname === '/'
  const [isExpanded, setIsExpanded] = useState(isHome)

  const collapsedSize = 56

  useEffect(() => {
    if (!laneRef.current) {
      return
    }

    const updateWidth = () => {
      setLaneWidth(laneRef.current?.clientWidth ?? 0)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(laneRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setIsExpanded(isHome)
  }, [isHome, location.pathname])

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus()
    }
  }, [isExpanded])

  useEffect(() => {
    if (isHome || !isExpanded) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (composerRef.current?.contains(event.target as Node)) {
        return
      }
      setIsExpanded(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded, isHome])

  const submitComposer = () => {
    navigate('/ad-placement/new')
  }

  const expandedWidth = useMemo(() => {
    if (!laneWidth) {
      return 640
    }

    return Math.min(640, Math.max(320, laneWidth - 48))
  }, [laneWidth])

  const collapsedOffset = useMemo(() => {
    if (!laneWidth || isHome || isExpanded) {
      return 0
    }

    return laneWidth / 2 - 30 - collapsedSize / 2
  }, [collapsedSize, isExpanded, isHome, laneWidth])

  const frameWidth = isExpanded ? expandedWidth : collapsedSize
  const frameHeight = isExpanded ? 64 : collapsedSize

  return (
    <div ref={laneRef} className="pointer-events-none absolute inset-x-0 bottom-[30px] z-30 flex justify-center px-[24px]">
      <div
        ref={composerRef}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true)
          }
        }}
        className="panel-border pointer-events-auto relative overflow-hidden rounded-full bg-white transition-[width,height,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `translateX(${collapsedOffset}px)`,
          boxShadow: isExpanded
            ? '0 12px 32px rgba(15, 23, 42, 0.08)'
            : '0 12px 32px rgba(15, 23, 42, 0.14)',
        }}
      >
        <button
          type="button"
          aria-label="打开管家"
          onClick={() => setIsExpanded(true)}
          className={`absolute inset-0 flex items-center justify-center text-[22px] font-semibold text-[#0f1219] transition-all duration-200 ${
            isExpanded ? 'pointer-events-none scale-75 opacity-0' : 'opacity-100'
          }`}
        >
          C
        </button>

        <div
          className={`flex h-full items-center pl-[24px] pr-[10px] transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitComposer()
              }
            }}
            className="h-full flex-1 border-0 bg-transparent text-[16px] text-[#2d3340] caret-[#67ddff] outline-none placeholder:text-[#c0c6cf]"
            placeholder='输入问题或“/”指令创建任务'
          />
          <button
            type="button"
            onClick={submitComposer}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#0f1219] text-white"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
