import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useDesktopLayout } from '../context/DesktopLayoutContext'
import { useModalPortalTarget } from '../context/ModalPortalContext'

interface PlatformModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  widthClassName?: string
}

export default function PlatformModal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  widthClassName = 'max-w-[860px]',
}: PlatformModalProps) {
  const { embeddedScale, isEmbeddedInIframe } = useDesktopLayout()
  const portalTarget = useModalPortalTarget()

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div
      className="modal-overlay-transition fixed inset-0 z-50 flex items-center justify-center bg-[#05070b]/20 px-[24px] py-[20px] backdrop-blur-[10px]"
      onClick={onClose}
    >
      <div style={isEmbeddedInIframe ? { transform: `scale(${embeddedScale})` } : undefined}>
        <div
          className={`modal-panel-transition soft-shadow relative w-full ${widthClassName} rounded-[28px] bg-white px-[30px] pb-[24px] pt-[28px]`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[26px] top-[24px] text-[#a7aebb] transition hover:text-[#5c6474]"
          >
            <X size={24} strokeWidth={1.8} />
          </button>

          <div className="text-[32px] font-medium leading-[36px] tracking-[-0.04em] text-[#202531]">{title}</div>
          {subtitle ? (
            <div className="mt-[10px] max-w-[640px] text-[15px] leading-[24px] text-[#a3abb8]">{subtitle}</div>
          ) : null}

          <div className="mt-[22px]">{children}</div>
          {footer ? <div className="mt-[22px] flex items-center justify-end gap-[12px]">{footer}</div> : null}
        </div>
      </div>
    </div>,
    portalTarget,
  )
}
