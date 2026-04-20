import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  AlertTriangle,
  ChevronDown,
  Cloud,
  Link2,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import MetricCard from '../components/MetricCard'
import { CapCutGlyph } from '../components/PlatformIcons'
import TaskDetailModal from '../components/TaskDetailModal'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { usePlatform } from '../context/PlatformContext'

const dashboardAccounts = [
  { key: 'capcut', label: 'CapCut' },
  { key: 'dreamina', label: 'Dreamina' },
  { key: 'mate-ai', label: 'Mate AI' },
] as const

const dashboardPeriods = [
  { key: 'last-7d', label: '最近7天' },
  { key: 'last-30d', label: '最近30天' },
  { key: 'last-90d', label: '最近90天' },
] as const

const seoItems = [
  { label: 'AI Video Maker', value: 96, width: '92%', dot: '#f0674b' },
  { label: 'Happy house', value: 90, width: '84%', dot: '#efba22' },
  { label: 'bytedance seedance 2.0', value: 80, width: '74%', dot: '#28d595' },
]

const dauItems = [
  { label: '达人营销', value: '60%', width: '88%', dot: '#f0674b' },
  { label: 'SEO/PSEO', value: '30%', width: '54%', dot: '#efba22' },
  { label: '广告投放', value: '10%', width: '20%', dot: '#28d595' },
]

const dashboardTaskCards = [
  {
    id: 2,
    icon: '⌫',
    title: 'CapCut – Mate AI video 投放计划 – 20260...',
    status: '需介入',
    statusColor: '#f0b61c',
    dotColor: '#f0b61c',
  },
  {
    id: 4,
    icon: '⌫',
    title: 'CapCut – Mate AI video 投放计划 – 20260...',
    status: '已终止',
    statusColor: '#ff4863',
    dotColor: '#ff4863',
  },
  {
    id: 2,
    icon: '✦',
    title: 'CapCut – Mate AI video 投放计划 – 20260...',
    status: '需介入',
    statusColor: '#f0b61c',
    dotColor: '#f0b61c',
  },
  {
    id: 1,
    icon: '⌫',
    title: 'CapCut – Mate AI video 投放计划 – 20260...',
    status: '进行中',
    statusColor: '#12d88d',
    dotColor: '#12d88d',
  },
]

const dashboardAlerts = [
  {
    id: 'creative-a12-decay',
    taskId: 1,
    severity: 'high',
    title: '素材 #A12 衰减率飙升 42%',
    category: '广告投放',
    time: '3 分钟前',
    desc: 'CTR 下降 18%，建议替换为素材 #B07',
  },
  {
    id: 'creator-leslie-renewal',
    taskId: 20,
    severity: 'high',
    title: '达人 @leslie_vlog 合作到期未续约',
    category: '达人营销',
    time: '15 分钟前',
    desc: '已带来 2.1M 曝光，建议确认续约报价',
  },
  {
    id: 'keyword-ai-video-maker',
    taskId: 28,
    severity: 'medium',
    title: '关键词 ai video maker 排名掉出 Top 3',
    category: 'SEO',
    time: '38 分钟前',
    desc: '核心词排名下滑，需补齐竞品内容差异',
  },
  {
    id: 'tiktok-account-limit',
    taskId: 7,
    severity: 'medium',
    title: 'TikTok 账号触发限流',
    category: '账号',
    time: '1 小时前',
    desc: '近期素材复用率偏高，建议切换素材组合',
  },
  {
    id: 'daily-budget-low',
    taskId: 15,
    severity: 'low',
    title: '日预算余额低于 10%',
    category: '广告投放',
    time: '2 小时前',
    desc: '自动加预算前需人工确认投放上限',
  },
] as const

const alertSeverityMeta = {
  high: {
    label: '高危',
    dotClassName: 'bg-[#cc6a64]',
    chipClassName: 'bg-[#fbf0f0] text-[#a95e60]',
  },
  medium: {
    label: '中',
    dotClassName: 'bg-[#d6b457]',
    chipClassName: 'bg-[#f7f2df] text-[#8d7a3b]',
  },
  low: {
    label: '低',
    dotClassName: 'bg-[#8bc7a4]',
    chipClassName: 'bg-[#eaf5ef] text-[#5f9271]',
  },
} as const

const dashboardSettings = [
  {
    title: '首页展示策略',
    desc: '当前首页保持 4 张指标卡、2 组横向榜单和待办任务双列布局。',
    value: '已按设计稿固定',
    icon: SlidersHorizontal,
  },
  {
    title: '异常回流路径',
    desc: '点击异常提醒后，会优先跳到数据看板的全业务线视图，便于快速排查。',
    value: '已连接数据看板',
    icon: AlertTriangle,
  },
  {
    title: '协作同步状态',
    desc: '任务创建后会沿用当前平台协作者配置，并通过账号管理页统一维护权限。',
    value: '同步账号管理',
    icon: ShieldCheck,
  },
  {
    title: '分享链接能力',
    desc: '当前账号和周期会保存在地址栏，刷新或分享时仍然停留在同一视图。',
    value: '支持深链访问',
    icon: Link2,
  },
]

function ListProgress({
  items,
}: {
  items: { label: string; value: number | string; width: string; dot: string }[]
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

function DashboardSettingCard({
  title,
  desc,
  value,
  icon: Icon,
  }: {
  title: string
  desc: string
  value: string
  icon: typeof SlidersHorizontal
}) {
  return (
    <div className="panel-border rounded-[18px] bg-white px-[18px] py-[18px]">
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#f5f6f8] text-[#2f3642]">
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div className="text-[16px] font-medium tracking-[-0.02em] text-[#202531]">{title}</div>
      </div>
      <div className="mt-[10px] text-[14px] leading-[22px] text-[#8f97a6]">{desc}</div>
      <div className="mt-[14px] inline-flex rounded-full bg-[#f5f7fa] px-[12px] py-[6px] text-[13px] font-medium text-[#4b5260]">
        {value}
      </div>
    </div>
  )
}

function getTaskFlowPath(task: { id: number; category: string }) {
  if (task.category === '达人营销') return `/creator/flow/${task.id}`
  if (task.category === 'SEO') return `/seo/flow/${task.id}`
  return `/ad-placement/flow/${task.id}`
}

export default function Dashboard({ panelMode }: { panelMode?: 'settings' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { tasks } = usePlatform()
  const { rootMinWidthClass, mediumPagePaddingClass } = useDesktopShellClasses()
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [alertMenuOpen, setAlertMenuOpen] = useState(false)
  const [ignoredAlertIds, setIgnoredAlertIds] = useState<string[]>([])
  const [previewTaskId, setPreviewTaskId] = useState<number | null>(null)
  const alertMenuRef = useRef<HTMLDivElement>(null)

  const activeAccount =
    dashboardAccounts.find((item) => item.key === searchParams.get('account')) ?? dashboardAccounts[0]
  const activePeriod =
    dashboardPeriods.find((item) => item.key === searchParams.get('period')) ?? dashboardPeriods[0]

  const dashboardSearch = new URLSearchParams({
    account: activeAccount.key,
    period: activePeriod.key,
  }).toString()

  const isSettingsView = panelMode === 'settings' || location.pathname === '/dashboard/settings'
  const previewTask = useMemo(
    () => tasks.find((item) => item.id === previewTaskId) ?? null,
    [previewTaskId, tasks],
  )
  const visibleAlerts = useMemo(
    () => dashboardAlerts.filter((item) => !ignoredAlertIds.includes(item.id)),
    [ignoredAlertIds],
  )
  const alertSeverityCounts = useMemo(
    () =>
      visibleAlerts.reduce(
        (counts, item) => ({
          ...counts,
          [item.severity]: counts[item.severity] + 1,
        }),
        { high: 0, medium: 0, low: 0 },
      ),
    [visibleAlerts],
  )
  const alertTotal = Math.max(0, 31 - ignoredAlertIds.length)
  const manualAlertTotal = Math.max(0, 17 - ignoredAlertIds.length)
  const panelTransitionKey = `${isSettingsView ? 'settings' : 'overview'}-${activeAccount.key}-${activePeriod.key}`
  const openAlertTask = () => {
    setAlertMenuOpen(false)
    setPreviewTaskId(1)
  }

  useEffect(() => {
    if (!alertMenuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (alertMenuRef.current && !alertMenuRef.current.contains(event.target as Node)) {
        setAlertMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAlertMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [alertMenuOpen])

  const updateDashboardSearch = (
    nextAccountKey: string,
    nextPeriodKey: string,
    nextPath: string = location.pathname,
  ) => {
    const nextSearch = new URLSearchParams({
      account: nextAccountKey,
      period: nextPeriodKey,
    }).toString()
    navigate({
      pathname: nextPath,
      search: `?${nextSearch}`,
    })
  }

  const cycleAccount = () => {
    const currentIndex = dashboardAccounts.findIndex((item) => item.key === activeAccount.key)
    const nextAccount = dashboardAccounts[(currentIndex + 1) % dashboardAccounts.length]
    updateDashboardSearch(nextAccount.key, activePeriod.key)
  }

  const cyclePeriod = () => {
    const currentIndex = dashboardPeriods.findIndex((item) => item.key === activePeriod.key)
    const nextPeriod = dashboardPeriods[(currentIndex + 1) % dashboardPeriods.length]
    updateDashboardSearch(activeAccount.key, nextPeriod.key)
  }

  const handleProcessAlert = (taskId: number) => {
    setAlertMenuOpen(false)
    setPreviewTaskId(taskId)
  }

  const handleIgnoreAlert = (alertId: string) => {
    setIgnoredAlertIds((current) => (current.includes(alertId) ? current : [...current, alertId]))
  }

  const handleAiProcessAlerts = () => {
    setIgnoredAlertIds((current) => Array.from(new Set([...current, ...visibleAlerts.map((item) => item.id)])))
    setAlertMenuOpen(false)
  }

  return (
    <div className={`relative flex h-full ${rootMinWidthClass} flex-col bg-white`}>
      <div className={`relative z-40 flex h-[72px] items-center justify-between border-b border-[#edf0f3] bg-white ${mediumPagePaddingClass}`}>
        <div className="flex items-center gap-[12px]">
          <button
            onClick={cycleAccount}
            className="flex h-[40px] items-center gap-[8px] rounded-[12px] border border-[#ebedf1] px-[12px] text-[15px] font-medium text-[#2a303c]"
          >
            <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[8px] bg-[#0f1219] text-[14px] text-white">
              <CapCutGlyph size={11} color="#ffffff" />
            </span>
            {activeAccount.label}
            <ChevronDown size={16} className="text-[#9aa3b2]" />
          </button>
          <button
            onClick={cyclePeriod}
            className="flex h-[40px] items-center gap-[8px] rounded-[12px] border border-[#ebedf1] px-[14px] text-[15px] font-medium text-[#2a303c]"
          >
            <Cloud size={16} className="text-[#4b5260]" />
            {activePeriod.label}
            <ChevronDown size={16} className="text-[#9aa3b2]" />
          </button>
        </div>

        <div ref={alertMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setAlertMenuOpen((current) => !current)}
            className={`flex h-[40px] items-center gap-[8px] rounded-full border px-[18px] text-[15px] font-semibold transition ${
              alertMenuOpen
                ? 'border-[#f0aaa8] bg-[#fff8f8] text-[#c95b5b]'
                : 'border-[#f0b7b8] bg-white text-[#c95b5b] hover:bg-[#fff8f8]'
            }`}
          >
            <span className="h-0 w-0 border-x-[7px] border-b-[12px] border-x-transparent border-b-[#d95f5d]" />
            {alertTotal}项异常
          </button>

          {alertMenuOpen ? (
            <div className="absolute right-0 top-[48px] z-50 w-[420px] rounded-[16px] border border-[#edf0f3] bg-white px-[14px] pb-[10px] pt-[13px] shadow-[0_16px_42px_rgba(15,23,42,0.12)]">
              <span className="absolute right-[48px] top-[-7px] h-[14px] w-[14px] rotate-45 border-l border-t border-[#edf0f3] bg-white" />

              <div className="relative flex items-center justify-between gap-[10px]">
                <div className="flex min-w-0 items-center gap-[10px]">
                  <div className="whitespace-nowrap text-[15px] font-semibold text-[#202531]">
                    {alertTotal}项异常待处理
                  </div>
                  <div className="flex items-center gap-[4px]">
                    {(['high', 'medium', 'low'] as const).map((severity) => (
                      <span
                        key={severity}
                        className={`rounded-full px-[8px] py-[3px] text-[11px] font-semibold ${alertSeverityMeta[severity].chipClassName}`}
                      >
                        {alertSeverityMeta[severity].label} {alertSeverityCounts[severity]}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAlertMenuOpen(false)
                    navigate('/data-board/all')
                  }}
                  className="flex h-[26px] items-center gap-[3px] rounded-[7px] px-[5px] text-[12px] font-medium text-[#80848b] transition hover:bg-[#f6f7f8] hover:text-[#202531]"
                >
                  全部
                  <ArrowUpRight size={13} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-[12px] border-t border-[#eef1f4] pt-[12px]">
                {visibleAlerts.length > 0 ? (
                  <div className="space-y-[11px]">
                    {visibleAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-[10px]"
                      >
                        <span className={`h-[7px] w-[7px] rounded-full ${alertSeverityMeta[alert.severity].dotClassName}`} />
                        <div className="min-w-0">
                          <div className="line-clamp-1 text-[14px] font-semibold text-[#202531]">
                            {alert.title}
                          </div>
                          <div className="mt-[4px] flex min-w-0 items-center gap-[6px] text-[11px] leading-[16px] text-[#9a9da5]">
                            <span className="max-w-[72px] truncate rounded-[6px] bg-[#f5f5f6] px-[7px] py-[2px] text-[#888c94]">
                              {alert.category}
                            </span>
                            <span className="text-[#c4c7cd]">·</span>
                            <span className="whitespace-nowrap">{alert.time}</span>
                            <span className="text-[#c4c7cd]">·</span>
                            <span className="line-clamp-1 min-w-0">{alert.desc}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-[6px]">
                          <button
                            type="button"
                            onClick={() => handleProcessAlert(alert.taskId)}
                            className="h-[28px] w-[52px] rounded-[8px] bg-[#111318] text-[12px] font-semibold text-white transition hover:bg-black"
                          >
                            处理
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIgnoreAlert(alert.id)}
                            className="h-[28px] w-[52px] rounded-[8px] border border-[#e4e6ea] bg-white text-[12px] font-semibold text-[#4b5058] transition hover:bg-[#f7f8fa]"
                          >
                            忽略
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[92px] items-center justify-center rounded-[10px] bg-[#f8f9fa] text-[12px] font-medium text-[#9299a5]">
                    当前展示异常已处理
                  </div>
                )}
              </div>

              <div className="mt-[12px] flex items-center justify-between border-t border-[#eef1f4] pt-[10px]">
                <div className="text-[12px] font-medium text-[#8d929b]">
                  Agent 已处理 14 · 待人工 {manualAlertTotal}
                </div>
                <button
                  type="button"
                  onClick={handleAiProcessAlerts}
                  className="rounded-[8px] px-[7px] py-[4px] text-[12px] font-semibold text-[#202531] transition hover:bg-[#f6f7f8]"
                >
                  AI 处理
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${mediumPagePaddingClass} pt-[54px] ${isSettingsView ? 'pb-[36px]' : 'pb-[124px]'}`}>
        <AnimatedSection activeKey={panelTransitionKey}>
          {!alertDismissed && !isSettingsView ? (
            <div className="rounded-[14px] bg-[#f7f7f7] px-[16px] py-[12px]">
              <div className="flex items-center justify-between gap-[14px]">
                <div className="flex min-w-0 items-center gap-[10px]">
                  <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#ffc31a] text-[12px] text-white">
                    !
                  </span>
                  <div className="line-clamp-1 text-[15px] font-medium tracking-[-0.02em] text-[#2c313d]">
                    CapCut – Mate AI video 投放计划–广告素材#A12 衰减率提高42%，建议替换为素材#B07，预测CTR +18%
                  </div>
                </div>
                <div className="flex items-center gap-[10px]">
                  <button
                    onClick={openAlertTask}
                    className="h-[34px] rounded-[12px] bg-white px-[14px] text-[14px] font-medium text-[#2f3642]"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => setAlertDismissed(true)}
                    className="h-[34px] rounded-[12px] bg-black px-[14px] text-[14px] font-medium text-white"
                  >
                    替换
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-[18px] flex items-center gap-[12px] text-[14px]">
            <button
              onClick={() =>
                navigate({
                  pathname: '/dashboard',
                  search: `?${dashboardSearch}`,
                })
              }
              className={isSettingsView ? 'text-[#bcc2cc]' : 'font-medium text-[#9ea6b3]'}
            >
              核心指标看板
            </button>
            <button
              onClick={() =>
                navigate({
                  pathname: '/dashboard/settings',
                  search: `?${dashboardSearch}`,
                })
              }
              className={isSettingsView ? 'font-medium text-[#9ea6b3]' : 'text-[#bcc2cc]'}
            >
              设置
            </button>
          </div>

          {isSettingsView ? (
            <div className="mt-[18px] pb-[32px]">
              <div className="grid grid-cols-2 gap-[16px] stagger-children">
                {dashboardSettings.map((item) => (
                  <DashboardSettingCard key={item.title} {...item} />
                ))}
              </div>

              <div className="mt-[16px] grid grid-cols-[1.1fr_0.9fr] gap-[14px]">
                <div className="panel-border rounded-[18px] bg-white px-[18px] py-[18px]">
                  <div className="text-[16px] font-medium tracking-[-0.02em] text-[#202531]">当前首页路由状态</div>
                  <div className="mt-[10px] space-y-[10px] text-[14px] text-[#8f97a6]">
                    <div className="rounded-[14px] bg-[#f8f8f9] px-[14px] py-[12px]">
                      当前账号：{activeAccount.label}
                    </div>
                    <div className="rounded-[14px] bg-[#f8f8f9] px-[14px] py-[12px]">
                      时间范围：{activePeriod.label}
                    </div>
                    <div className="rounded-[14px] bg-[#f8f8f9] px-[14px] py-[12px]">
                      当前路径：{location.pathname}
                    </div>
                  </div>
                </div>

                <div className="panel-border rounded-[18px] bg-white px-[18px] py-[18px]">
                  <div className="text-[16px] font-medium tracking-[-0.02em] text-[#202531]">推荐跳转</div>
                  <div className="mt-[10px] space-y-[10px]">
                    {[
                      { label: '查看广告投放任务', path: '/ad-placement' },
                      { label: '检查数据看板异常', path: '/data-board/all' },
                      { label: '同步账号权限', path: '/account' },
                    ].map((action) => (
                      <button
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        className="flex w-full items-center justify-between rounded-[14px] bg-[#f8f8f9] px-[14px] py-[12px] text-left text-[14px] font-medium text-[#2f3642]"
                      >
                        {action.label}
                        <span className="text-[#a3abb8]">›</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-[12px] grid grid-cols-4 gap-[14px] stagger-children">
                <MetricCard title="总预算消耗" progress={52} footer="453k/1200K" />
                <MetricCard title="投放ROI" value="2.45" valueColor="#f0b61c" change="10%" changeColor="#f0b61c" changeArrow="→" />
                <MetricCard
                  title="达人邀约数"
                  value="145"
                  valueColor="#ff4863"
                  change="10%"
                  changeColor="#ff4863"
                  changeArrow="↗"
                />
                <MetricCard title="AI Video CPA" value="2.45" valueColor="#12d88d" change="10%" changeColor="#12d88d" changeArrow="↘" />
              </div>

              <div className="mt-[16px] grid grid-cols-2 gap-[14px] stagger-children">
                <div className="panel-border rounded-[18px] bg-white px-[16px] py-[16px]">
                  <div className="text-[16px] font-semibold text-[#1f2430]">当前SEO选词热度</div>
                  <div className="mt-[12px]">
                    <ListProgress items={seoItems} />
                  </div>
                </div>
                <div className="panel-border rounded-[18px] bg-white px-[16px] py-[16px]">
                  <div className="text-[16px] font-semibold text-[#1f2430]">DAU渠道贡献占比</div>
                  <div className="mt-[12px]">
                    <ListProgress items={dauItems} />
                  </div>
                </div>
              </div>

              <div className="mt-[18px] flex items-center justify-between">
                <div className="text-[14px] font-medium text-[#9ea6b3]">今日待办任务</div>
                <button
                  onClick={() => navigate('/ad-placement')}
                  className="text-[14px] font-medium text-[#9ea6b3]"
                >
                  全部任务120 ›
                </button>
              </div>

              <div className="mt-[12px] grid grid-cols-2 gap-[14px] stagger-children">
                {dashboardTaskCards.map((task, index) => (
                  <button
                    key={`${task.id}-${index}`}
                    onClick={() => navigate(`/ad-placement/flow/${task.id}`)}
                    className="panel-border flex h-[70px] items-center gap-[12px] rounded-[16px] bg-white px-[16px] text-left"
                  >
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#f4f5f7] text-[15px] text-[#a9b0bc]">
                      {task.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-[16px] font-medium tracking-[-0.02em] text-[#303542]">
                        {task.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: task.dotColor }} />
                      <span className="text-[15px] font-medium" style={{ color: task.statusColor }}>
                        {task.status}
                      </span>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation()
                        setPreviewTaskId(task.id)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.stopPropagation()
                          setPreviewTaskId(task.id)
                        }
                      }}
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#f5f5f6] text-[20px] leading-none text-[#2e3441]"
                    >
                      …
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </AnimatedSection>
      </div>

      {previewTask ? (
        <TaskDetailModal
          task={previewTask}
          onClose={() => setPreviewTaskId(null)}
          onExpand={() => navigate(getTaskFlowPath(previewTask))}
        />
      ) : null}
    </div>
  )
}
