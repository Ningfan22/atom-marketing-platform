import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ModalPortalProvider } from '../context/ModalPortalContext'
import { DESKTOP_SHELL_WIDTH, useDesktopLayout } from '../context/DesktopLayoutContext'

interface ShellMetrics {
  containerWidth: number
  shellHeight: number
}

function readShellMetrics(container: HTMLDivElement | null, shell: HTMLDivElement | null): ShellMetrics {
  return {
    containerWidth: container?.clientWidth || DESKTOP_SHELL_WIDTH,
    shellHeight: shell?.offsetHeight || 0,
  }
}

export default function IframeScaledShell({ children }: { children: ReactNode }) {
  const { isEmbeddedInIframe } = useDesktopLayout()
  const containerRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const portalHostRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<ShellMetrics>({
    containerWidth: DESKTOP_SHELL_WIDTH,
    shellHeight: 0,
  })
  const [modalPortalTarget] = useState<HTMLDivElement | null>(() => {
    if (typeof document === 'undefined') {
      return null
    }

    return document.createElement('div')
  })

  useEffect(() => {
    if (!isEmbeddedInIframe || !modalPortalTarget) {
      return
    }

    const host = portalHostRef.current
    if (!host) {
      return
    }

    host.appendChild(modalPortalTarget)

    return () => {
      if (host.contains(modalPortalTarget)) {
        host.removeChild(modalPortalTarget)
      }
    }
  }, [isEmbeddedInIframe, modalPortalTarget])

  useEffect(() => {
    if (!isEmbeddedInIframe) {
      return
    }

    const container = containerRef.current
    const shell = shellRef.current

    if (!container || !shell) {
      return
    }

    const updateMetrics = () => setMetrics(readShellMetrics(container, shell))

    updateMetrics()

    const observer = new ResizeObserver(() => updateMetrics())
    observer.observe(container)
    observer.observe(shell)
    window.addEventListener('resize', updateMetrics)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateMetrics)
    }
  }, [isEmbeddedInIframe])

  const scale = useMemo(() => {
    if (!isEmbeddedInIframe || metrics.containerWidth <= 0) {
      return 1
    }

    return Math.min(1, metrics.containerWidth / DESKTOP_SHELL_WIDTH)
  }, [isEmbeddedInIframe, metrics.containerWidth])

  const scaledShellHeight = useMemo(() => {
    if (!isEmbeddedInIframe || metrics.shellHeight <= 0) {
      return undefined
    }

    return metrics.shellHeight * scale
  }, [isEmbeddedInIframe, metrics.shellHeight, scale])

  if (!isEmbeddedInIframe) {
    return <ModalPortalProvider target={null}>{children}</ModalPortalProvider>
  }

  return (
    <ModalPortalProvider target={modalPortalTarget}>
      <div ref={containerRef} className="h-full overflow-hidden bg-white">
        <div
          className="mx-auto"
          style={{
            width: `${DESKTOP_SHELL_WIDTH * scale}px`,
            height: scaledShellHeight ? `${scaledShellHeight}px` : '100%',
          }}
        >
          <div
            ref={shellRef}
            style={{
              width: `${DESKTOP_SHELL_WIDTH}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
            <div ref={portalHostRef} />
          </div>
        </div>
      </div>
    </ModalPortalProvider>
  )
}
