import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Location } from 'react-router-dom'

type RouteRenderState = {
  transitionKey: string
  location: Location
}

type RoutePhase = 'enter' | 'idle' | 'exit'

export type RouteVariant =
  | 'home'       // Dashboard — symmetric bloom, no direction
  | 'task'       // Ad/Creator/SEO — slides in from right, workspace energy
  | 'skill'      // Skill — expands from center-bottom
  | 'analytics'  // DataBoard — slow upward drift, data "loading" feel
  | 'settings'   // Account/Resource — slides in from right, crisp & direct
  | 'message'    // Message detail — fast slide from right, reading feel
  | 'default'

interface AnimatedRouteViewportProps {
  location: Location
  transitionKey: string
  variant?: RouteVariant
  children: (displayLocation: Location) => ReactNode
}

export default function AnimatedRouteViewport({
  location,
  transitionKey,
  variant = 'default',
  children,
}: AnimatedRouteViewportProps) {
  const latestStateRef = useRef<RouteRenderState>({ transitionKey, location })
  const [renderState, setRenderState] = useState<RouteRenderState>({ transitionKey, location })
  const [phase, setPhase] = useState<RoutePhase>('enter')

  useEffect(() => {
    latestStateRef.current = { transitionKey, location }
  }, [location, transitionKey])

  useEffect(() => {
    if (transitionKey !== renderState.transitionKey && phase !== 'exit') {
      setPhase('exit')
    }
  }, [phase, renderState.transitionKey, transitionKey])

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return

    if (phase === 'exit') {
      setRenderState(latestStateRef.current)
      setPhase('enter')
      return
    }

    if (phase === 'enter') {
      if (latestStateRef.current.transitionKey !== renderState.transitionKey) {
        setPhase('exit')
        return
      }
      setPhase('idle')
    }
  }

  const displayLocation =
    phase === 'exit'
      ? renderState.location
      : transitionKey === renderState.transitionKey
        ? location
        : renderState.location

  return (
    <div
      data-variant={variant}
      onAnimationEnd={handleAnimationEnd}
      className={[
        'route-transition h-full',
        phase === 'enter' ? 'route-enter' : phase === 'exit' ? 'route-exit' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children(displayLocation)}
    </div>
  )
}
