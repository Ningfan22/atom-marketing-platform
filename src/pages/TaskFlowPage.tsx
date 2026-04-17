import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import WorkflowEditor from '../components/WorkflowEditor'
import { usePlatform } from '../context/PlatformContext'
import { getNextTaskStatus } from '../utils/taskFlow'

export default function TaskFlowPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const { tasks, updateTaskStatus } = usePlatform()

  const currentTask = useMemo(() => {
    if (!taskId) {
      return tasks[0] ?? null
    }
    return tasks.find((item) => item.id === Number(taskId)) ?? tasks[0] ?? null
  }, [taskId, tasks])

  return (
    <div className="flex h-full min-w-[1120px] flex-col bg-[#fcfcfd]">
      <div className="flex h-[64px] flex-shrink-0 items-center justify-between border-b border-[#eef0f3] bg-white px-[24px]">
        <button
          onClick={() =>
            navigate({
              pathname: '/ad-placement',
              search: location.search,
            })
          }
          className="flex h-[36px] items-center gap-[8px] rounded-[10px] border border-[#e8ebf0] bg-white px-[14px] text-[14px] font-medium text-[#4b5260] shadow-[0_2px_4px_rgba(15,23,42,0.02)] transition hover:bg-[#f9fafb]"
        >
          <ChevronLeft size={16} />
          {currentTask ? currentTask.title : '\u8fd4\u56de'}
        </button>
        <button
          onClick={() =>
            navigate({
              pathname: `/ad-placement/task/${taskId}`,
              search: location.search,
            })
          }
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[#5a6270] transition hover:bg-[#f5f6f8]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize-2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" x2="21" y1="10" y2="3"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <WorkflowEditor
          task={currentTask}
          onStatusAction={
            currentTask
              ? () => updateTaskStatus(currentTask.id, getNextTaskStatus(currentTask.status))
              : undefined
          }
        />
      </div>
    </div>
  )
}
