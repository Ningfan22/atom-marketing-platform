interface MetricCardProps {
  title: string
  value?: string
  footer?: string
  progress?: number
  progressColor?: string
  valueColor?: string
  change?: string
  changeColor?: string
  changeArrow?: string
}

export default function MetricCard({
  title,
  value,
  footer,
  progress,
  progressColor = '#10d38e',
  valueColor = '#1f2430',
  change,
  changeColor = '#f2b11a',
  changeArrow = '→',
}: MetricCardProps) {
  return (
    <div className="panel-border h-[128px] rounded-[18px] bg-white px-[16px] py-[16px]">
      <div className="flex h-full flex-col">
        <div className="text-[15px] font-semibold leading-[22px] tracking-[-0.02em] text-[#1f2430]">
          {title}
        </div>
        {typeof progress === 'number' ? (
          <div className="mt-auto">
            <div className="h-[5px] w-full rounded-full bg-[#dde2e8]">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, backgroundColor: progressColor }}
              />
            </div>
            <div className="mt-[8px] text-[13px] font-medium leading-[18px] text-[#4a4f5d]">
              {footer}
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-end gap-[6px]">
            <div
            className="text-[28px] font-semibold leading-[32px] tracking-[-0.04em]"
            style={{ color: valueColor }}
          >
            {value}
          </div>
          {change ? (
            <div
              className="mb-[4px] flex items-center gap-[2px] text-[13px] font-medium leading-[14px]"
              style={{ color: changeColor }}
            >
              <span className="text-[12px] leading-[12px]">{changeArrow}</span>
              <span className="text-[12px]">{change}</span>
            </div>
          ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
