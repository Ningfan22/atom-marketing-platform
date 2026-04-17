import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, ChevronDown, Play, Settings, Target, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
type Tab = '常规' | '通知' | '个性化'

const tabs: { id: Tab; icon: typeof Settings }[] = [
  { id: '常规',  icon: Settings },
  { id: '通知',  icon: Bell },
  { id: '个性化', icon: Target },
]

// ─── Sub-components ───────────────────────────────────────────
function SettingRow({
  label,
  desc,
  children,
  noBorder = false,
}: {
  label: string
  desc?: string
  children: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <div className={`py-[17px] ${noBorder ? '' : 'border-b border-[#f2f3f5]'}`}>
      <div className="flex items-center justify-between gap-[16px]">
        <span className="text-[14px] font-medium text-[#1f2430]">{label}</span>
        <div className="flex-shrink-0">{children}</div>
      </div>
      {desc && (
        <p className="mt-[6px] max-w-[280px] text-[12px] leading-[18px] text-[#9aa3b2]">{desc}</p>
      )}
    </div>
  )
}

function SelectBtn({ value, dot }: { value: string; dot?: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-[5px] rounded-[8px] px-[2px] py-[2px] text-[14px] text-[#6b7280] transition hover:text-[#3d4455]"
    >
      {dot && (
        <span className="inline-block h-[8px] w-[8px] rounded-full" style={{ backgroundColor: dot }} />
      )}
      <span>{value}</span>
      <ChevronDown size={13} className="text-[#9ea6b3]" />
    </button>
  )
}

function Toggle({ on = false, onChange }: { on?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!on)}
      className="relative h-[26px] w-[46px] flex-shrink-0 rounded-full transition-colors duration-200"
      style={{ backgroundColor: on ? '#12d88d' : '#d1d5db' }}
    >
      <span
        className="absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: on ? '23px' : '3px' }}
      />
    </button>
  )
}

// ─── Tab content ──────────────────────────────────────────────
function GeneralTab() {
  const [voiceMode, setVoiceMode] = useState(false)
  return (
    <div>
      <SettingRow label="外观"><SelectBtn value="系统" /></SettingRow>
      <SettingRow label="对比度"><SelectBtn value="系统" /></SettingRow>
      <SettingRow label="重点色"><SelectBtn value="蓝色" dot="#3b82f6" /></SettingRow>
      <SettingRow label="语言"><SelectBtn value="自动检测" /></SettingRow>
      <SettingRow
        label="口语"
        desc="为获得最佳结果，请选择你使用的主要语言。即使未列出的语言也可能通过自动检测功能进行识别。"
      >
        <SelectBtn value="自动检测" />
      </SettingRow>
      <SettingRow label="声音">
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            className="flex items-center gap-[5px] rounded-[8px] px-[10px] py-[5px] text-[13px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f7]"
          >
            <Play size={12} strokeWidth={2} />
            播放
          </button>
          <SelectBtn value="Ember" />
        </div>
      </SettingRow>
      <SettingRow
        label="独立语音模式"
        desc="在单独的全屏模式下启用 ChatGPT 语音（无实时转录文本和可视化元素）。"
        noBorder
      >
        <Toggle on={voiceMode} onChange={setVoiceMode} />
      </SettingRow>
    </div>
  )
}

function NotificationTab() {
  const [email, setEmail]   = useState(true)
  const [push, setPush]     = useState(false)
  const [digest, setDigest] = useState(true)
  return (
    <div>
      <SettingRow label="邮件通知"><Toggle on={email} onChange={setEmail} /></SettingRow>
      <SettingRow label="推送通知"><Toggle on={push} onChange={setPush} /></SettingRow>
      <SettingRow label="每日摘要" desc="每天早上汇总前一天的任务状态和待处理事项。" noBorder>
        <Toggle on={digest} onChange={setDigest} />
      </SettingRow>
    </div>
  )
}

function PersonalizationTab() {
  return (
    <div>
      <SettingRow label="界面密度"><SelectBtn value="默认" /></SettingRow>
      <SettingRow label="默认视图"><SelectBtn value="任务列表" /></SettingRow>
      <SettingRow label="日期格式"><SelectBtn value="YYYY-MM-DD" /></SettingRow>
      <SettingRow label="时区" noBorder><SelectBtn value="自动检测" /></SettingRow>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────
interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('常规')

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[3px]"
      onClick={handleBackdrop}
    >
      <div
        className="flex w-[680px] overflow-hidden rounded-[20px] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
        style={{ maxHeight: '72vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left nav ── */}
        <div className="w-[176px] flex-shrink-0 border-r border-[#f2f3f5] bg-[#fafafa] px-[12px] py-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="mb-[16px] flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#9aa3b2] transition hover:bg-[#eaedf2] hover:text-[#4b5260]"
          >
            <X size={15} strokeWidth={2} />
          </button>

          <nav className="space-y-[3px]">
            {tabs.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  'flex w-full items-center gap-[9px] rounded-[10px] px-[10px] py-[9px] text-left text-[14px] font-medium transition',
                  activeTab === id
                    ? 'bg-white text-[#1f2430] shadow-[0_1px_4px_rgba(15,23,42,0.07)]'
                    : 'text-[#7a8394] hover:bg-white/60 hover:text-[#3d4455]',
                ].join(' ')}
              >
                <Icon size={15} strokeWidth={1.8} />
                {id}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Right content ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-[32px] py-[24px]">
            <h2 className="mb-[4px] text-[17px] font-semibold tracking-[-0.02em] text-[#1f2430]">
              {activeTab}
            </h2>
            <div className="mb-[4px] h-px bg-[#f0f1f3]" />

            {activeTab === '常规'  && <GeneralTab />}
            {activeTab === '通知'  && <NotificationTab />}
            {activeTab === '个性化' && <PersonalizationTab />}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
