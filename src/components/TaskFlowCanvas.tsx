import { useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { getTaskFlowSteps, type FlowBadgeTone, type FlowStep } from '../utils/taskFlow'

interface TaskFlowCanvasProps {
  className?: string
  height?: number | string
  interactiveCards?: boolean
  fitToViewport?: boolean
  showExpand?: boolean
  onExpand?: () => void
  onStepAction?: () => void
  onAddStep?: () => void
  showHeaderChip?: boolean
  showFloatingAdd?: boolean
  chipLabel?: string
  minHeight?: number
  steps?: FlowStep[]
}

const badgeToneMap: Record<FlowBadgeTone, { text: string; border: string; bg: string }> = {
  success: {
    text: '#21c88a',
    border: 'rgba(33, 200, 138, 0.18)',
    bg: '#f0fff8',
  },
  warning: {
    text: '#f5a623',
    border: 'rgba(245, 166, 35, 0.2)',
    bg: '#fff8eb',
  },
  danger: {
    text: '#ff4863',
    border: 'rgba(255, 72, 99, 0.18)',
    bg: '#fff3f6',
  },
  neutral: {
    text: '#9aa3b2',
    border: '#eef0f3',
    bg: '#f7f8fa',
  },
}

function FlowBadge({ label, tone }: { label: string; tone: FlowBadgeTone }) {
  const style = badgeToneMap[tone]
  return (
    <span
      className="inline-flex h-[34px] items-center rounded-full border px-[16px] text-[14px] font-medium"
      style={{
        color: style.text,
        borderColor: style.border,
        backgroundColor: style.bg,
      }}
    >
      {label}
    </span>
  )
}

export default function TaskFlowCanvas({
  className = '',
  height,
  interactiveCards = true,
  fitToViewport = false,
  showExpand = false,
  onExpand,
  onStepAction,
  onAddStep,
  showHeaderChip = false,
  showFloatingAdd = false,
  chipLabel = 'Dreamina – Mate AI video 投放计划...',
  minHeight = 520,
  steps = getTaskFlowSteps(),
}: TaskFlowCanvasProps) {
  const defaultExpandedStepId = useMemo(() => {
    if (!interactiveCards) {
      return null
    }
    return steps.find((step) => step.focusByDefault)?.id ?? steps[steps.length - 1]?.id ?? null
  }, [interactiveCards, steps])
  const [expandedStepId, setExpandedStepId] = useState<number | null>(defaultExpandedStepId)
  const [editingStepId, setEditingStepId] = useState<number | null>(null)
  const [editedDetails, setEditedDetails] = useState<Record<number, string>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [fitScale, setFitScale] = useState(1)
  const [scaledHeight, setScaledHeight] = useState<number | null>(null)
  const isPreviewCanvas = !interactiveCards

  useEffect(() => {
    setExpandedStepId(defaultExpandedStepId)
  }, [defaultExpandedStepId])

  useEffect(() => {
    setEditedDetails((current) => {
      const next = { ...current }
      for (const step of steps) {
        if (!(step.id in next)) {
          next[step.id] = step.detail
        }
      }
      return next
    })
  }, [steps])

  useEffect(() => {
    if (!fitToViewport || !contentRef.current || !viewportRef.current) {
      setFitScale(1)
      setScaledHeight(null)
      return
    }

    const measure = () => {
      if (!contentRef.current || !viewportRef.current) {
        return
      }

      const naturalHeight = contentRef.current.offsetHeight + 20
      const availableHeight = viewportRef.current.clientHeight - (isPreviewCanvas ? 20 : 52)
      const fitPadding = isPreviewCanvas ? 0.88 : 0.97
      const nextScale = Math.min(1, (availableHeight / Math.max(naturalHeight, 1)) * fitPadding)

      setFitScale(nextScale)
      setScaledHeight(isPreviewCanvas ? availableHeight : naturalHeight * nextScale)
    }

    measure()

    const resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(contentRef.current)
    resizeObserver.observe(viewportRef.current)

    return () => resizeObserver.disconnect()
  }, [fitToViewport, steps, expandedStepId, isPreviewCanvas])

  const getCardContainerClass = (step: FlowStep, isExpanded: boolean) => {
    if (isPreviewCanvas) {
      return 'h-[78px] w-[256px] overflow-hidden rounded-[18px] border border-[#edf2ef] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.03)]'
    }
    if (isExpanded && step.state === 'active') {
      return 'w-full max-w-[540px] rounded-[28px] border border-[#f3e4bc] bg-[#fff7ea] shadow-[0_18px_30px_rgba(15,23,42,0.05)]'
    }
    if (isExpanded) {
      return 'w-full max-w-[540px] rounded-[28px] border border-[#e7f3eb] bg-white shadow-[0_18px_30px_rgba(15,23,42,0.05)]'
    }
    if (step.state === 'done') {
      return 'w-[320px] rounded-[22px] border border-[#eef3ef] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.03)]'
    }
    return 'w-[240px] rounded-[18px] border border-[#eef0f3] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.03)]'
  }

  const renderStepIcon = (step: FlowStep, isExpanded: boolean) => {
    const compactIcon = isPreviewCanvas && !isExpanded

    if (step.state === 'done') {
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-[#21d08d] text-white ${
            compactIcon ? 'h-[32px] w-[32px]' : 'h-[44px] w-[44px]'
          }`}
        >
          <Check size={compactIcon ? 18 : 24} strokeWidth={3} />
        </div>
      )
    }

    if (step.state === 'active') {
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-[#f7a718] ${
            compactIcon ? 'h-[32px] w-[32px]' : 'h-[44px] w-[44px]'
          }`}
        >
          <span className={`${compactIcon ? 'h-[10px] w-[10px]' : 'h-[14px] w-[14px]'} rounded-full bg-white`} />
        </div>
      )
    }

    return (
      <div
        className={`rounded-[12px] bg-[#e8f0ff] ${isExpanded ? 'h-[38px] w-[38px]' : 'h-[30px] w-[30px]'}`}
      />
    )
  }

  const renderPreviewStatusMark = (step: FlowStep) => {
    if (step.state === 'done') {
      return (
        <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-[#bdeed7] bg-[#f0fff8] text-[#21c88a]">
          <Check size={12} strokeWidth={2.8} />
        </span>
      )
    }

    if (step.state === 'active') {
      return (
        <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-[#f6ddb1] bg-[#fff8eb]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#f5a623]" />
        </span>
      )
    }

    return (
      <span className="inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-[#e9edf2] bg-[#f7f8fa]">
        <span className="h-[7px] w-[7px] rounded-full bg-[#bcc4d0]" />
      </span>
    )
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border border-[#eef0f3] bg-[#fbfbfb] ${className}`}
      style={{ minHeight, height: height ?? minHeight }}
    >
      {interactiveCards ? (
        <button
          type="button"
          aria-label="收起流程卡片"
          onClick={() => {
            setExpandedStepId(null)
            setEditingStepId(null)
          }}
          className="absolute inset-0 z-0 cursor-default"
        />
      ) : null}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
      {showHeaderChip ? (
        <div className="absolute left-[24px] top-[20px] z-[1] flex h-[50px] items-center rounded-[16px] border border-[#eef0f3] bg-white px-[18px] text-[16px] font-medium leading-[22px] tracking-[-0.03em] text-[#2b313f] shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <span className="mr-[10px] flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-[#f3f4f7] text-[12px] text-[#9aa3b2]">
            ✦
          </span>
          <span className="line-clamp-1 max-w-[280px]">{chipLabel}</span>
        </div>
      ) : null}
      <div
        ref={viewportRef}
        className={`relative z-[1] h-full overflow-hidden ${
          isPreviewCanvas ? 'px-[16px] pb-[16px] pt-[16px]' : 'px-[20px] pb-[24px] pt-[20px]'
        }`}
      >
        <div
          className="flex w-full justify-center"
          style={fitToViewport && scaledHeight ? { height: `${scaledHeight + 8}px` } : undefined}
        >
          <div
            style={
              fitToViewport
                ? {
                    transform: `scale(${fitScale})`,
                    transformOrigin: 'top center',
                  }
                : undefined
            }
          >
            <div
              ref={contentRef}
              className={`mt-[8px] flex w-full flex-col items-center ${isPreviewCanvas ? 'max-w-[540px]' : 'max-w-[620px]'}`}
            >
          {steps.map((step, index) => {
            const isExpanded = interactiveCards && expandedStepId === step.id
            const isEditing = interactiveCards && editingStepId === step.id
            const detailValue = editedDetails[step.id] ?? step.detail
            const badgeTone = step.badgeTone ?? 'neutral'
            const showActionButton = interactiveCards && isExpanded && step.action && step.state === 'active'

            return (
              <div key={step.id} className="flex w-full flex-col items-center">
                <div
                  role={interactiveCards ? 'button' : undefined}
                  tabIndex={interactiveCards ? 0 : -1}
                  onMouseDown={interactiveCards ? (event) => event.stopPropagation() : undefined}
                  onClick={
                    interactiveCards
                      ? (event) => {
                          event.stopPropagation()
                          setExpandedStepId(step.id)
                          setEditingStepId(null)
                        }
                      : undefined
                  }
                  onKeyDown={
                    interactiveCards
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            setExpandedStepId(step.id)
                            setEditingStepId(null)
                          }
                        }
                      : undefined
                  }
                  className={`${getCardContainerClass(step, isExpanded)} text-left transition duration-200 ${
                    interactiveCards ? 'hover:shadow-[0_20px_32px_rgba(15,23,42,0.05)]' : 'cursor-default'
                  }`}
                >
                  <div className={isExpanded ? 'px-[28px] py-[24px]' : isPreviewCanvas ? 'px-[14px] py-[12px]' : 'px-[18px] py-[16px]'}>
                    <div className={`flex items-start ${isExpanded ? 'gap-[18px]' : isPreviewCanvas ? 'gap-[10px]' : 'gap-[12px]'}`}>
                      <div className="flex-shrink-0">{renderStepIcon(step, isExpanded)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-[14px]">
                          <div className="min-w-0">
                            <div
                              className={`font-medium tracking-[-0.03em] text-[#2a303c] ${
                                isExpanded
                                  ? 'text-[26px] leading-[32px]'
                                  : isPreviewCanvas
                                    ? 'line-clamp-1 text-[12px] leading-[18px]'
                                    : 'text-[16px] leading-[22px]'
                              }`}
                            >
                              {step.title}
                            </div>
                            <div
                              className={`text-[#a0a7b3] ${
                                isExpanded
                                  ? 'mt-[8px] text-[18px] leading-[28px]'
                                  : isPreviewCanvas
                                    ? 'mt-[3px] line-clamp-1 text-[9px] leading-[14px]'
                                    : 'mt-[4px] text-[12px] leading-[18px]'
                              }`}
                            >
                              {step.subtitle}
                            </div>
                          </div>

                          <div className={`flex items-center gap-[12px] ${isExpanded ? 'pt-[2px]' : ''}`}>
                            {isPreviewCanvas
                              ? renderPreviewStatusMark(step)
                              : step.badgeLabel
                                ? <FlowBadge label={step.badgeLabel} tone={badgeTone} />
                                : null}
                            {showActionButton ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onStepAction?.()
                                }}
                                className="h-[44px] rounded-[16px] border border-[#d7dee8] bg-white px-[18px] text-[16px] font-medium text-[#4a5260] shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
                              >
                                {step.action}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="mt-[18px]">
                            {isEditing ? (
                              <textarea
                                value={detailValue}
                                onChange={(event) =>
                                  setEditedDetails((current) => ({
                                    ...current,
                                    [step.id]: event.target.value,
                                  }))
                                }
                                onBlur={() => setEditingStepId(null)}
                                onClick={(event) => event.stopPropagation()}
                                autoFocus
                                className="min-h-[112px] w-full resize-none rounded-[20px] border border-[#dfe5ec] bg-[#edf0f6] px-[20px] py-[18px] text-[18px] leading-[30px] text-[#5d6676] outline-none"
                              />
                            ) : (
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setEditingStepId(step.id)
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    setEditingStepId(step.id)
                                  }
                                }}
                                className="rounded-[20px] bg-[#edf0f6] px-[20px] py-[18px] text-[18px] leading-[30px] text-[#5d6676]"
                              >
                                {detailValue}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 ? <div className={`w-px bg-[#dde2e8] ${isExpanded ? 'h-[34px]' : isPreviewCanvas ? 'h-[16px]' : 'h-[28px]'}`} /> : null}
              </div>
            )
          })}
            </div>
          </div>
        </div>
      </div>
      {showFloatingAdd ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            ;(onAddStep ?? onStepAction)?.()
          }}
          onMouseDown={(event) => event.stopPropagation()}
          className="absolute bottom-[40px] right-[40px] z-[2] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-black text-[34px] font-light leading-none text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]"
        >
          +
        </button>
      ) : null}
      {showExpand ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onExpand?.()
          }}
          onMouseDown={(event) => event.stopPropagation()}
          className="absolute right-[14px] top-[14px] z-[2] flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-white text-[#a7aebb] shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition hover:bg-[#fcfcfd]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" x2="14" y1="3" y2="10"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>
        </button>
      ) : null}
    </div>
  )
}
