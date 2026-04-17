import { useEffect, useRef, useState, type ReactNode } from 'react'

type SectionRenderState = {
  activeKey: string
  children: ReactNode
}

type SectionPhase = 'enter' | 'idle' | 'exit'

interface AnimatedSectionProps {
  activeKey: string
  children: ReactNode
  className?: string
  staggerChildren?: boolean
}

export default function AnimatedSection({
  activeKey,
  children,
  className,
  staggerChildren = false,
}: AnimatedSectionProps) {
  const latestStateRef = useRef<SectionRenderState>({ activeKey, children })
  const [renderState, setRenderState] = useState<SectionRenderState>({ activeKey, children })
  const [phase, setPhase] = useState<SectionPhase>('enter')

  useEffect(() => {
    latestStateRef.current = { activeKey, children }
  }, [activeKey, children])

  useEffect(() => {
    if (activeKey !== renderState.activeKey && phase !== 'exit') {
      setPhase('exit')
    }
  }, [activeKey, phase, renderState.activeKey])

  const handleTransitionEnd = () => {
    if (phase === 'exit') {
      setRenderState(latestStateRef.current)
      setPhase('enter')
      return
    }

    if (phase === 'enter') {
      if (latestStateRef.current.activeKey !== renderState.activeKey) {
        setPhase('exit')
        return
      }
      setPhase('idle')
    }
  }

  const displayChildren =
    phase === 'exit'
      ? renderState.children
      : activeKey === renderState.activeKey
        ? children
        : renderState.children

  return (
    <div
      onAnimationEnd={handleTransitionEnd}
      className={[
        'section-transition',
        phase === 'enter' ? 'section-enter' : phase === 'exit' ? 'section-exit' : '',
        staggerChildren ? 'stagger-children' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {displayChildren}
    </div>
  )
}
