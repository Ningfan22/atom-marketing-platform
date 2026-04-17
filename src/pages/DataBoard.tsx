import { type ComponentProps, type ReactNode, useMemo } from 'react'
import { BarChart3, ChevronDown, Clock3, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import MetricCard from '../components/MetricCard'
import { CapCutGlyph } from '../components/PlatformIcons'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'

type ScopeKey = 'all' | 'home' | 'creator' | 'ads' | 'seo'
type ProgressItem = { label: string; value: number | string; width: string; dot: string }
type SectionMetric = ComponentProps<typeof MetricCard>
type BoardSectionDef = {
  key: Exclude<ScopeKey, 'all'>
  title: string
  metrics: SectionMetric[]
  panels?: Array<{ title: string; rows: ProgressItem[] }>
}

const scopeLabels: Record<ScopeKey, string> = {
  all: '全业务线',
  home: '首页',
  creator: '达人营销',
  ads: '广告投放',
  seo: 'SEO',
}

const periodLabels = ['最近7天', '最近30天', '最近90天'] as const

const homeSeoItems: ProgressItem[] = [
  { label: 'AI Video Maker', value: 96, width: '92%', dot: '#f0674b' },
  { label: 'Happy house', value: 90, width: '84%', dot: '#efba22' },
  { label: 'bytedance seedance 2.0', value: 80, width: '74%', dot: '#28d595' },
]

const homeDauItems: ProgressItem[] = [
  { label: '达人营销', value: '60%', width: '88%', dot: '#f0674b' },
  { label: 'SEO/PSEO', value: '30%', width: '54%', dot: '#efba22' },
  { label: '广告投放', value: '10%', width: '20%', dot: '#28d595' },
]

const boardSections: BoardSectionDef[] = [
  {
    key: 'home' as const,
    title: '首页',
    metrics: [
      { title: '总预算消耗', progress: 52, footer: '453k/1200K' },
      { title: '投放ROI', value: '2.45', valueColor: '#f0b61c', change: '10%', changeColor: '#f0b61c', changeArrow: '→' },
      { title: '达人邀约数', value: '145', valueColor: '#ff4863', change: '10%', changeColor: '#ff4863', changeArrow: '↗' },
      { title: 'AI Video CPA', value: '2.45', valueColor: '#12d88d', change: '10%', changeColor: '#12d88d', changeArrow: '↘' },
    ],
    panels: [
      { title: '当前SEO选词热度', rows: homeSeoItems },
      { title: 'DAU渠道贡献占比', rows: homeDauItems },
    ],
  },
  {
    key: 'creator' as const,
    title: '达人营销',
    metrics: [
      { title: '总预算消耗', progress: 40, footer: '240k/600K' },
      { title: '达人触达数', value: '1.2K', valueColor: '#12d88d', change: '14%', changeColor: '#12d88d', changeArrow: '↗' },
      { title: '已签约达人', value: '145', valueColor: '#ff4863', change: '10%', changeColor: '#ff4863', changeArrow: '↗' },
      { title: '单达人成本', value: '$186', valueColor: '#f0b61c', change: '3%', changeColor: '#f0b61c', changeArrow: '↘' },
    ],
  },
  {
    key: 'ads' as const,
    title: '广告投放',
    metrics: [
      { title: '总预算消耗', progress: 52, footer: '453k/1200K' },
      { title: '投放ROI', value: '2.45', valueColor: '#f0b61c', change: '10%', changeColor: '#f0b61c', changeArrow: '→' },
      { title: '达人邀约数', value: '145', valueColor: '#ff4863', change: '10%', changeColor: '#ff4863', changeArrow: '↗' },
      { title: 'AI Video CPA', value: '2.45', valueColor: '#12d88d', change: '10%', changeColor: '#12d88d', changeArrow: '↘' },
    ],
  },
  {
    key: 'seo' as const,
    title: 'SEO',
    metrics: [
      { title: '总预算消耗', progress: 38, footer: '76k/200K' },
      { title: '关键词覆盖', value: '2,847', valueColor: '#12d88d', change: '12%', changeColor: '#12d88d', changeArrow: '↗' },
      { title: '自然流量', value: '45.2k', valueColor: '#12d88d', change: '8%', changeColor: '#12d88d', changeArrow: '↗' },
      { title: '排名TOP10', value: '128', valueColor: '#f0b61c', change: '5%', changeColor: '#f0b61c', changeArrow: '↗' },
    ],
  },
] as const

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[40px] items-center gap-[8px] rounded-[12px] border border-[#ebedf1] px-[14px] text-[15px] font-medium text-[#2a303c]"
    >
      <span className="flex h-[24px] w-[24px] items-center justify-center text-[#2e3441]">{icon}</span>
      {label}
      <ChevronDown size={16} className="text-[#9aa3b2]" />
    </button>
  )
}

function ListProgress({
  items,
}: {
  items: ProgressItem[]
}) {
  return (
    <div className="space-y-[8px]">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-[12px]">
          <div className="w-full">
            <div
              className="flex h-[36px] items-center gap-[8px] rounded-[12px] bg-[#f6f6f7] px-[14px]"
              style={{ width: item.width }}
            >
              <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: item.dot }} />
              <span className="text-[14px] font-medium text-[#646b77]">{item.label}</span>
            </div>
          </div>
          <div className="text-[14px] font-medium text-[#646b77]">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

function ProgressPanel({
  title,
  rows,
}: {
  title: string
  rows: ProgressItem[]
}) {
  return (
    <div className="panel-border rounded-[18px] bg-white px-[16px] py-[16px]">
      <div className="text-[16px] font-semibold text-[#1f2430]">{title}</div>
      <div className="mt-[12px]">
        <ListProgress items={rows} />
      </div>
    </div>
  )
}

function BoardSection({
  section,
}: {
  section: BoardSectionDef
}) {
  return (
    <section>
      <div className="text-[14px] font-medium text-[#9ea6b3]">{section.title}</div>
      <div className="stagger-children mt-[12px] grid grid-cols-4 gap-[14px]">
        {section.metrics.map((metric) => (
          <MetricCard key={`${section.key}-${metric.title}`} {...metric} />
        ))}
      </div>
      {section.panels ? (
        <div className="stagger-children mt-[16px] grid grid-cols-2 gap-[14px]">
          {section.panels.map((panel) => (
            <ProgressPanel key={`${section.key}-${panel.title}`} title={panel.title} rows={panel.rows} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default function DataBoard() {
  const navigate = useNavigate()
  const { scopeKey } = useParams()
  const { rootMinWidthClass, widePagePaddingClass, widePageMaxWidthClass } = useDesktopShellClasses()
  const activeScope = (scopeKey as ScopeKey | undefined) ?? 'all'

  const activeLabel = scopeLabels[activeScope] ?? scopeLabels.all
  const sectionTransitionKey = activeScope
  const visibleSections = useMemo(() => {
    if (activeScope === 'all') {
      return boardSections
    }
    return boardSections.filter((section) => section.key === activeScope)
  }, [activeScope])

  const cycleScope = () => {
    const order: ScopeKey[] = ['all', 'home', 'creator', 'ads', 'seo']
    const currentIndex = order.indexOf(activeScope)
    const nextScope = order[(currentIndex + 1) % order.length]
    navigate(nextScope === 'all' ? '/data-board' : `/data-board/${nextScope}`)
  }

  const cyclePeriod = () => {
    const currentIndex = periodLabels.indexOf('最近7天')
    const nextPeriod = periodLabels[(currentIndex + 1) % periodLabels.length]
    void nextPeriod
  }

  return (
    <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
      <div className={`flex h-full flex-col ${widePagePaddingClass} pb-[40px] pt-[54px]`}>
        <div className={`mx-auto flex w-full ${widePageMaxWidthClass} flex-1 flex-col overflow-hidden`}>
          <div className="flex flex-shrink-0 items-start justify-between gap-[20px] bg-white">
            <div className="flex items-center gap-[12px]">
              <ToolbarButton
                label="CapCut"
                icon={
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[8px] bg-[#11161f] text-white">
                    <CapCutGlyph size={11} color="#ffffff" />
                  </span>
                }
              />
              <ToolbarButton label={activeLabel} icon={<BarChart3 size={16} strokeWidth={1.8} />} onClick={cycleScope} />
              <ToolbarButton label="最近7天" icon={<Clock3 size={16} strokeWidth={1.8} />} onClick={cyclePeriod} />
            </div>

            <button
              type="button"
              className="flex h-[38px] items-center gap-[8px] rounded-[10px] border border-[#cfd5de] bg-white px-[14px] text-[14px] font-medium text-[#2f3642]"
            >
              <Plus size={16} strokeWidth={1.9} />
              添加看板
            </button>
          </div>

          <div className="hide-scrollbar mt-[22px] min-h-0 flex-1 overflow-y-auto pr-[2px]">
            <AnimatedSection activeKey={sectionTransitionKey} className="space-y-[36px]" staggerChildren>
              {visibleSections.map((section) => (
                <BoardSection key={section.key} section={section} />
              ))}
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
