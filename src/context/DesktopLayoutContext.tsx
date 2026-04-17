import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export const DESKTOP_CONTENT_WIDTH = 1260
export const DESKTOP_SCALE_FALLBACK_THRESHOLD = 0.9
export const SIDEBAR_WIDTH = 312
export const SIDEBAR_COMPACT_WIDTH = 280
export const DESKTOP_SHELL_WIDTH = SIDEBAR_WIDTH + DESKTOP_CONTENT_WIDTH
export const COMPACT_DESKTOP_BREAKPOINT =
  SIDEBAR_WIDTH + DESKTOP_CONTENT_WIDTH * DESKTOP_SCALE_FALLBACK_THRESHOLD

interface DesktopLayoutContextValue {
  isEmbeddedInIframe: boolean
  isCompactDesktop: boolean
  sidebarWidth: number
}

const DesktopLayoutContext = createContext<DesktopLayoutContextValue | null>(null)

function getIsCompactDesktop(viewportWidth: number) {
  return viewportWidth < COMPACT_DESKTOP_BREAKPOINT
}

function getIsEmbeddedInIframe() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

export function DesktopLayoutProvider({ children }: { children: ReactNode }) {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? COMPACT_DESKTOP_BREAKPOINT : window.innerWidth,
  )
  const [isEmbeddedInIframe, setIsEmbeddedInIframe] = useState(getIsEmbeddedInIframe)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
      setIsEmbeddedInIframe(getIsEmbeddedInIframe())
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const value = useMemo<DesktopLayoutContextValue>(() => {
    const isCompactDesktop = isEmbeddedInIframe ? false : getIsCompactDesktop(viewportWidth)

    return {
      isEmbeddedInIframe,
      isCompactDesktop,
      sidebarWidth: isCompactDesktop ? SIDEBAR_COMPACT_WIDTH : SIDEBAR_WIDTH,
    }
  }, [isEmbeddedInIframe, viewportWidth])

  return <DesktopLayoutContext.Provider value={value}>{children}</DesktopLayoutContext.Provider>
}

export function useDesktopLayout() {
  const context = useContext(DesktopLayoutContext)

  if (!context) {
    throw new Error('useDesktopLayout must be used within DesktopLayoutProvider')
  }

  return context
}

export function useDesktopShellClasses() {
  const { isCompactDesktop } = useDesktopLayout()

  return useMemo(
    () => ({
      isCompactDesktop,
      rootMinWidthClass: isCompactDesktop ? 'min-w-0' : 'min-w-[1120px]',
      widePagePaddingClass: isCompactDesktop ? 'px-[24px]' : 'px-[40px]',
      mediumPagePaddingClass: isCompactDesktop ? 'px-[24px]' : 'px-[32px]',
      widePageMaxWidthClass: isCompactDesktop ? 'max-w-full' : 'max-w-[1180px]',
      messagePagePaddingClass: isCompactDesktop ? 'px-[24px]' : 'px-[36px]',
      messagePageMaxWidthClass: isCompactDesktop ? 'max-w-full' : 'max-w-[1080px]',
    }),
    [isCompactDesktop],
  )
}
