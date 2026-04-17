import { createContext, useContext, type ReactNode } from 'react'

const ModalPortalContext = createContext<HTMLElement | null>(null)

export function ModalPortalProvider({
  children,
  target,
}: {
  children: ReactNode
  target: HTMLElement | null
}) {
  return <ModalPortalContext.Provider value={target}>{children}</ModalPortalContext.Provider>
}

export function useModalPortalTarget() {
  const target = useContext(ModalPortalContext)

  if (target) {
    return target
  }

  if (typeof document === 'undefined') {
    return null
  }

  return document.body
}
