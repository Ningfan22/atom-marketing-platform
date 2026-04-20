import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ChevronDown, Download, Plus, Star, ThumbsUp } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import { useDesktopLayout, useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { useModalPortalTarget } from '../context/ModalPortalContext'
import {
  AtomBottomIcon1,
  AtomBottomIcon2,
  AtomBottomIcon3,
  AtomBottomIcon4,
  AtomBottomIcon5,
  AtomBottomIcon6,
} from '../components/AtomBottomIcons'
import { type SkillCategory, usePlatform } from '../context/PlatformContext'

// ─── Constants ───────────────────────────────────────────────
const categories: SkillCategory[] = ['达人营销', 'PSEO', 'Paid Ads', '创意生产']

const categorySlugMap: Record<SkillCategory, string> = {
  达人营销:   'creator',
  PSEO:       'pseo',
  'Paid Ads': 'paid-ads',
  创意生产:   'creative',
}
const slugCategoryMap: Record<string, SkillCategory> = Object.fromEntries(
  Object.entries(categorySlugMap).map(([k, v]) => [v, k as SkillCategory]),
)

type SkillMarketCardData = {
  id: number
  title: string
  tag: SkillCategory
  tagTone: 'orange' | 'green'
  desc: string
  author: string
  likes: string
  stars: string
  mine: boolean
  starred: boolean
  status: string
}

// ─── Radar ───────────────────────────────────────────────────
const radarLabels = ['选热点词', 'SKILL 2', '组合优化', '选热点词', '组合优化', 'SKILL 6']
const profileMap: Record<SkillCategory, number[]> = {
  达人营销:   [3.2, 4.1, 3.7, 3.4, 4.0, 3.6],
  PSEO:       [4.2, 3.1, 3.5, 4.0, 4.3, 3.2],
  'Paid Ads': [3.4, 4.4, 4.2, 3.6, 3.2, 3.8],
  创意生产:   [3.8, 3.0, 3.4, 4.3, 4.1, 3.5],
}

function pts(scores: number[], R: number) {
  return scores
    .map((s, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2
      const r = (s / 5) * R
      return `${Math.cos(a) * r},${Math.sin(a) * r}`
    })
    .join(' ')
}

function AbilityRadar({ category, enabledCount }: { category: SkillCategory; enabledCount: number }) {
  const base    = profileMap[category]
  const current = base.map((s) => Math.min(5, s + enabledCount * 0.12))
  const target  = [4.8, 4.8, 4.6, 4.7, 4.8, 4.6]
  const R = 250; const LR = 296

  return (
    <svg viewBox="0 0 700 600" className="h-full w-full" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="rCur" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="rgba(24,196,118,0.20)" />
          <stop offset="100%" stopColor="rgba(24,196,118,0.06)" />
        </radialGradient>
        <radialGradient id="rTgt" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="rgba(255,167,28,0.20)" />
          <stop offset="100%" stopColor="rgba(255,167,28,0.06)" />
        </radialGradient>
      </defs>
      <g transform="translate(350,300)">
        {[50, 100, 150, 200, 250].map((r) => (
          <polygon
            key={r}
            points={Array.from({ length: 6 }).map((_, i) => {
              const a = (Math.PI / 3) * i - Math.PI / 2
              return `${Math.cos(a) * r},${Math.sin(a) * r}`
            }).join(' ')}
            fill="none"
            stroke={r === 250 ? '#9aa3b2' : '#dde2e8'}
            strokeDasharray={r === 250 ? '0' : '4 5'}
            strokeWidth={r === 250 ? 1.5 : 1}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 2
          return (
            <line key={i} x1={0} y1={0}
              x2={Math.cos(a) * R} y2={Math.sin(a) * R}
              stroke="#dde2e8" strokeDasharray="4 5" strokeWidth="1" />
          )
        })}
        <polygon points={pts(target, R)}  fill="url(#rTgt)" stroke="#f59c00" strokeWidth="2.5" />
        <polygon points={pts(current, R)} fill="url(#rCur)" stroke="#1aca73" strokeWidth="2.5" />
      </g>
      {radarLabels.map((label, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return (
          <text key={i}
            x={350 + Math.cos(a) * LR} y={300 + Math.sin(a) * LR}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="16" fontWeight="600" fill="#1f2430"
          >{label}</text>
        )
      })}
    </svg>
  )
}

function SkillMarketCard({
  card,
  onClick,
}: {
  card: SkillMarketCardData
  onClick: () => void
}) {
  const isOrange = card.tagTone === 'orange'

  return (
    <button
      type="button"
      onClick={onClick}
      className="panel-border flex h-[180px] w-full flex-col rounded-[14px] bg-white px-[24px] py-[22px] text-left transition hover:border-[#dce2ea] hover:shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-start gap-[8px]">
        <div className="min-w-0 truncate text-[17px] font-semibold leading-[22px] tracking-[-0.03em] text-[#202531]">
          {card.title}
        </div>
        <span
          className="mt-[1px] flex-shrink-0 rounded-[5px] px-[6px] py-[2px] text-[11px] font-medium leading-[15px]"
          style={{
            backgroundColor: isOrange ? '#fff3e3' : '#edf9f0',
            color: isOrange ? '#d7822a' : '#25a95b',
          }}
        >
          {card.tag}
        </span>
      </div>

      <div className="mt-[12px] line-clamp-3 text-[14px] leading-[22px] text-[#8f98a7]">
        {card.desc}
      </div>

      <div className="mt-auto flex items-center justify-between pt-[16px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[#f4d90b] text-[10px] font-semibold text-[#151922]">
            Z
          </span>
          <span className="truncate text-[14px] leading-[18px] text-[#4f5663]">{card.author}</span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-[18px] text-[13px] leading-[18px] text-[#2d3340]">
          <span className="flex items-center gap-[5px]">
            <Download size={13} strokeWidth={1.8} />
            {card.likes}
          </span>
          <span className="flex items-center gap-[5px]">
            <Star size={13} strokeWidth={1.8} />
            {card.stars}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Skill card ──────────────────────────────────────────────
// ─── Flow step (modal) ────────────────────────────────────────
type FlowStepStatus = 'done' | 'review' | 'pending'
interface FlowStepData { id: number; title: string; sub: string; status: FlowStepStatus; desc?: string }

const flowSteps: FlowStepData[] = [
  { id: 1, title: '目标与预算设定',                sub: '目标平台：TikTok · Instagra...', status: 'done' },
  { id: 2, title: '受众画像定义',                  sub: '目标平台：TikTok · Instagra...', status: 'done' },
  { id: 3, title: '寻找达人',                      sub: '目标平台：TikTok · Instagra...', status: 'done' },
  { id: 4, title: '应适合作达人 List，审核签约',   sub: '', status: 'review',
    desc: '查找 tiktok、Instagram、Pinterest 上关于图片编辑功能达人相关的达人，并整理成 list' },
  { id: 5, title: '达人内容审核',                  sub: '目标平台：TikTok · Instagra...', status: 'pending' },
]

function FlowStepCard({ step }: { step: FlowStepData }) {
  const isReview = step.status === 'review'
  return (
    <div className="w-[260px] rounded-[14px] bg-white px-[14px] py-[12px] shadow-[0_2px_8px_rgba(15,23,42,0.07)]">
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[9px]"
          style={{ backgroundColor: isReview ? '#fef9ec' : '#f0f1f3' }}>
          <AtomBottomIcon4
            size={16}
            color={isReview ? '#f59c00' : '#b8bec9'}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[5px]">
            <span className="text-[12px] font-medium leading-[17px] text-[#1f2430]">
              Step {step.id} {step.title}
            </span>
            {step.status === 'done'   && <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#12d88d]" />}
            {step.status === 'review' && <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#f59c00]" />}
          </div>
          {step.sub && <div className="mt-[2px] truncate text-[11px] text-[#a3abb8]">{step.sub}</div>}
        </div>
        {isReview && (
          <button type="button"
            className="flex-shrink-0 rounded-full bg-[#1f2430] px-[10px] py-[4px] text-[11px] font-medium text-white">
            去审核
          </button>
        )}
      </div>
      {isReview && step.desc && (
        <div className="mt-[8px] rounded-[10px] bg-[#f5f6f8] px-[12px] py-[9px] text-[11px] leading-[17px] text-[#6b7280]">
          {step.desc}
        </div>
      )}
    </div>
  )
}

// ─── New Skill modal ──────────────────────────────────────────
function NewSkillModal({ onClose, defaultCategory }: { onClose: () => void; defaultCategory: SkillCategory }) {
  const { embeddedScale, isEmbeddedInIframe } = useDesktopLayout()
  const portalTarget = useModalPortalTarget()
  const { addSkill } = usePlatform()
  const navigate     = useNavigate()

  const [category, setCategory] = useState<SkillCategory>(defaultCategory)
  const [catOpen, setCatOpen]   = useState(false)
  const catRef = useRef<HTMLDivElement>(null)
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')

  useEffect(() => {
    if (!catOpen) return
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [catOpen])

  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const today   = new Date()
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div style={isEmbeddedInIframe ? { transform: `scale(${embeddedScale})` } : undefined}>
        <div className="relative mx-[20px] max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] bg-white p-[40px] shadow-[0_24px_60px_rgba(15,23,42,0.18)]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1a1f2c]">新建skill</h2>
            <div ref={catRef} className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                className="flex h-[36px] items-center gap-[6px] rounded-[10px] border border-[#d7dbe3] bg-white px-[13px] text-[13px] font-medium text-[#6b7280] transition hover:border-[#b8bfcc]"
              >
                {category}
                <ChevronDown size={12} className={`text-[#9ea6b3] transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-[42px] z-50 min-w-[130px] overflow-hidden rounded-[12px] border border-[#eaedf2] bg-white py-[5px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                  {categories.map((cat) => (
                    <button key={cat} type="button"
                      onClick={() => { setCategory(cat); setCatOpen(false) }}
                      className={['flex w-full px-[13px] py-[8px] text-left text-[13px] transition hover:bg-[#f5f6f8]',
                        cat === category ? 'font-semibold text-[#1f2430]' : 'font-medium text-[#3d4455]'].join(' ')}
                    >{cat}</button>
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
            placeholder={`${category}：CapCut – Mate AI video 投放计划 – ${dateStr}`}
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
              {flowSteps.map((step, i) => (
                <div key={step.id} className="flex w-full flex-col items-center">
                  <FlowStepCard step={step} />
                  {i < flowSteps.length - 1 && <div className="h-[20px] w-px bg-[#d4d8e0]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-[28px] flex items-center justify-end gap-[10px]">
          <button type="button" onClick={onClose}
            className="h-[40px] rounded-[11px] border border-[#d7dbe3] px-[20px] text-[14px] font-medium text-[#4b5260] transition hover:bg-[#f7f8fa]">
            取消
          </button>
          <button type="button"
            onClick={() => {
              const finalName = name.trim() || `${category}：CapCut – Mate AI video 投放计划 – ${dateStr}`
              addSkill({ title: finalName, desc: desc.trim(), category })
              navigate(`/skill/library/${categorySlugMap[category]}`)
              onClose()
            }}
            className="h-[40px] rounded-[11px] bg-[#0f1219] px-[20px] text-[14px] font-medium text-white transition hover:bg-[#2a3040]">
            创建Skill
          </button>
        </div>
        </div>
      </div>
    </div>,
    portalTarget,
  )
}

function PublishSkillModal({ onClose }: { onClose: () => void }) {
  const { embeddedScale, isEmbeddedInIframe } = useDesktopLayout()
  const portalTarget = useModalPortalTarget()
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!portalTarget) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[3px]"
      onClick={handleBackdrop}
    >
      <div style={isEmbeddedInIframe ? { transform: `scale(${embeddedScale})` } : undefined}>
        <div className="relative mx-[20px] w-full max-w-[820px] rounded-[24px] bg-white px-[22px] pb-[24px] pt-[16px] shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[18px] font-semibold text-[#202531]">创建发布Skill</div>
            <div className="mt-[6px] text-[12px] text-[#b0b7c2]">
              上传您的 Skill 文件，审核通过后将同步展示在 SkillHub 技能广场
            </div>
          </div>
          <button
            type="button"
            className="flex h-[36px] items-center gap-[6px] rounded-[10px] bg-black px-[12px] text-[13px] font-medium text-white"
          >
            <AtomBottomIcon5 size={16} className="text-white" />
            发布Skill
          </button>
        </div>

        <div className="mt-[18px]">
          <div className="text-[13px] font-medium text-[#202531]">Skill 文件 *</div>
          <div className="mt-[8px] rounded-[12px] border border-[#eceff3] px-[20px] py-[28px]">
            <div className="mx-auto flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#f5f6f8] text-[#6b7280]">
              <AtomBottomIcon6 size={18} className="text-[#6b7280]" />
            </div>
            <div className="mt-[10px] text-center text-[13px] font-medium text-[#202531]">
              拖拽文件或 zip 包到此处
            </div>
            <div className="mt-[6px] text-center text-[12px] text-[#b0b7c2]">
              请确保文件夹或压缩包中包含 SKILL.md 文件（最多 200 个，总大小不超过 10.00 MB）
            </div>
            <div className="mt-[14px] flex items-center justify-center gap-[10px]">
              <button
                type="button"
                className="flex h-[30px] items-center gap-[6px] rounded-full bg-[#0f1219] px-[12px] text-[12px] font-medium text-white"
              >
                <AtomBottomIcon6 size={14} className="text-white" />
                选择文件夹
              </button>
              <button
                type="button"
                className="flex h-[30px] items-center gap-[6px] rounded-full border border-[#d9dde5] bg-white px-[12px] text-[12px] font-medium text-[#4b5260]"
              >
                <AtomBottomIcon1 size={14} className="text-[#4b5260]" />
                选择 zip 文件
              </button>
            </div>
          </div>
        </div>

        {[
          { label: 'Slug *', placeholder: 'Skill的唯一标识符，仅允许小写字母、数字和连字符' },
          { label: '显示名称 *', placeholder: 'Skill显示名称' },
          { label: '描述 *', placeholder: '该描述会从SKILL.md文件的description字段中自动提取，也支持手动修改' },
          { label: '版本号 *', placeholder: '1.0.0' },
        ].map((item) => (
          <div key={item.label} className="mt-[14px]">
            <div className="text-[13px] font-medium text-[#202531]">{item.label}</div>
            <input
              className="mt-[8px] h-[40px] w-full rounded-[10px] border border-[#eceff3] px-[12px] text-[13px] text-[#202531] outline-none placeholder:text-[#c0c6cf]"
              placeholder={item.placeholder}
            />
          </div>
        ))}

        <div className="mt-[14px]">
          <div className="text-[13px] font-medium text-[#202531]">发布描述</div>
          <textarea
            className="mt-[8px] min-h-[120px] w-full resize-none rounded-[12px] border border-[#eceff3] px-[12px] py-[10px] text-[13px] leading-[20px] text-[#202531] outline-none placeholder:text-[#c0c6cf]"
            placeholder="描述本次版本的主要变更内容"
          />
        </div>
        </div>
      </div>
    </div>,
    portalTarget,
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function SkillManagement({ modalMode }: { modalMode?: 'create' }) {
  const navigate = useNavigate()
  const { viewKey, categoryKey } = useParams()
  const { skills } = usePlatform()
  const { rootMinWidthClass, widePagePaddingClass } = useDesktopShellClasses()

  // New Skill design:
  // - `/skill/ability` => "我的Skill" (radar)
  // - `/skill/library` => "Skill市场" (market cards)
  // - `/skill/detail/:id` => Skill详情
  const activeTab: 'mine' | 'market' | 'detail' =
    viewKey === 'library' ? 'market' : viewKey === 'detail' ? 'detail' : 'mine'

  const activeCategory: SkillCategory =
    categoryKey && slugCategoryMap[categoryKey] ? slugCategoryMap[categoryKey] : categories[0]

  const enabledCount = useMemo(() => skills.filter((s) => s.enabled).length, [skills])

  const skillViewTransitionKey = `${activeTab}-${activeCategory}`

  // Ability view category dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Create dropdown (top-right)
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const createMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!createMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [createMenuOpen])

  const showModal = modalMode === 'create'

  const marketCards = useMemo<SkillMarketCardData[]>(
    () => [
      {
        id: 1,
        title: 'Instagram Creator 搜索',
        tag: '达人营销',
        tagTone: 'orange' as const,
        desc: '扫描创作者账号、内容调性和互动表现，快速筛选适合本次 campaign 的合作达人。',
        author: 'Nova Lin',
        likes: '1.8k',
        stars: '124',
        mine: true,
        starred: true,
        status: '已上架',
      },
      {
        id: 2,
        title: 'X 热点监听',
        tag: '达人营销',
        tagTone: 'orange' as const,
        desc: '聚合品牌词、竞品与创作者话题热度，自动输出舆情波动和热点切入建议。',
        author: 'Yuki Zhang',
        likes: '2.3k',
        stars: '208',
        mine: false,
        starred: true,
        status: '已上架',
      },
      {
        id: 3,
        title: 'Ahrefs 关键词猎手',
        tag: 'PSEO',
        tagTone: 'green' as const,
        desc: '围绕关键词难度、外链和竞品流量构建 SEO 机会池，输出优先级清单。',
        author: 'Miya Chen',
        likes: '1.2k',
        stars: '96',
        mine: true,
        starred: false,
        status: '已上架',
      },
      {
        id: 4,
        title: 'Google Analytics 自然流量诊断',
        tag: 'PSEO',
        tagTone: 'green' as const,
        desc: '回看自然流量来源、落地页转化与关键事件数据，定位内容和页面的真实短板。',
        author: 'Ari Wang',
        likes: '1.6k',
        stars: '118',
        mine: false,
        starred: true,
        status: '已上架',
      },
      {
        id: 5,
        title: 'Meta Ads 巡检助手',
        tag: 'Paid Ads',
        tagTone: 'green' as const,
        desc: '自动检查预算消耗、学习受限、创意疲劳和受众重叠，输出投放巡检结论。',
        author: 'Leo Xu',
        likes: '2.6k',
        stars: '176',
        mine: true,
        starred: true,
        status: '已上架',
      },
      {
        id: 6,
        title: 'Tableau 投放复盘面板',
        tag: 'Paid Ads',
        tagTone: 'orange' as const,
        desc: '串联素材、预算、转化和渠道贡献数据，一键生成投放复盘和项目复用面板。',
        author: 'Nova Lin',
        likes: '2.1k',
        stars: '142',
        mine: false,
        starred: false,
        status: '已上架',
      },
      {
        id: 7,
        title: 'Pinterest 灵感整理师',
        tag: '创意生产',
        tagTone: 'orange' as const,
        desc: '归档高表现创意版式、视觉语言和灵感素材，帮助快速完成创意提案准备。',
        author: 'Rita Gu',
        likes: '1.4k',
        stars: '88',
        mine: false,
        starred: true,
        status: '已上架',
      },
      {
        id: 8,
        title: 'GitHub 落地页发布协同',
        tag: '创意生产',
        tagTone: 'green' as const,
        desc: '同步素材、文案与页面改动状态，降低创意上线和回归检查的沟通成本。',
        author: 'Leo Xu',
        likes: '1.1k',
        stars: '73',
        mine: true,
        starred: false,
        status: '已上架',
      },
    ],
    [],
  )

  const [marketMineOnly, setMarketMineOnly] = useState(false)
  const [marketStarredOnly, setMarketStarredOnly] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)

  const selectedMarketCard = useMemo(
    () => marketCards.find((card) => String(card.id) === categoryKey) ?? marketCards[0],
    [categoryKey, marketCards],
  )
  const visibleMarketCards = useMemo(
    () =>
      marketCards.filter((card) => {
        const matchesCategory = card.tag === activeCategory
        const matchesMine = !marketMineOnly || card.mine
        const matchesStarred = !marketStarredOnly || card.starred

        return matchesCategory && matchesMine && matchesStarred
      }),
    [activeCategory, marketCards, marketMineOnly, marketStarredOnly],
  )

  return (
    <>
      <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
        <div className={`flex-1 overflow-hidden ${widePagePaddingClass} pb-[30px] pt-[54px]`}>
          <div className="mx-auto flex h-full w-full max-w-[1180px] flex-col">
            {/* Top bar: tabs + create button */}
            <div className="flex flex-shrink-0 items-start justify-between">
              <div className="flex items-center gap-[24px]">
                <button
                  type="button"
                  onClick={() => navigate('/skill/ability')}
                  className={[
                    'relative pb-[10px] text-[22px] font-semibold leading-[26px] tracking-[-0.02em]',
                    activeTab === 'mine' ? 'text-[#202531]' : 'text-[#c0c6cf]',
                  ].join(' ')}
                >
                  我的Skill
                  {activeTab === 'mine' && (
                    <span className="absolute left-1/2 bottom-[2px] h-[3px] w-[28px] -translate-x-1/2 rounded-full bg-[#202531]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/skill/library')}
                  className={[
                    'relative pb-[10px] text-[22px] font-semibold leading-[26px] tracking-[-0.02em]',
                    activeTab === 'market' ? 'text-[#202531]' : 'text-[#c0c6cf]',
                  ].join(' ')}
                >
                  Skill市场
                  {activeTab === 'market' && (
                    <span className="absolute left-1/2 bottom-[2px] h-[3px] w-[28px] -translate-x-1/2 rounded-full bg-[#202531]" />
                  )}
                </button>
              </div>
              <div ref={createMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCreateMenuOpen((v) => !v)
                    setDropdownOpen(false)
                  }}
                  className="flex h-[40px] items-center gap-[8px] rounded-[10px] bg-black px-[16px] text-[14px] font-medium text-white"
                >
                  <Plus size={16} strokeWidth={1.9} />
                  创建Skill
                </button>

                {createMenuOpen ? (
                  <div className="absolute right-0 top-[48px] z-50 w-[420px] rounded-[22px] border border-[#eef0f3] bg-white p-[14px] shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
                    {[
                      {
                        icon: <AtomBottomIcon1 size={18} className="text-[#11161f]" />,
                        title: '手动创建 skill',
                        subtitle: '跳转到 Aime 平台创建 skill',
                        onClick: () => {
                          setPublishModalOpen(true)
                          setCreateMenuOpen(false)
                        },
                      },
                      {
                        icon: <AtomBottomIcon2 size={18} className="text-[#11161f]" />,
                        title: '上传 ZIP 文件创建 skill',
                        subtitle: '上传包含 skill 代码的 ZIP 压缩包',
                        onClick: () => {
                          setPublishModalOpen(true)
                          setCreateMenuOpen(false)
                        },
                      },
                      {
                        icon: <AtomBottomIcon3 size={18} className="text-[#11161f]" />,
                        title: '从代码库导入创建 skill',
                        subtitle: '输入代码库地址导入 skill',
                        onClick: () => {
                          setPublishModalOpen(true)
                          setCreateMenuOpen(false)
                        },
                      },
                      {
                        icon: <AtomBottomIcon4 size={18} className="text-[#11161f]" />,
                        title: '上传 ZIP 文件创建 plugin',
                        subtitle: '上传包含 plugin 代码的压缩文件',
                        onClick: () => {
                          setPublishModalOpen(true)
                          setCreateMenuOpen(false)
                        },
                      },
                    ].map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={item.onClick}
                        className="flex w-full items-center gap-[18px] rounded-[16px] px-[8px] py-[10px] text-left transition hover:bg-[#f7f8fa]"
                      >
                        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[14px] border border-[#eef0f3] bg-white">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[18px] font-semibold tracking-[-0.02em] text-[#1f2430]">
                            {item.title}
                          </div>
                          <div className="mt-[4px] text-[14px] leading-[20px] text-[#a5adba]">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <AnimatedSection activeKey={skillViewTransitionKey} className="mt-[26px] min-h-0 flex-1">
              {activeTab === 'detail' ? (
                <div className="h-full overflow-y-auto pr-[2px]">
                  <button
                    type="button"
                    onClick={() => navigate('/skill/library')}
                    className="flex h-[34px] items-center gap-[8px] rounded-[10px] border border-[#eaedf2] bg-white px-[12px] text-[13px] font-medium text-[#4b5260]"
                  >
                    <ArrowLeft size={15} strokeWidth={1.9} />
                    返回
                  </button>

                  <div className="mt-[18px] flex items-start justify-between gap-[20px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-[10px]">
                        <h1 className="text-[36px] font-semibold tracking-[-0.03em] text-[#202531]">
                          {selectedMarketCard.title}
                        </h1>
                        <span className="rounded-[8px] bg-[#fff3df] px-[8px] py-[2px] text-[12px] font-medium text-[#f0b61c]">
                          达人营销
                        </span>
                        <span className="rounded-[8px] bg-[#f5f6f8] px-[8px] py-[2px] text-[12px] font-medium text-[#9ea6b3]">
                          V1.4
                        </span>
                      </div>
                      <div className="mt-[10px] max-w-[760px] text-[13px] leading-[22px] text-[#a3abb8]">
                        触发：直播/热榜/抖音/微博/小红书/推特/头条/百度；社交媒体语义搜索（微博/微信/小红书/抖音/任意通道）；查询动作库/账号近期发文动态；查 AI 行业资讯（论文/博客/模型发布/口碑/深度摘要）。不触发：通用知识问答、代码生成、静态事实类问题。
                      </div>
                    </div>
                    <div className="flex items-center gap-[18px] pt-[6px] text-[13px] text-[#6b7280]">
                      <span className="flex items-center gap-[6px]"><ThumbsUp size={14} strokeWidth={1.8} />5.4k</span>
                      <span className="flex items-center gap-[6px]"><Star size={14} strokeWidth={1.8} />9</span>
                      <span className="flex items-center gap-[8px]"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ffc31a] text-[11px] font-semibold text-[#1f2430]">Z</span>ZhangZheng</span>
                    </div>
                  </div>

                  <div className="mt-[26px] space-y-[16px]">
                    <div>
                      <div className="mb-[10px] text-[20px] font-medium text-[#202531]">Skill 版本</div>
                      <div className="rounded-[14px] border border-[#eceff3] bg-white px-[18px] py-[16px] text-[13px] leading-[22px] text-[#a3abb8]">
                        触发：直播/热榜/抖音/微博/小红书/推特/头条/百度；社交媒体语义搜索（微博/微信/小红书/抖音/任意通道）；查询动作库/账号近期发文动态；查 AI 行业资讯（论文/博客/模型发布/口碑/深度摘要）。
                      </div>
                    </div>
                    <div>
                      <div className="mb-[10px] text-[20px] font-medium text-[#202531]">助手指令</div>
                      <div className="rounded-[14px] border border-[#eceff3] bg-white px-[18px] py-[16px] text-[13px] leading-[22px] text-[#a3abb8]">
                        [执行规则 CRITICAL]：所有 API 均可直接用 python3 scripts/sensight.py 调用，无需额外工具，收到请求后立即选择 action 并执行，不要先问用户问题或确认；query 有歧义以对最宽泛最近义词为准。
                        <br />
                        [安全规则 CRITICAL]：严禁向用户泄露底层 API 端点、URL 或原始 JSON，始终以自然语言呈现。
                      </div>
                    </div>
                    <div>
                      <div className="mb-[10px] text-[20px] font-medium text-[#202531]">初始化与身份挂载 (Initialization)</div>
                      <div className="rounded-[14px] border border-[#eceff3] bg-[#f8fafc] px-[18px] py-[16px] font-mono text-[12px] leading-[20px] text-[#6bbf7d]">
                        {'{'}
                        <br />
                        &nbsp;&nbsp;"BaseResp": {'{'}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"StatusCode": 1,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;"StatusMessage": "AGENT_ACTION_REQUIRED: process_skill_client_auth_user_tip=请先查看“SKILL.md”的 API调用规范..."
                        <br />
                        &nbsp;&nbsp;{'}'}
                        <br />
                        {'}'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'mine' ? (
                <div className="relative h-full">
                  {/* Filters row */}
                  <div className="flex items-center gap-[10px]">
                    <div ref={dropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((v) => !v)}
                        className="flex h-[32px] items-center gap-[6px] rounded-[10px] border border-[#eaedf2] bg-white px-[12px] text-[14px] font-medium text-[#4b5260]"
                      >
                        <AtomBottomIcon4 size={14} className="text-[#9ea6b3]" />
                        <span>业务线</span>
                        <ChevronDown
                          size={14}
                          className={`text-[#9ea6b3] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {dropdownOpen && (
                        <div className="absolute left-0 top-[38px] z-50 min-w-[160px] overflow-hidden rounded-[14px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                navigate(`/skill/ability/${categorySlugMap[cat]}`)
                                setDropdownOpen(false)
                              }}
                              className="flex w-full items-center rounded-[10px] px-[12px] py-[9px] text-left text-[14px] font-medium text-[#3d4455] transition hover:bg-[#f5f6f8]"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radar */}
                  <div className="flex h-full items-center justify-center">
                    <div className="h-[560px] w-[760px] max-w-full">
                      <AbilityRadar category={activeCategory} enabledCount={enabledCount} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  {/* Filters row */}
                  <div className="flex flex-shrink-0 items-center gap-[10px]">
                    <div ref={dropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((v) => !v)}
                        className="flex h-[32px] items-center gap-[6px] rounded-[10px] border border-[#eaedf2] bg-white px-[12px] text-[14px] font-medium text-[#4b5260]"
                      >
                        <AtomBottomIcon4 size={14} className="text-[#9ea6b3]" />
                        <span>业务线</span>
                        <ChevronDown
                          size={14}
                          className={`text-[#9ea6b3] transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {dropdownOpen && (
                        <div className="absolute left-0 top-[38px] z-50 min-w-[160px] overflow-hidden rounded-[14px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                navigate(`/skill/library/${categorySlugMap[cat]}`)
                                setDropdownOpen(false)
                              }}
                              className="flex w-full items-center rounded-[10px] px-[12px] py-[9px] text-left text-[14px] font-medium text-[#3d4455] transition hover:bg-[#f5f6f8]"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setMarketMineOnly((v) => !v)}
                      className={[
                        'flex h-[32px] items-center rounded-[10px] border px-[12px] text-[14px] font-medium transition',
                        marketMineOnly
                          ? 'border-[#2b313f]/20 bg-[#f3f4f7] text-[#1f2430]'
                          : 'border-[#eaedf2] bg-white text-[#4b5260]',
                      ].join(' ')}
                    >
                      我贡献的
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarketStarredOnly((v) => !v)}
                      className={[
                        'flex h-[32px] items-center rounded-[10px] border px-[12px] text-[14px] font-medium transition',
                        marketStarredOnly
                          ? 'border-[#2b313f]/20 bg-[#f3f4f7] text-[#1f2430]'
                          : 'border-[#eaedf2] bg-white text-[#4b5260]',
                      ].join(' ')}
                    >
                      我收藏的
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="mt-[14px] min-h-0 flex-1 overflow-y-auto pr-[2px]">
                    {visibleMarketCards.length ? (
                      <div className="grid grid-cols-2 gap-[12px]">
                        {visibleMarketCards.map((card) => (
                          <SkillMarketCard
                            key={card.id}
                            card={card}
                            onClick={() => navigate(`/skill/detail/${card.id}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[22px] border border-[#eceff3] bg-[#fbfcfd] px-[28px] py-[36px] text-center text-[15px] text-[#9ca5b4]">
                        当前筛选条件下暂无 Skill。
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </div>

      {showModal && (
        <NewSkillModal
          defaultCategory={activeCategory}
          onClose={() => navigate(activeTab === 'market' ? `/skill/library/${categorySlugMap[activeCategory]}` : '/skill/ability')}
        />
      )}
      {publishModalOpen ? <PublishSkillModal onClose={() => setPublishModalOpen(false)} /> : null}
    </>
  )
}
