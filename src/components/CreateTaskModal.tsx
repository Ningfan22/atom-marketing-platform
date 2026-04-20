import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { useDesktopLayout } from '../context/DesktopLayoutContext'
import { useModalPortalTarget } from '../context/ModalPortalContext'
import TaskFlowCanvas from './TaskFlowCanvas'

const categoryOptions = ['广告投放', '达人营销', 'SEO', '创意生产']

interface SubmitPayload {
  name: string
  desc: string
  syncFeishu: boolean
}

interface CreateTaskModalProps {
  onClose: () => void
  title?: string
  actionLabel?: string
  categoryLabel?: string
  nameValue?: string
  descValue?: string
  nameLabel?: string
  descriptionLabel?: string
  onExpand?: () => void
  onSubmit?: (payload: SubmitPayload) => void
  showTemplateButton?: boolean
}

export default function CreateTaskModal({
  onClose,
  title = '创建任务',
  actionLabel = '创建任务',
  categoryLabel = '广告投放',
  nameValue = '广告投放：CapCut – Mate AI video 投放计划 – 20260408',
  descValue = '黑五大促期间，借助 KOL 内容提升 CapCut 图片编辑功能的海外认知度，黑五期间图片编辑功能新增用户 2 万，图片编辑功...',
  nameLabel = '名称',
  descriptionLabel = '任务描述',
  onExpand,
  onSubmit,
  showTemplateButton = true,
}: CreateTaskModalProps) {
  const { embeddedScale, isEmbeddedInIframe } = useDesktopLayout()
  const portalTarget = useModalPortalTarget()
  const [syncFeishu, setSyncFeishu] = useState(true)
  const [name, setName] = useState(nameValue)
  const [desc, setDesc] = useState(descValue)
  const [category, setCategory] = useState(categoryLabel)
  const modalShellStyle = {
    width: 'min(783px, calc(100vw - 48px))',
    ...(isEmbeddedInIframe
      ? { transform: `scale(${embeddedScale})`, transformOrigin: 'center center' }
      : {}),
  }

  const cycleCategory = () => {
    const currentIndex = categoryOptions.indexOf(category)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % categoryOptions.length
    setCategory(categoryOptions[nextIndex])
  }

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div
      className="modal-overlay-transition fixed inset-0 z-50 flex items-center justify-center bg-[#05070b]/20 px-[24px] py-[20px] backdrop-blur-[10px]"
      onClick={onClose}
    >
      <div style={modalShellStyle}>
        <div
          className="modal-panel-transition soft-shadow w-full rounded-[30px] bg-white px-[34px] pb-[26px] pt-[30px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <div className="text-[24px] font-semibold tracking-[-0.03em] text-[#222733]">
              {title}
            </div>
            <button
              type="button"
              onClick={cycleCategory}
              className="flex h-[44px] items-center gap-[8px] rounded-[14px] border border-[#e9ecf1] px-[14px] text-[16px] font-medium text-[#4b5260]"
            >
              {category}
              <ChevronDown size={18} strokeWidth={1.8} />
            </button>
          </div>
          {showTemplateButton ? (
            <button
              type="button"
              onClick={onExpand}
              className={`h-[48px] rounded-[14px] border border-[#bcc2cc] px-[18px] text-[16px] font-medium text-[#2e3542] ${
                onExpand ? '' : 'opacity-50'
              }`}
            >
              使用模板
            </button>
          ) : null}
          </div>

          <div className="mt-[22px]">
            <label className="text-[16px] font-medium leading-[22px] text-[#1f2430]">{nameLabel}</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-[10px] h-[56px] w-full rounded-[14px] border border-[#eceff3] px-[16px] text-[16px] text-[#2d3340] outline-none placeholder:text-[#babfc9]"
            />
          </div>

          <div className="mt-[20px]">
            <label className="text-[16px] font-medium leading-[22px] text-[#1f2430]">{descriptionLabel}</label>
            <textarea
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              rows={3}
              className="mt-[10px] min-h-[96px] w-full resize-none rounded-[14px] border border-[#eceff3] px-[16px] py-[14px] text-[16px] leading-[24px] text-[#2d3340] outline-none placeholder:text-[#babfc9]"
            />
          </div>

          <div className="mt-[22px]">
            <div className="text-[16px] font-medium leading-[22px] text-[#1f2430]">执行过程</div>
            <div className="mt-[12px]">
              <TaskFlowCanvas showExpand={Boolean(onExpand)} onExpand={onExpand} minHeight={620} />
            </div>
          </div>

          <div className="mt-[22px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <span className="text-[16px] font-medium text-[#2d3340]">状态同步飞书</span>
              <button
                type="button"
                onClick={() => setSyncFeishu(!syncFeishu)}
                className={`relative h-[34px] w-[60px] rounded-full transition ${
                  syncFeishu ? 'bg-[#25c7b5]' : 'bg-[#d7dbe3]'
                }`}
              >
                <span
                  className={`absolute top-[3px] h-[28px] w-[28px] rounded-full bg-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] transition ${
                    syncFeishu ? 'left-[29px]' : 'left-[3px]'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const trimmedName = name.trim()
                if (!trimmedName) {
                  return
                }
                onSubmit?.({
                  name: trimmedName,
                  desc: desc.trim(),
                  syncFeishu,
                })
                onClose()
              }}
              className="h-[48px] rounded-[14px] bg-black px-[20px] text-[16px] font-medium text-white"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  )
}
