import TaskListPage, { type MetricDef } from '../components/TaskListPage'

const businessLines = ['全部', 'TikTok Ads', 'Meta Ads', 'Google Ads', '程序化广告'] as const

const metrics: MetricDef[] = [
  { title: '总预算消耗', progress: 52, footer: '453k/1200K' },
  { title: '投放ROI', value: '2.45', valueColor: '#f0b61c', change: '10%', changeColor: '#f0b61c', changeArrow: '→' },
  {
    title: '达人邀约数',
    dynamicValue: (tasks) => `${tasks.filter((t) => t.category === '达人营销').length * 29 + 58}`,
    valueColor: '#ff4863',
    change: '10%',
    changeColor: '#ff4863',
    changeArrow: '↗',
  },
  { title: 'AI Video CPA', value: '2.45', valueColor: '#12d88d', change: '10%', changeColor: '#12d88d', changeArrow: '↘' },
]

export default function AdPlacement({ modalMode }: { modalMode?: 'create' | 'detail' }) {
  return (
    <TaskListPage
      basePath="/ad-placement"
      defaultTaskCategory="广告投放"
      businessLines={businessLines}
      metrics={metrics}
      modalMode={modalMode}
    />
  )
}
