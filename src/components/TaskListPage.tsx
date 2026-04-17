import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpDown, Briefcase, ChevronDown, CircleDot, Plus, Puzzle, Shapes } from 'lucide-react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import MetricCard from './MetricCard'
import TaskDetailModal from './TaskDetailModal'
import UserAvatar from './UserAvatar'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { type PlatformTask, type TemplateCategory, usePlatform } from '../context/PlatformContext'

const taskTypes = ['全部', '投放计划', 'Campaign', 'SEO'] as const
const statuses = ['全部', '进行中', '需介入', '已结束', '已终止'] as const
const sortOptions = ['最新优先', '名称排序', '状态排序'] as const

function getTaskType(task: PlatformTask) {
  if (task.title.includes('Campaign')) return 'Campaign'
  if (task.title.includes('SEO') || task.title.includes('关键词')) return 'SEO'
  if (task.title.includes('投放计划')) return '投放计划'
  return '全部'
}

// ─── Dropdown filter ──────────────────────────────────────────
function FilterDropdown<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: typeof Briefcase
  label: string
  value: T
  options: readonly T[]
  onChange: (val: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const active = value !== '全部'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex h-[38px] items-center gap-[8px] rounded-[10px] border px-[12px] text-[14px] font-medium transition',
          active
            ? 'border-[#2b313f]/20 bg-[#f3f4f7] text-[#1f2430]'
            : 'border-[#e7ebf0] bg-white text-[#5a6270]',
        ].join(' ')}
      >
        <Icon size={14} strokeWidth={1.8} className={active ? 'text-[#4b5260]' : 'text-[#7f8794]'} />
        <span>{active ? `${label}: ${value}` : label}</span>
        <ChevronDown
          size={14}
          className={['transition-transform', open ? 'rotate-180' : ''].join(' ')}
          style={{ color: '#9ea6b3' }}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[44px] z-50 min-w-[160px] overflow-hidden rounded-[12px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={[
                'flex w-full items-center justify-between px-[14px] py-[8px] text-left text-[14px] transition hover:bg-[#f5f6f8]',
                opt === value ? 'font-medium text-[#1f2430]' : 'text-[#4b5260]',
              ].join(' ')}
            >
              {opt}
              {opt === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="#1f2430" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sort dropdown ────────────────────────────────────────────
function SortDropdown({
  value,
  onChange,
}: {
  value: (typeof sortOptions)[number]
  onChange: (val: (typeof sortOptions)[number]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-[38px] items-center gap-[8px] rounded-[10px] border border-[#e7ebf0] bg-white px-[12px] text-[14px] font-medium text-[#5a6270] transition"
      >
        <ArrowUpDown size={14} strokeWidth={1.8} className="text-[#7f8794]" />
        <span>排序{value !== '最新优先' ? `: ${value}` : ''}</span>
        <ChevronDown
          size={14}
          className={['transition-transform', open ? 'rotate-180' : ''].join(' ')}
          style={{ color: '#9ea6b3' }}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[44px] z-50 min-w-[160px] overflow-hidden rounded-[12px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
          {sortOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={[
                'flex w-full items-center justify-between px-[14px] py-[8px] text-left text-[14px] transition hover:bg-[#f5f6f8]',
                opt === value ? 'font-medium text-[#1f2430]' : 'text-[#4b5260]',
              ].join(' ')}
            >
              {opt}
              {opt === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="#1f2430" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────
export interface MetricDef {
  title: string
  value?: string
  valueColor?: string
  progress?: number
  footer?: string
  change?: string
  changeColor?: string
  changeArrow?: string
  dynamicValue?: (tasks: PlatformTask[]) => string
}

export interface TaskListPageProps {
  basePath: string
  defaultTaskCategory: TemplateCategory
  businessLines: readonly string[]
  metrics: MetricDef[]
  modalMode?: 'create' | 'detail'
}

// ─── Create task view: flow steps ─────────────────────────────
type FlowStatus = 'done' | 'review' | 'pending'
interface FlowStep {
  id: number
  title: string
  sub: string
  status: FlowStatus
  desc?: string
}

const createFlowSteps: FlowStep[] = [
  { id: 1, title: '目标与预算设定', sub: '目标平台：TikTok · Instagra...', status: 'done' },
  { id: 2, title: '受众画像定义',   sub: '目标平台：TikTok · Instagra...', status: 'done' },
  { id: 3, title: '寻找达人',       sub: '目标平台：TikTok · Instagra...', status: 'done' },
  {
    id: 4,
    title: '应适合作达人 List，审核签约',
    sub: '',
    status: 'review',
    desc: '查找 tiktok、Instagram、Pinterest 上关于图片编辑功能达人相关的达人，并整理成 list',
  },
  { id: 5, title: '达人内容审核', sub: '目标平台：TikTok · Instagra...', status: 'pending' },
]

function FlowStepCard({ step }: { step: FlowStep }) {
  const isReview = step.status === 'review'
  return (
    <div className="w-[264px] rounded-[16px] bg-white px-[16px] py-[14px] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-[10px]">
        <div
          className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: isReview ? '#fef9ec' : '#f0f1f3' }}
        >
          <Puzzle size={16} strokeWidth={1.5} style={{ color: isReview ? '#f59c00' : '#b8bec9' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[5px]">
            <span className="text-[13px] font-medium leading-[18px] text-[#1f2430]">
              Step {step.id} {step.title}
            </span>
            {step.status === 'done' && (
              <span className="inline-block h-[7px] w-[7px] flex-shrink-0 rounded-full bg-[#12d88d]" />
            )}
            {step.status === 'review' && (
              <span className="inline-block h-[7px] w-[7px] flex-shrink-0 rounded-full bg-[#f59c00]" />
            )}
          </div>
          {step.sub && (
            <div className="mt-[2px] truncate text-[12px] text-[#a3abb8]">{step.sub}</div>
          )}
        </div>
        {isReview && (
          <button
            type="button"
            className="flex-shrink-0 rounded-full bg-[#1f2430] px-[12px] py-[5px] text-[12px] font-medium text-white"
          >
            去审核
          </button>
        )}
      </div>
      {isReview && step.desc && (
        <div className="mt-[10px] rounded-[12px] bg-[#f5f6f8] px-[14px] py-[10px] text-[12px] leading-[19px] text-[#6b7280]">
          {step.desc}
        </div>
      )}
    </div>
  )
}

// ─── Create task modal ────────────────────────────────────────
const allSections: TemplateCategory[] = ['广告投放', '达人营销', 'SEO']

function CreateTaskModal({
  defaultSection,
  onClose,
  onSubmit,
}: {
  defaultSection: TemplateCategory
  onClose: () => void
  onSubmit: (data: { name: string; desc: string; section: TemplateCategory }) => void
}) {
  const [section, setSection]               = useState<TemplateCategory>(defaultSection)
  const [sectionDropOpen, setSectionDropOpen] = useState(false)
  const sectionDropRef = useRef<HTMLDivElement>(null)
  const [name, setName]             = useState('')
  const [desc, setDesc]             = useState('')
  const [syncFeishu, setSyncFeishu] = useState(true)

  useEffect(() => {
    if (!sectionDropOpen) return
    const handler = (e: MouseEvent) => {
      if (sectionDropRef.current && !sectionDropRef.current.contains(e.target as Node)) {
        setSectionDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sectionDropOpen])

  const today   = new Date()
  const dateStr =
    `${today.getFullYear()}` +
    `${String(today.getMonth() + 1).padStart(2, '0')}` +
    `${String(today.getDate()).padStart(2, '0')}`

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div className="relative mx-[20px] max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] bg-white p-[40px] shadow-[0_24px_60px_rgba(15,23,42,0.18)]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1a1f2c]">创建任务</h2>
            <div ref={sectionDropRef} className="relative">
              <button type="button" onClick={() => setSectionDropOpen((v) => !v)}
                className="flex h-[36px] items-center gap-[6px] rounded-[10px] border border-[#d7dbe3] bg-white px-[13px] text-[13px] font-medium text-[#6b7280] transition hover:border-[#b8bfcc]">
                {section}
                <ChevronDown size={12} className={`text-[#9ea6b3] transition-transform ${sectionDropOpen ? 'rotate-180' : ''}`} />
              </button>
              {sectionDropOpen && (
                <div className="absolute left-0 top-[42px] z-50 min-w-[130px] overflow-hidden rounded-[12px] border border-[#eaedf2] bg-white py-[5px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                  {allSections.map((s) => (
                    <button key={s} type="button"
                      onClick={() => { setSection(s); setSectionDropOpen(false) }}
                      className={['flex w-full px-[13px] py-[8px] text-left text-[13px] transition hover:bg-[#f5f6f8]',
                        s === section ? 'font-semibold text-[#1f2430]' : 'font-medium text-[#3d4455]'].join(' ')}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button type="button"
            className="h-[36px] rounded-[10px] border border-[#d7dbe3] px-[16px] text-[13px] font-medium text-[#3d4455] transition hover:bg-[#f7f8fa]">
            使用模板
          </button>
        </div>

        {/* 名称 */}
        <div className="mt-[28px]">
          <div className="text-[14px] font-medium text-[#1a1f2c]">名称</div>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder={`${section}：CapCut – Mate AI video 投放计划 – ${dateStr}`}
            className="mt-[10px] h-[50px] w-full rounded-[12px] border border-[#eaedf2] px-[16px] text-[14px] text-[#2d3340] outline-none placeholder:text-[#c0c7d4] focus:border-[#c0c7d4]"
          />
        </div>

        {/* 任务描述 */}
        <div className="mt-[22px]">
          <div className="text-[14px] font-medium text-[#1a1f2c]">任务描述</div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
            placeholder="黑五大促期间，借助 KOL 内容提升 CapCut 图片编辑功能的海外认知度，黑五期间图片编辑功能新增用户 2 万，图片编辑功..."
            className="mt-[10px] w-full resize-none rounded-[12px] border border-[#eaedf2] px-[16px] py-[13px] text-[14px] leading-[24px] text-[#2d3340] outline-none placeholder:text-[#c0c7d4] focus:border-[#c0c7d4]"
          />
        </div>

        {/* 执行过程 */}
        <div className="mt-[22px]">
          <div className="text-[14px] font-medium text-[#1a1f2c]">执行过程</div>
          <div
            className="relative mt-[10px] overflow-y-auto rounded-[18px]"
            style={{
              minHeight: '380px',
              backgroundColor: '#f3f5f7',
              backgroundImage: 'radial-gradient(circle, #c6cbd6 1.5px, transparent 1.5px)',
              backgroundSize: '18px 18px',
              padding: '24px',
            }}
          >
            <button type="button"
              className="absolute right-[12px] top-[12px] flex h-[26px] w-[26px] items-center justify-center rounded-[7px] text-[#9aa3b2] transition hover:bg-[#e4e8f0]">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M9 1.5h3.5v3.5M5 12.5H1.5V9M1.5 1.5l4.5 4.5M12.5 12.5L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              {createFlowSteps.map((step, i) => (
                <div key={step.id} className="flex w-full flex-col items-center">
                  <FlowStepCard step={step} />
                  {i < createFlowSteps.length - 1 && <div className="h-[20px] w-px bg-[#d4d8e0]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-[28px] flex items-center justify-between">
          <div className="flex items-center gap-[10px]">
            <span className="text-[14px] font-medium text-[#3d4455]">状态同步飞书</span>
            <button type="button" onClick={() => setSyncFeishu((v) => !v)}
              className="relative h-[26px] w-[46px] flex-shrink-0 rounded-full transition-colors duration-200"
              style={{ backgroundColor: syncFeishu ? '#12d88d' : '#d1d5db' }}>
              <span className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-all duration-200"
                style={{ left: syncFeishu ? '23px' : '3px' }} />
            </button>
          </div>
          <button type="button"
            onClick={() => onSubmit({ name, desc, section })}
            className="h-[44px] rounded-[13px] bg-[#0f1219] px-[28px] text-[14px] font-medium text-white transition hover:bg-[#2a3040]">
            创建任务
          </button>
        </div>

      </div>
    </div>,
    document.body,
  )
}

// ─── Main component ───────────────────────────────────────────
export default function TaskListPage({
  basePath,
  defaultTaskCategory,
  businessLines,
  metrics,
  modalMode,
}: TaskListPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { taskId } = useParams()
  const { tasks, addTask } = usePlatform()
  const { rootMinWidthClass, widePagePaddingClass, widePageMaxWidthClass } = useDesktopShellClasses()
  const [selectedTask, setSelectedTask] = useState<PlatformTask | null>(null)

  const query         = searchParams.get('query') ?? ''
  const channelFilter = searchParams.get('channel') ?? businessLines[0]
  const typeFilter    = taskTypes.find((item) => item === searchParams.get('type')) ?? taskTypes[0]
  const statusFilter  = statuses.find((item) => item === searchParams.get('status')) ?? statuses[0]
  const sortMode      = sortOptions.find((item) => item === searchParams.get('sort')) ?? sortOptions[0]

  const filteredTasks = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return [...tasks]
      .filter((task) => {
        if (task.category !== defaultTaskCategory) return false
        const matchesChannel = channelFilter === '全部' ? true : task.channel === channelFilter
        const matchesType    = typeFilter === '全部' ? true : getTaskType(task) === typeFilter
        const matchesStatus  = statusFilter === '全部' ? true : task.status === statusFilter
        const matchesQuery   =
          !keyword ||
          task.title.toLowerCase().includes(keyword) ||
          task.subtitle.toLowerCase().includes(keyword) ||
          task.description.toLowerCase().includes(keyword)
        return matchesChannel && matchesType && matchesStatus && matchesQuery
      })
      .sort((left, right) => {
        if (sortMode === '名称排序') return left.title.localeCompare(right.title, 'zh-CN')
        if (sortMode === '状态排序') {
          const priority = { 需介入: 0, 进行中: 1, 已终止: 2, 已结束: 3 } as const
          return priority[left.status] - priority[right.status]
        }
        return right.id - left.id
      })
  }, [channelFilter, defaultTaskCategory, query, sortMode, statusFilter, tasks, typeFilter])

  const resolvedModalMode =
    modalMode ??
    (location.pathname === `${basePath}/new`
      ? 'create'
      : location.pathname.startsWith(`${basePath}/task/`)
        ? 'detail'
        : undefined)

  useEffect(() => {
    if (resolvedModalMode === 'detail' && taskId) {
      setSelectedTask(tasks.find((item) => item.id === Number(taskId)) ?? null)
      return
    }
    setSelectedTask(null)
  }, [resolvedModalMode, taskId, tasks])

  const taskSearch = searchParams.toString()
  const showCreateModal = resolvedModalMode === 'create'

  const setFilter = (key: 'channel' | 'type' | 'status' | 'sort', val: string) => {
    const next = new URLSearchParams(searchParams)
    const defaults: Record<string, string> = {
      channel: '全部', type: '全部', status: '全部', sort: '最新优先',
    }
    if (val === defaults[key]) next.delete(key)
    else next.set(key, val)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
        <div className={`flex h-full flex-col ${widePagePaddingClass} pb-[40px] pt-[54px]`}>
          <div className={`mx-auto flex w-full ${widePageMaxWidthClass} flex-1 flex-col overflow-hidden`}>

            {/* Header */}
            <div className="flex flex-shrink-0 items-start justify-between gap-[20px] bg-white">
              <div className="pt-[2px] text-[24px] font-semibold tracking-[-0.03em] text-[#222733]">
                任务管理
              </div>
              <button
                onClick={() =>
                  navigate({ pathname: `${basePath}/new`, search: taskSearch ? `?${taskSearch}` : '' })
                }
                className="flex h-[38px] items-center gap-[8px] rounded-[10px] border border-[#cfd5de] bg-white px-[14px] text-[14px] font-medium text-[#2f3642]"
              >
                <Plus size={16} strokeWidth={1.9} />
                新建任务
              </button>
            </div>

            {/* Metrics */}
            <div className="mt-[22px] grid flex-shrink-0 grid-cols-4 gap-[14px] bg-white">
              {metrics.map((m) => (
                <MetricCard
                  key={m.title}
                  title={m.title}
                  value={m.dynamicValue ? m.dynamicValue(tasks) : m.value}
                  valueColor={m.valueColor ?? '#1f2430'}
                  progress={m.progress}
                  footer={m.footer}
                  change={m.change}
                  changeColor={m.changeColor}
                  changeArrow={m.changeArrow}
                />
              ))}
            </div>

            {/* Filters */}
            <div className="mt-[22px] flex flex-shrink-0 items-center justify-between gap-[16px] bg-white pb-[16px]">
              <div className="flex items-center gap-[10px]">
                <FilterDropdown
                  icon={Briefcase}
                  label="业务线"
                  value={channelFilter}
                  options={businessLines}
                  onChange={(val) => setFilter('channel', val)}
                />
                <FilterDropdown
                  icon={Shapes}
                  label="类型"
                  value={typeFilter}
                  options={taskTypes}
                  onChange={(val) => setFilter('type', val)}
                />
                <FilterDropdown
                  icon={CircleDot}
                  label="状态"
                  value={statusFilter}
                  options={statuses}
                  onChange={(val) => setFilter('status', val)}
                />
              </div>
              <SortDropdown value={sortMode} onChange={(val) => setFilter('sort', val)} />
            </div>

            {/* Task list */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-white pr-[2px]">
              <div className="space-y-[12px]">
                {filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() =>
                      navigate({
                        pathname: `${basePath}/task/${task.id}`,
                        search: taskSearch ? `?${taskSearch}` : '',
                      })
                    }
                    className="panel-border grid w-full grid-cols-[40px_minmax(0,1fr)_108px_32px_72px_32px] items-center gap-[16px] rounded-[14px] bg-white px-[16px] py-[14px] text-left transition hover:bg-[#fcfcfd]"
                  >
                    <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-[#f5f6f8] text-[14px] text-[#a8aebb]">
                      {task.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-[15px] font-medium tracking-[-0.02em] text-[#313744]">
                        {task.title}
                      </div>
                      <div className="mt-[3px] line-clamp-1 text-[12px] leading-[18px] text-[#a3acb8]">
                        {task.subtitle}
                      </div>
                    </div>
                    <div
                      className="flex min-w-0 items-center justify-start gap-[7px] text-[14px] font-medium"
                      style={{ color: task.statusColor }}
                    >
                      <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: task.dotColor }} />
                      {task.status}
                    </div>
                    <div className="flex justify-center">
                      <UserAvatar size={24} />
                    </div>
                    <div className="text-[13px] text-[#b0b7c2]">{task.time}</div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate({
                          pathname: `${basePath}/flow/${task.id}`,
                          search: taskSearch ? `?${taskSearch}` : '',
                        })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation()
                          navigate({
                            pathname: `${basePath}/flow/${task.id}`,
                            search: taskSearch ? `?${taskSearch}` : '',
                          })
                        }
                      }}
                      className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-[#f5f6f8] text-[18px] leading-none text-[#39404d]"
                    >
                      …
                    </span>
                  </button>
                ))}
                {!filteredTasks.length && (
                  <div className="rounded-[14px] border border-[#eceff3] bg-[#fbfbfc] px-[20px] py-[28px] text-[14px] text-[#a3abb8]">
                    没有找到符合当前筛选条件的任务
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() =>
            navigate({ pathname: basePath, search: taskSearch ? `?${taskSearch}` : '' })
          }
          onExpand={() =>
            navigate({
              pathname: selectedTask
                ? `${basePath}/flow/${selectedTask.id}`
                : `${basePath}/flow`,
              search: taskSearch ? `?${taskSearch}` : '',
            })
          }
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          defaultSection={defaultTaskCategory}
          onClose={() => navigate({ pathname: basePath, search: taskSearch ? `?${taskSearch}` : '' })}
          onSubmit={({ name, desc, section }) => {
            const today = new Date()
            const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
            const finalName = name.trim() || `${section}：CapCut – Mate AI video 投放计划 – ${dateStr}`
            addTask({ name: finalName, desc: desc.trim(), category: section })
            navigate({ pathname: basePath, search: taskSearch ? `?${taskSearch}` : '' })
          }}
        />
      )}
    </>
  )
}
