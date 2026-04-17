import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, X } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import type { PlatformTask } from '../context/PlatformContext'
import { getTaskFlowSteps } from '../utils/taskFlow'
import TaskFlowCanvas from './TaskFlowCanvas'
import UserAvatar from './UserAvatar'

interface TaskDetailModalProps {
  task: PlatformTask
  onClose: () => void
  onExpand: () => void
}

const heatRows = [
  { label: 'AI Video Maker', value: '96', width: '86%', dotColor: '#f26d53' },
  { label: 'Happy house', value: '90', width: '78%', dotColor: '#efba22' },
  { label: 'bytedance seedance 2.0', value: '80', width: '68%', dotColor: '#34d8a0' },
]

const channelRows = [
  { label: '达人营销', value: '60%', width: '86%', dotColor: '#f26d53' },
  { label: 'SEO/PSEO', value: '30%', width: '52%', dotColor: '#efba22' },
  { label: '广告投放', value: '10%', width: '20%', dotColor: '#34d8a0' },
]

function TaskDataMetricCard({
  title,
  progress,
  footer,
  value,
  valueColor,
  change,
  changeColor,
  arrow,
  onExpand,
}: {
  title: string
  progress?: number
  footer?: string
  value?: string
  valueColor?: string
  change?: string
  changeColor?: string
  arrow?: string
  onExpand?: () => void
}) {
  return (
    <div className="panel-border relative h-[138px] rounded-[18px] bg-white px-[16px] py-[16px]">
      {onExpand ? (
        <button
          type="button"
          onClick={onExpand}
          className="absolute right-[14px] top-[14px] text-[#b0b7c3] transition hover:text-[#6a7280]"
        >
          <ArrowUpRight size={14} strokeWidth={1.8} />
        </button>
      ) : null}

      <div className="flex h-full flex-col">
        <div className="text-[16px] font-semibold tracking-[-0.03em] text-[#202531]">{title}</div>
        {typeof progress === 'number' ? (
          <div className="mt-auto">
            <div className="h-[6px] w-full rounded-full bg-[#dce1e8]">
              <div className="h-full rounded-full bg-[#12d88d]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-[10px] text-[14px] font-medium text-[#444a57]">{footer}</div>
          </div>
        ) : (
          <div className="mt-auto flex items-end gap-[6px]">
            <div
              className="text-[30px] font-semibold leading-[34px] tracking-[-0.04em]"
              style={{ color: valueColor ?? '#202531' }}
            >
              {value}
            </div>
            {change ? (
              <div className="mb-[4px] flex items-center gap-[2px] text-[14px] font-medium" style={{ color: changeColor }}>
                <span>{arrow}</span>
                <span>{change}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function TaskDataProgressPanel({
  title,
  rows,
}: {
  title: string
  rows: Array<{ label: string; value: string; width: string; dotColor: string }>
}) {
  return (
    <div className="panel-border rounded-[18px] bg-white px-[16px] py-[16px]">
      <div className="text-[16px] font-semibold tracking-[-0.03em] text-[#202531]">{title}</div>
      <div className="mt-[14px] space-y-[10px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-[12px]">
            <div
              className="min-w-[168px] flex-none rounded-[14px] bg-[#f8f8f9] px-[14px] py-[12px]"
              style={{ width: row.width }}
            >
              <div className="flex items-center gap-[8px] whitespace-nowrap text-[15px] font-medium text-[#5f6674]">
                <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: row.dotColor }} />
                {row.label}
              </div>
            </div>
            <div className="text-[15px] font-medium text-[#5f6674]">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExecutionInstanceCard({
  task,
}: {
  task: PlatformTask
}) {
  return (
    <div className="panel-border grid grid-cols-[32px_minmax(0,1fr)_90px_28px_72px_28px] items-center gap-[14px] rounded-[16px] bg-white px-[16px] py-[14px]">
      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#f4f5f7] text-[14px] text-[#a9b0bc]">
        {task.icon}
      </div>
      <div className="min-w-0">
        <div className="line-clamp-1 text-[15px] font-medium tracking-[-0.02em] text-[#313744]">{task.title}</div>
        <div className="mt-[3px] line-clamp-1 text-[12px] leading-[18px] text-[#a3acb8]">{task.subtitle}</div>
      </div>
      <div className="flex min-w-0 items-center gap-[7px] text-[14px] font-medium" style={{ color: task.statusColor }}>
        <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: task.dotColor }} />
        {task.status}
      </div>
      <div className="flex justify-center">
        <UserAvatar size={22} />
      </div>
      <div className="text-[13px] text-[#b0b7c2]">{task.time}</div>
      <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] bg-[#f5f5f6] text-[20px] leading-none text-[#2e3441]">
        …
      </div>
    </div>
  )
}

export default function TaskDetailModal({ task, onClose, onExpand }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'instance' | 'data'>('data')
  const flowSteps = getTaskFlowSteps(task)
  const instanceCards = useMemo(() => Array.from({ length: 5 }, () => task), [task])
  const tabContentHeight = 'clamp(300px, calc(100vh - 520px), 430px)'

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed left-0 top-0 z-[999] h-screen w-screen bg-[#0b1018]/20 backdrop-blur-[3px] backdrop-brightness-[0.9]">
      <div className="absolute left-1/2 top-1/2 w-[min(920px,calc(100vw-160px))] -translate-x-1/2 -translate-y-1/2">
        <div className="soft-shadow relative flex max-h-[calc(100vh-150px)] w-full flex-col overflow-hidden rounded-[28px] bg-white px-[42px] pb-[40px] pt-[42px]">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[28px] top-[24px] text-[#a7aebb] transition hover:text-[#5c6474]"
          >
            <X size={22} strokeWidth={1.6} />
          </button>

          <div className="flex-1 overflow-y-auto pr-[4px]">
            <div className="text-[24px] font-semibold tracking-[-0.04em] text-[#202531]">任务详情</div>

            <div className="mt-[18px] flex items-start justify-between gap-[20px]">
              <div className="min-w-0">
                <div className="flex items-center gap-[12px]">
                  <div className="line-clamp-1 text-[24px] font-medium leading-[30px] tracking-[-0.035em] text-[#2a303c]">
                    {task.title}
                  </div>
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[8px] bg-[#f4f4f5] text-[12px] text-[#8f97a6]">
                    {task.icon}
                  </span>
                  <div className="flex items-center gap-[8px] text-[16px] font-medium" style={{ color: task.statusColor }}>
                    <span className="h-[10px] w-[10px] rounded-full" style={{ backgroundColor: task.dotColor }} />
                    {task.status}
                  </div>
                </div>
                <div className="mt-[8px] flex items-center gap-[22px] text-[14px] leading-[22px] text-[#a1a9b6]">
                  <span>预算上限：{task.budget}</span>
                  <span>{task.ownerLabel}</span>
                </div>
                <div className="mt-[6px] text-[14px] leading-[22px] text-[#a1a9b6]">执行周期：{task.period}</div>
                <div className="mt-[10px] max-w-[760px] text-[15px] leading-[24px] text-[#9ea6b3]">{task.description}</div>
              </div>

              <div className="flex items-center gap-[10px] pt-[4px]">
                <UserAvatar size={28} />
                <span className="text-[14px] text-[#a1a9b6]">{task.time}</span>
              </div>
            </div>

            <div className="mt-[34px] flex items-center gap-[28px] text-[15px] leading-[20px]">
              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={activeTab === 'template' ? 'font-semibold text-[#202531]' : 'text-[#a3abb8]'}
              >
                执行模板
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instance')}
                className={activeTab === 'instance' ? 'font-semibold text-[#202531]' : 'text-[#a3abb8]'}
              >
                执行实例
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('data')}
                className={activeTab === 'data' ? 'font-semibold text-[#202531]' : 'text-[#a3abb8]'}
              >
                任务数据
              </button>
            </div>

            <div className="mt-[18px]" style={{ height: tabContentHeight }}>
              <AnimatedSection activeKey={activeTab} className="h-full">
                {activeTab === 'template' ? (
                  <TaskFlowCanvas
                    showExpand
                    onExpand={onExpand}
                    minHeight={300}
                    height={tabContentHeight}
                    interactiveCards={false}
                    fitToViewport
                    steps={flowSteps}
                  />
                ) : activeTab === 'instance' ? (
                  <div className="hide-scrollbar h-full overflow-y-auto pr-[4px]">
                    <div className="stagger-children space-y-[12px]">
                      {instanceCards.map((item, index) => (
                        <ExecutionInstanceCard key={`${task.id}-instance-${index}`} task={item} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="hide-scrollbar h-full overflow-y-auto pr-[4px]">
                    <div className="space-y-[16px]">
                      <div className="stagger-children grid grid-cols-4 gap-[16px]">
                        <TaskDataMetricCard title="总预算消耗" progress={50} footer="453k/1200K" />
                        <TaskDataMetricCard
                          title="投放ROI"
                          value="2.45"
                          valueColor="#f0b61c"
                          change="10%"
                          changeColor="#f0b61c"
                          arrow="→"
                        />
                        <TaskDataMetricCard
                          title="达人邀约数"
                          value="145"
                          valueColor="#ff4863"
                          change="10%"
                          changeColor="#ff4863"
                          arrow="↗"
                        />
                        <TaskDataMetricCard
                          title="AI Video CPA"
                          value="2.45"
                          valueColor="#14d58c"
                          change="10%"
                          changeColor="#14d58c"
                          arrow="↘"
                          onExpand={onExpand}
                        />
                      </div>

                      <div className="stagger-children grid grid-cols-2 gap-[16px]">
                        <TaskDataProgressPanel title="当前SEO选词热度" rows={heatRows} />
                        <TaskDataProgressPanel title="DAU渠道贡献占比" rows={channelRows} />
                      </div>

                      <div className="stagger-children grid grid-cols-4 gap-[16px]">
                        <TaskDataMetricCard title="总预算消耗" progress={50} footer="453k/1200K" />
                        <TaskDataMetricCard
                          title="投放ROI"
                          value="2.45"
                          valueColor="#f0b61c"
                          change="10%"
                          changeColor="#f0b61c"
                          arrow="→"
                        />
                        <TaskDataMetricCard
                          title="达人邀约数"
                          value="145"
                          valueColor="#ff4863"
                          change="10%"
                          changeColor="#ff4863"
                          arrow="↗"
                        />
                        <TaskDataMetricCard
                          title="AI Video CPA"
                          value="2.45"
                          valueColor="#14d58c"
                          change="10%"
                          changeColor="#14d58c"
                          arrow="↘"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
