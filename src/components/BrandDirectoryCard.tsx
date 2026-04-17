import { type ReactNode } from 'react'
import { Puzzle } from 'lucide-react'

interface BrandDirectoryCardProps {
  title: string
  desc: string
  logoSrc?: string | null
  fallbackIcon?: string
  status?: string | null
  statusTone?: 'success' | 'muted'
  onClick?: () => void
  trailingContent?: ReactNode
}

function BrandLogo({
  title,
  logoSrc,
  fallbackIcon,
}: {
  title: string
  logoSrc?: string | null
  fallbackIcon?: string
}) {
  if (logoSrc) {
    return (
      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#eceff3] bg-white">
        <img src={logoSrc} alt={`${title} logo`} className="h-[28px] w-[28px] rounded-[10px] object-contain" />
      </div>
    )
  }

  if (fallbackIcon?.trim()) {
    return (
      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[14px] border border-[#eceff3] bg-white text-[20px]">
        {fallbackIcon}
      </div>
    )
  }

  return (
    <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[14px] border border-[#eceff3] bg-white text-[#4d5562]">
      <Puzzle size={18} strokeWidth={1.8} />
    </div>
  )
}

function CardInner({
  title,
  desc,
  logoSrc,
  fallbackIcon,
  status,
  statusTone,
  trailingContent,
}: Omit<BrandDirectoryCardProps, 'onClick'>) {
  const isSuccess = statusTone !== 'muted'

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-[14px]">
        <BrandLogo title={title} logoSrc={logoSrc} fallbackIcon={fallbackIcon} />
        <div className="min-w-0">
          <div className="truncate text-[16px] font-semibold tracking-[-0.03em] text-[#202531]">{title}</div>
          <div className="mt-[2px] line-clamp-1 text-[13px] leading-[18px] text-[#a3abb8]">{desc}</div>
        </div>
      </div>
      {trailingContent ? (
        <div className="ml-[12px] flex flex-shrink-0 items-center">{trailingContent}</div>
      ) : status ? (
        <div
          className="ml-[12px] flex flex-shrink-0 items-center gap-[8px] text-[15px] font-medium whitespace-nowrap"
          style={{ color: isSuccess ? '#12d88d' : '#9aa3b2' }}
        >
          <span
            className="h-[10px] w-[10px] rounded-full"
            style={{ backgroundColor: isSuccess ? '#12d88d' : '#ccd3dc' }}
          />
          {status}
        </div>
      ) : null}
    </>
  )
}

export default function BrandDirectoryCard({
  title,
  desc,
  logoSrc,
  fallbackIcon,
  status = '已绑定',
  statusTone = 'success',
  onClick,
  trailingContent,
}: BrandDirectoryCardProps) {
  const sharedClassName =
    'panel-border flex h-[73px] w-full items-center justify-between rounded-[18px] bg-white px-[18px] text-left'

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${sharedClassName} transition hover:border-[#dce2ea] hover:shadow-[0_10px_24px_rgba(15,23,42,0.04)]`}
      >
        <CardInner
          title={title}
          desc={desc}
          logoSrc={logoSrc}
          fallbackIcon={fallbackIcon}
          status={status}
          statusTone={statusTone}
          trailingContent={trailingContent}
        />
      </button>
    )
  }

  return (
    <div className={sharedClassName}>
      <CardInner
        title={title}
        desc={desc}
        logoSrc={logoSrc}
        fallbackIcon={fallbackIcon}
        status={status}
        statusTone={statusTone}
        trailingContent={trailingContent}
      />
    </div>
  )
}
