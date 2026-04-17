import TaskListPage, { type MetricDef } from '../components/TaskListPage'

const businessLines = ['全部', 'SEO', 'pSEO', '热点挖掘', 'SEM'] as const

const metrics: MetricDef[] = [
  { title: '总预算消耗', progress: 38, footer: '76k/200K' },
  { title: '关键词覆盖', value: '2,847', valueColor: '#12d88d', change: '12%', changeColor: '#12d88d', changeArrow: '↗' },
  { title: '自然流量', value: '45.2k', valueColor: '#12d88d', change: '8%', changeColor: '#12d88d', changeArrow: '↗' },
  { title: '排名TOP10', value: '128', valueColor: '#f0b61c', change: '5%', changeColor: '#f0b61c', changeArrow: '↗' },
]

export default function SEO({ modalMode }: { modalMode?: 'create' | 'detail' }) {
  return (
    <TaskListPage
      basePath="/seo"
      defaultTaskCategory="SEO"
      businessLines={businessLines}
      metrics={metrics}
      modalMode={modalMode}
    />
  )
}
