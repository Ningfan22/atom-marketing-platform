import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { PlatformTask } from '../context/PlatformContext'
import { getTaskFlowSteps } from '../utils/taskFlow'

// ─── Types ─────────────────────────────────────────────
type NodeStatus = 'waiting' | 'running' | 'done' | 'error' | 'paused'

interface WFNode {
  id: string
  title: string
  subtitle: string
  detail?: string
  status: NodeStatus
}

interface WorkflowEditorProps {
  task?: PlatformTask | null
  onStatusAction?: () => void
}

interface ContextMenu {
  x: number
  y: number
  nodeId: string | null
}

interface DragState {
  nodeId: string
  startY: number
  currentY: number
}

// ─── Status config ───────────────────────────────────────
const STATUS_CONFIG: Record<NodeStatus, { label: string; color: string; bg: string; dot: string }> = {
  waiting: { label: '待开始', color: '#9aa3b2', bg: '#f5f6f8', dot: '#c0c6cf' },
  running: { label: '进行中', color: '#f0a020', bg: '#fff8ec', dot: '#f0a020' },
  done:    { label: '已完成', color: '#12d88d', bg: '#eafaf3', dot: '#12d88d' },
  error:   { label: '需介入', color: '#ff4863', bg: '#fff0f2', dot: '#ff4863' },
  paused:  { label: '已暂停', color: '#f0b61c', bg: '#fffaea', dot: '#f0b61c' },
}

const STATUS_CYCLE: NodeStatus[] = ['waiting', 'running', 'done', 'error', 'paused']

function nextStatus(s: NodeStatus): NodeStatus {
  const idx = STATUS_CYCLE.indexOf(s)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

// ─── Convert FlowStep → WFNode ───────────────────────────
function buildNodesFromTask(task?: PlatformTask | null): WFNode[] {
  const steps = getTaskFlowSteps(task ?? undefined)
  return steps.map((step) => {
    let status: NodeStatus = 'waiting'
    if (step.state === 'done') {
      status = 'done'
    } else if (step.state === 'active') {
      const ts = task?.status
      if (ts === '需介入' || ts === '已终止') status = 'error'
      else if (ts === '已结束') status = 'done'
      else status = 'running'
    }
    return {
      id: `node-${step.id}`,
      title: step.title,
      subtitle: step.subtitle,
      detail: step.detail,
      status,
    }
  })
}

// ─── Grip Icon ────────────────────────────────────────────
function GripIcon() {
  return (
    <div className="grid grid-cols-2 gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[3.5px] w-[3.5px] rounded-full bg-[#c0c6cf]" />
      ))}
    </div>
  )
}

// ─── Status Circle Button ─────────────────────────────────
function StatusCircle({ status, onClick }: { status: NodeStatus; onClick: () => void }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <button
      onClick={onClick}
      style={{ borderColor: cfg.dot, backgroundColor: status === 'waiting' ? 'transparent' : cfg.dot }}
      className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all"
      title={cfg.label}
    >
      {status === 'done' && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'running' && (
        <div className={`h-[7px] w-[7px] rounded-full bg-white wf-dot-pulse`} />
      )}
      {status === 'error' && (
        <span className="text-[9px] font-bold leading-none text-white">!</span>
      )}
      {status === 'paused' && (
        <div className="flex gap-[2px]">
          <div className="h-[8px] w-[2px] rounded-sm bg-white" />
          <div className="h-[8px] w-[2px] rounded-sm bg-white" />
        </div>
      )}
    </button>
  )
}

// ─── Node Card ────────────────────────────────────────────
interface NodeCardProps {
  node: WFNode
  selected: boolean
  isDragging: boolean
  dropBefore: boolean
  dropAfter: boolean
  isLast: boolean
  hoverConnector: boolean
  onSelect: (e?: React.MouseEvent) => void
  onStatusCycle: () => void
  onStatusAction?: () => void
  onTitleChange: (t: string) => void
  onDetailChange: (detail: string) => void
  onContextMenu: (e: React.MouseEvent) => void
  onGripMouseDown: (e: React.MouseEvent) => void
  onInsertAfter: () => void
  onSetHoverConnector: (v: boolean) => void
  nodeRef: (el: HTMLDivElement | null) => void
}

function NodeCard({
  node, selected, isDragging, dropBefore, dropAfter, isLast,
  hoverConnector,
  onSelect, onStatusCycle, onStatusAction, onTitleChange, onDetailChange, onContextMenu, onGripMouseDown,
  onInsertAfter, onSetHoverConnector, nodeRef,
}: NodeCardProps) {
  const [editing, setEditing] = useState(false)
  const [editingDetail, setEditingDetail] = useState(false)
  const [editVal, setEditVal] = useState(node.title)
  const [detailVal, setDetailVal] = useState(node.detail ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const detailRef = useRef<HTMLTextAreaElement>(null)
  const cfg = STATUS_CONFIG[node.status]
  const isRunning = node.status === 'running'
  const isExpanded = selected
  const actionLabel = node.status === 'error' ? '恢复推进' : '再次启动'

  useEffect(() => { setEditVal(node.title) }, [node.title])
  useEffect(() => { setDetailVal(node.detail ?? '') }, [node.detail])
  useEffect(() => {
    if (!isExpanded) {
      setEditing(false)
      setEditingDetail(false)
    }
  }, [isExpanded])

  const commitEdit = () => {
    const trimmed = editVal.trim()
    if (trimmed) onTitleChange(trimmed)
    else setEditVal(node.title)
    setEditing(false)
  }

  const commitDetail = () => {
    onDetailChange(detailVal.trim())
    setEditingDetail(false)
  }

  return (
    <div ref={nodeRef} className="relative flex flex-col items-center">
      {/* Drop indicator above */}
      {dropBefore && (
        <div className="h-[3px] w-[90%] rounded-full bg-[#5865f2] mb-1" />
      )}

      {/* Card */}
      <div
        data-node-id={node.id}
        onClick={onSelect}
        onContextMenu={onContextMenu}
        className={[
          'group relative flex items-start border transition-all duration-200',
          isExpanded
            ? 'w-full max-w-[560px] gap-[18px] rounded-[26px] px-[26px] py-[22px] shadow-[0_20px_36px_rgba(15,23,42,0.08)]'
            : 'w-full max-w-[420px] gap-[12px] rounded-[18px] px-[18px] py-[16px] shadow-[0_2px_10px_rgba(15,23,42,0.05)]',
          isDragging ? 'opacity-40 scale-95' : '',
          !isExpanded && isRunning ? 'wf-running-border' : '',
        ].join(' ')}
        style={{
          backgroundColor: isExpanded ? (node.status === 'done' ? '#ffffff' : cfg.bg) : isRunning ? cfg.bg : 'white',
          borderColor: isExpanded
            ? node.status === 'done'
              ? '#dceee6'
              : node.status === 'error'
                ? '#ffd4dd'
                : '#f3e4bc'
            : '#edf0f3',
        }}
      >
        {/* Grip */}
        <div
          onMouseDown={onGripMouseDown}
          className={`flex-shrink-0 cursor-grab active:cursor-grabbing select-none ${isExpanded ? 'mt-[4px]' : 'mt-[1px]'}`}
        >
          <GripIcon />
        </div>

        {/* Status circle */}
        <div className={`flex-shrink-0 ${isExpanded ? 'mt-[2px]' : 'mt-[1px]'}`}>
          <StatusCircle status={node.status} onClick={onStatusCycle} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
                if (e.key === 'Escape') { setEditVal(node.title); setEditing(false) }
              }}
              autoFocus
              className={`w-full rounded-[8px] border border-[#5865f2]/60 bg-white px-[8px] py-[3px] font-medium text-[#1f2430] outline-none ${
                isExpanded ? 'text-[18px] leading-[28px]' : 'text-[14px]'
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
              className={`cursor-default select-none font-medium tracking-[-0.03em] text-[#1f2430] ${
                isExpanded ? 'text-[20px] leading-[30px]' : 'line-clamp-1 text-[14px] leading-snug'
              }`}
            >
              {node.title}
            </p>
          )}
          <p className={`text-[#9aa3b2] ${isExpanded ? 'mt-[6px] text-[16px] leading-[24px]' : 'mt-[3px] line-clamp-1 text-[11px] leading-snug'}`}>
            {node.subtitle}
          </p>
          {isExpanded ? (
            <div className="mt-[16px]">
              {editingDetail ? (
                <textarea
                  ref={detailRef}
                  value={detailVal}
                  onChange={(e) => setDetailVal(e.target.value)}
                  onBlur={commitDetail}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="min-h-[110px] w-full resize-none rounded-[18px] border border-[#dde3eb] bg-[#eef1f6] px-[18px] py-[16px] text-[16px] leading-[26px] text-[#566070] outline-none"
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setEditingDetail(true) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setEditingDetail(true)
                    }
                  }}
                  className="rounded-[18px] bg-[#eef1f6] px-[18px] py-[16px] text-[16px] leading-[26px] text-[#566070]"
                >
                  {detailVal || '点击补充当前节点说明'}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Right side */}
        <div className={`ml-auto flex flex-shrink-0 flex-col items-end ${isExpanded ? 'gap-[10px]' : 'gap-[6px]'}`}>
          <span
            className={`rounded-full font-medium leading-tight ${isExpanded ? 'px-[14px] py-[6px] text-[14px]' : 'px-[8px] py-[2px] text-[11px]'}`}
            style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.dot}20` }}
          >
            {cfg.label}
          </span>
          {isExpanded && (isRunning || node.status === 'error' || node.status === 'paused') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStatusAction?.()
              }}
              className="rounded-[14px] border border-[#d8dee7] bg-white px-[16px] py-[9px] text-[15px] font-medium text-[#4b5260] transition hover:bg-[#f9fafb] shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {/* Drop indicator below */}
      {dropAfter && (
        <div className="h-[3px] w-[90%] rounded-full bg-[#5865f2] mt-1" />
      )}

      {/* Connector + insert btn */}
      {!isLast && (
        <div
          className="wf-connector-group relative flex h-[28px] w-full items-center justify-center"
          onMouseEnter={() => onSetHoverConnector(true)}
          onMouseLeave={() => onSetHoverConnector(false)}
        >
          <div className="h-[20px] w-px bg-[#dde2e8]" />
          <button
            onClick={(e) => { e.stopPropagation(); onInsertAfter() }}
            className="wf-insert-btn absolute flex h-[20px] w-[20px] items-center justify-center rounded-full border border-[#c0c6cf] bg-white text-[#9aa3b2] opacity-0 transition-opacity hover:border-[#5865f2] hover:text-[#5865f2] shadow-sm"
            title="在此处插入节点"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Minimap ──────────────────────────────────────────────
function Minimap({
  nodes,
  offset,
  zoom,
  canvasW,
  canvasH,
}: {
  nodes: WFNode[]
  offset: { x: number; y: number }
  zoom: number
  canvasW: number
  canvasH: number
}) {
  const W = 120
  const H = 90
  const NODE_H = 56
  const NODE_W = 160
  const startY = 40
  const gap = 20

  const totalH = nodes.length * (NODE_H + gap)

  const scaleX = W / Math.max(canvasW, 1)
  const scaleY = H / Math.max(totalH + 80, H)

  const vpW = (canvasW / zoom) * scaleX
  const vpH = (canvasH / zoom) * scaleY
  const vpX = (-offset.x / zoom) * scaleX
  const vpY = (-offset.y / zoom) * scaleY

  return (
    <div className="absolute right-[16px] top-[16px] rounded-[10px] border border-[#eaedf2] bg-white/90 shadow-sm backdrop-blur-sm overflow-hidden">
      <svg width={W} height={H}>
        {nodes.map((n, i) => {
          const y = startY + i * (NODE_H + gap)
          const x = (W - NODE_W * scaleX) / 2
          const cfg = STATUS_CONFIG[n.status]
          return (
            <g key={n.id}>
              {i > 0 && (
                <line
                  x1={W / 2}
                  y1={startY + (i - 1) * (NODE_H + gap) + NODE_H * scaleY}
                  x2={W / 2}
                  y2={y * scaleY + startY * (1 - scaleY)}
                  stroke="#dde2e8"
                  strokeWidth="1"
                />
              )}
              <rect
                x={x}
                y={y * scaleY + (i === 0 ? 4 : 0)}
                width={NODE_W * scaleX}
                height={NODE_H * scaleY}
                rx="3"
                fill={cfg.bg}
                stroke={cfg.dot}
                strokeWidth="0.5"
                strokeOpacity="0.6"
              />
            </g>
          )
        })}
        {/* Viewport rect */}
        <rect
          x={Math.max(0, Math.min(W - 20, vpX))}
          y={Math.max(0, Math.min(H - 20, vpY))}
          width={Math.min(W, vpW)}
          height={Math.min(H, vpH)}
          fill="rgba(88,101,242,0.06)"
          stroke="#5865f2"
          strokeWidth="1"
          strokeOpacity="0.4"
          rx="2"
        />
      </svg>
    </div>
  )
}

// ─── WorkflowEditor ──────────────────────────────────────
export default function WorkflowEditor({ task, onStatusAction }: WorkflowEditorProps) {
  const FLOW_TOP_PADDING = 60
  const FLOW_BOTTOM_PADDING = 196
  const MIN_ZOOM = 0.28
  const [nodes, setNodes] = useState<WFNode[]>(() => buildNodesFromTask(task))
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [fitZoom, setFitZoom] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [hoverConnector, setHoverConnector] = useState<number | null>(null)
  const [composerVal, setComposerVal] = useState('')
  const [spaceHeld, setSpaceHeld] = useState(false)

  // Drag-to-reorder
  const dragStateRef = useRef<DragState | null>(null)
  const [dragNodeId, setDragNodeId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  // Pan
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const flowContentRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const clampZoom = useCallback(
    (value: number) => Math.max(MIN_ZOOM, Math.min(Math.max(MIN_ZOOM, fitZoom), value)),
    [fitZoom],
  )

  // Rebuild nodes when task changes
  useEffect(() => {
    setNodes(buildNodesFromTask(task))
    setSelected(null)
    setOffset({ x: 0, y: 0 })
    setZoom(1)
  }, [task])

  // Track canvas size
  useEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({ w: entry.contentRect.width, h: entry.contentRect.height })
      }
    })
    ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!flowContentRef.current || canvasSize.h <= 0) return
    const contentHeight = flowContentRef.current.offsetHeight
    const requiredHeight = contentHeight + FLOW_TOP_PADDING + FLOW_BOTTOM_PADDING
    const nextFitZoom = Math.min(1, Math.max(MIN_ZOOM, (canvasSize.h - 24) / Math.max(requiredHeight, 1)))
    setFitZoom(nextFitZoom)
    setZoom((current) => Math.min(current, nextFitZoom))
  }, [canvasSize.h, nodes, selected])

  // ─── Zoom ────────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom((z) => clampZoom(z + delta))
  }, [clampZoom])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ─── Space key ───────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault()
        setSpaceHeld(true)
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && (e.target as HTMLElement).tagName !== 'INPUT' && selected) {
        setNodes((prev) => prev.filter((n) => n.id !== selected))
        setSelected(null)
      }
      if (e.key === 'Escape') {
        setSelected(null)
        setContextMenu(null)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [selected])

  // ─── Pan via mouse ───────────────────────────────────────
  const onCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start panning if clicking the canvas bg itself (not a child node)
    const target = e.target as HTMLElement
    if (target !== canvasRef.current && !spaceHeld) return
    if (e.button !== 0) return
    isPanningRef.current = true
    panStartRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    e.preventDefault()
  }, [offset, spaceHeld])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        const dx = e.clientX - panStartRef.current.x
        const dy = e.clientY - panStartRef.current.y
        setOffset({ x: panStartRef.current.ox + dx, y: panStartRef.current.oy + dy })
        return
      }
      if (dragStateRef.current) {
        dragStateRef.current.currentY = e.clientY
        setDragNodeId(dragStateRef.current.nodeId)

        // Calculate drop index
        let di = 0
        nodeRefs.current.forEach((el, id) => {
          const rect = el.getBoundingClientRect()
          const mid = rect.top + rect.height / 2
          if (e.clientY > mid) {
            const idx = nodes.findIndex((n) => n.id === id)
            if (idx >= 0) di = idx + 1
          }
        })
        setDropIndex(di)
      }
    }
    const onMouseUp = () => {
      isPanningRef.current = false
      if (dragStateRef.current && dragNodeId !== null && dropIndex !== null) {
        const from = nodes.findIndex((n) => n.id === dragStateRef.current!.nodeId)
        if (from !== -1 && dropIndex !== from && dropIndex !== from + 1) {
          const next = [...nodes]
          const [item] = next.splice(from, 1)
          const insertAt = dropIndex > from ? dropIndex - 1 : dropIndex
          next.splice(insertAt, 0, item)
          setNodes(next)
        }
      }
      dragStateRef.current = null
      setDragNodeId(null)
      setDropIndex(null)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [nodes, dragNodeId, dropIndex])

  // ─── Context menu ─────────────────────────────────────────
  const onCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = e.target as HTMLElement
    const nodeEl = target.closest('[data-node-id]') as HTMLElement | null
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: nodeEl ? nodeEl.dataset.nodeId! : null })
  }

  const closeMenu = () => setContextMenu(null)

  const insertNode = (afterIndex?: number) => {
    const newNode: WFNode = {
      id: `node-${Date.now()}`,
      title: '新节点',
      subtitle: '点击标题可编辑',
      status: 'waiting',
    }
    setNodes((prev) => {
      if (afterIndex === undefined) return [...prev, newNode]
      const next = [...prev]
      next.splice(afterIndex + 1, 0, newNode)
      return next
    })
  }

  const menuItems = contextMenu?.nodeId
    ? [
        { label: '编辑标题', action: () => { setSelected(contextMenu.nodeId); closeMenu() } },
        { label: '在下方插入节点', action: () => { const i = nodes.findIndex((n) => n.id === contextMenu.nodeId); insertNode(i); closeMenu() } },
        { label: '复制节点', action: () => {
          const src = nodes.find((n) => n.id === contextMenu.nodeId)
          if (!src) return
          const clone: WFNode = { ...src, id: `node-${Date.now()}` }
          const i = nodes.findIndex((n) => n.id === contextMenu.nodeId)
          setNodes((prev) => { const next = [...prev]; next.splice(i + 1, 0, clone); return next })
          closeMenu()
        }},
        { divider: true },
        { label: '标记进行中', action: () => { setNodes((prev) => prev.map((n) => n.id === contextMenu.nodeId ? { ...n, status: 'running' as NodeStatus } : n)); closeMenu() } },
        { label: '标记已完成', action: () => { setNodes((prev) => prev.map((n) => n.id === contextMenu.nodeId ? { ...n, status: 'done' as NodeStatus } : n)); closeMenu() } },
        { label: '标记需介入', action: () => { setNodes((prev) => prev.map((n) => n.id === contextMenu.nodeId ? { ...n, status: 'error' as NodeStatus } : n)); closeMenu() } },
        { label: '标记已暂停', action: () => { setNodes((prev) => prev.map((n) => n.id === contextMenu.nodeId ? { ...n, status: 'paused' as NodeStatus } : n)); closeMenu() } },
        { divider: true },
        { label: '删除节点', danger: true, action: () => { setNodes((prev) => prev.filter((n) => n.id !== contextMenu.nodeId)); setSelected(null); closeMenu() } },
      ]
    : [
        { label: '添加节点', action: () => { insertNode(); closeMenu() } },
        { label: '重置视图', action: () => { setOffset({ x: 0, y: 0 }); setZoom(Math.max(MIN_ZOOM, fitZoom)); closeMenu() } },
      ]

  // ─── Grip mousedown ──────────────────────────────────────
  const onGripMouseDown = (nodeId: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragStateRef.current = { nodeId, startY: e.clientY, currentY: e.clientY }
  }

  // ─── Composer send ───────────────────────────────────────
  const handleComposerSend = () => {
    const val = composerVal.trim()
    if (!val) return
    insertNode(nodes.length - 1)
    setNodes((prev) => {
      const last = prev[prev.length - 1]
      return prev.map((n) => n.id === last.id ? { ...n, title: val } : n)
    })
    setComposerVal('')
  }

  const doneCount = nodes.filter((n) => n.status === 'done').length

  return (
    <div
      ref={canvasRef}
      className={[
        'dot-grid relative h-full w-full overflow-hidden select-none',
        spaceHeld || isPanningRef.current ? 'cursor-grab' : 'cursor-default',
      ].join(' ')}
      onMouseDown={onCanvasMouseDown}
      onContextMenu={onCanvasContextMenu}
      onClick={() => { setSelected(null); setContextMenu(null) }}
    >
      {/* ── Transform layer ── */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          willChange: 'transform',
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: `${FLOW_TOP_PADDING}px`,
          paddingBottom: `${FLOW_BOTTOM_PADDING}px`,
        }}
      >
        <div ref={flowContentRef} className="flex w-full max-w-[600px] flex-col items-center">
          {nodes.map((node, i) => {
            const isDragging = dragNodeId === node.id
            const dropBefore = dropIndex === i && dragNodeId !== null && dragNodeId !== node.id
            const dropAfter = dropIndex === i + 1 && dragNodeId !== null
            return (
              <NodeCard
                key={node.id}
                node={node}
                selected={selected === node.id}
                isDragging={isDragging}
                dropBefore={dropBefore}
                dropAfter={dropAfter && i === nodes.length - 1}
                isLast={i === nodes.length - 1}
                hoverConnector={hoverConnector === i}
                onSelect={(e?: React.MouseEvent) => { e?.stopPropagation(); setSelected(node.id) }}
                onStatusCycle={() => setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, status: nextStatus(n.status) } : n))}
                onStatusAction={onStatusAction}
                onTitleChange={(t) => setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, title: t } : n))}
                onDetailChange={(detail) => setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, detail } : n))}
                onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id }) }}
                onGripMouseDown={onGripMouseDown(node.id)}
                onInsertAfter={() => insertNode(i)}
                onSetHoverConnector={(v) => setHoverConnector(v ? i : null)}
                nodeRef={(el) => {
                  if (el) nodeRefs.current.set(node.id, el)
                  else nodeRefs.current.delete(node.id)
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ── Minimap ── */}
      <Minimap
        nodes={nodes}
        offset={offset}
        zoom={zoom}
        canvasW={canvasSize.w}
        canvasH={canvasSize.h}
      />

      {/* ── Bottom-left controls ── */}
      <div className="absolute bottom-[100px] left-[16px] flex flex-col gap-[8px]">
        {/* Node count badge */}
        <div className="rounded-[8px] border border-[#eaedf2] bg-white/90 px-[10px] py-[5px] text-[11px] text-[#9aa3b2] shadow-sm backdrop-blur-sm">
          {nodes.length} 个节点 · {doneCount} 已完成
        </div>
        {/* Zoom controls */}
        <div className="flex items-center gap-[4px] rounded-[10px] border border-[#eaedf2] bg-white/90 px-[6px] py-[4px] shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setZoom((z) => clampZoom(z - 0.1))}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#4b5260] transition hover:bg-[#f5f6f8]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <span className="min-w-[38px] text-center text-[11px] font-medium text-[#4b5260]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => clampZoom(z + 0.1))}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#4b5260] transition hover:bg-[#f5f6f8]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <div className="mx-[2px] h-[14px] w-px bg-[#eaedf2]" />
          <button
            onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(Math.max(MIN_ZOOM, fitZoom)) }}
            className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[#4b5260] transition hover:bg-[#f5f6f8]"
            title="重置视图"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="8" y="1" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="1" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Composer ── */}
      <div
        className="absolute bottom-[24px] left-1/2 w-full max-w-[560px] -translate-x-1/2 px-[16px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="panel-border flex h-[56px] items-center rounded-full bg-white pl-[22px] pr-[8px] shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <input
            value={composerVal}
            onChange={(e) => setComposerVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleComposerSend() } }}
            className="h-full flex-1 border-0 bg-transparent text-[14px] text-[#2d3340] outline-none placeholder:text-[#c0c6cf]"
            placeholder='输入节点标题或"/"指令'
          />
          <button
            onClick={handleComposerSend}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#0f1219] text-white transition hover:bg-[#2d3340]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </button>
        </div>
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 min-w-[180px] overflow-hidden rounded-[12px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems.map((item, i) =>
              'divider' in item ? (
                <div key={i} className="my-[4px] h-px bg-[#f0f2f5]" />
              ) : (
                <button
                  key={i}
                  onClick={item.action}
                  className={[
                    'flex w-full items-center px-[14px] py-[7px] text-left text-[13px] transition hover:bg-[#f5f6f8]',
                    'danger' in item && item.danger ? 'text-[#ff4863]' : 'text-[#2d3340]',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}
