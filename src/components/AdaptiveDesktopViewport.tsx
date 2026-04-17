import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DESKTOP_CONTENT_WIDTH, useDesktopLayout } from '../context/DesktopLayoutContext'

interface ViewportSize {
  width: number
  height: number
}

function readViewportSize(element: HTMLDivElement | null): ViewportSize {
  if (!element) {
    return { width: DESKTOP_CONTENT_WIDTH, height: 0 }
  }

  return {
    width: element.clientWidth,
    height: element.clientHeight,
  }
}

export default function AdaptiveDesktopViewport({ children }: { children: ReactNode }) {
  const { isCompactDesktop } = useDesktopLayout()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: DESKTOP_CONTENT_WIDTH, height: 0 })

  useEffect(() => {
    const element = viewportRef.current
    if (!element) {
      return
    }

    const updateSize = () => setViewportSize(readViewportSize(element))

    updateSize()

    const observer = new ResizeObserver(() => updateSize())
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const scale = useMemo(() => {
    if (isCompactDesktop || viewportSize.width <= 0) {
      return 1
    }

    return Math.min(1, viewportSize.width / DESKTOP_CONTENT_WIDTH)
  }, [isCompactDesktop, viewportSize.width])

  const scaledContentHeight = useMemo(() => {
    if (viewportSize.height <= 0 || scale <= 0) {
      return undefined
    }

    return viewportSize.height / scale
  }, [scale, viewportSize.height])

  return (
    <div ref={viewportRef} className="h-full overflow-hidden">
      {isCompactDesktop ? (
        <div className="h-full">{children}</div>
      ) : (
        <div className="flex h-full items-start justify-center overflow-hidden">
          <div
            className="flex-shrink-0"
            style={{
              width: `${DESKTOP_CONTENT_WIDTH}px`,
              height: scaledContentHeight ? `${scaledContentHeight}px` : '100%',
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
