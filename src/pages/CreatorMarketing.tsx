import TaskListPage, { type MetricDef } from '../components/TaskListPage'

const businessLines = ['全部', 'TikTok 达人', 'Instagram 达人', 'Pinterest 达人', '品牌合作'] as const

const metrics: MetricDef[] = [
  { title: '总预算消耗', progress: 40, footer: '240k/600K' },
  { title: '达人触达数', value: '1.2K', valueColor: '#12d88d', change: '14%', changeColor: '#12d88d', changeArrow: '↗' },
  { title: '已签约达人', value: '145', valueColor: '#ff4863', change: '10%', changeColor: '#ff4863', changeArrow: '↗' },
  { title: '单达人成本', value: '$186', valueColor: '#f0b61c', change: '3%', changeColor: '#f0b61c', changeArrow: '↘' },
]

export default function CreatorMarketing({ modalMode }: { modalMode?: 'create' | 'detail' }) {
  return (
    <TaskListPage
      basePath="/creator"
      defaultTaskCategory="达人营销"
      businessLines={businessLines}
      metrics={metrics}
      modalMode={modalMode}
    />
  )
}
