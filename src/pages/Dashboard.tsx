import { useMemo, useState } from 'react'
import {
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

export default function Dashboard({ panelMode }: { panelMode?: 'settings' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { tasks } = usePlatform()
  const { rootMinWidthClass, mediumPagePaddingClass } = useDesktopShellClasses()
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [previewTaskId, setPreviewTaskId] = useState<number | null>(null)

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
  const panelTransitionKey = `${isSettingsView ? 'settings' : 'overview'}-${activeAccount.key}-${activePeriod.key}`
  const openAlertTask = () => setPreviewTaskId(1)

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

  return (
    <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
      <div className={`flex h-[72px] items-center justify-between border-b border-[#edf0f3] ${mediumPagePaddingClass}`}>
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

        <button
          onClick={openAlertTask}
          className="flex h-[40px] items-center gap-[6px] rounded-[12px] border border-[#ffd3da] px-[14px] text-[15px] font-medium text-[#ff566f]"
        >
          <AlertTriangle size={16} />
          3项异常
        </button>
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
          onExpand={() => navigate(`/ad-placement/flow/${previewTask.id}`)}
        />
      ) : null}
    </div>
  )
}
