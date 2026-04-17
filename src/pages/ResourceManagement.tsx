import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus, Puzzle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import BrandDirectoryCard from '../components/BrandDirectoryCard'
import PlatformModal from '../components/PlatformModal'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { type ResourceCategory, usePlatform } from '../context/PlatformContext'
import { getBrandLogo } from '../utils/brandLogos'

type BusinessLine = '全部业务线' | '广告投放' | '达人营销' | 'SEO'

type SeededResource = {
  title: string
  desc: string
  category: ResourceCategory
  lines: Array<Exclude<BusinessLine, '全部业务线'>>
  contributed: boolean
  favorite: boolean
}

type VisibleResourceCard = {
  title: string
  desc: string
  lines: Array<Exclude<BusinessLine, '全部业务线'>>
  contributed: boolean
  favorite: boolean
  logoSrc: string | null
  status: string
  fallbackIcon?: string
}

const businessLines: BusinessLine[] = ['全部业务线', '广告投放', '达人营销', 'SEO']

const inputClassName =
  'mt-[10px] h-[56px] w-full rounded-[16px] border border-[#eceff3] px-[18px] text-[17px] text-[#2d3340] outline-none placeholder:text-[#b6bcc7]'
const textareaClassName =
  'mt-[10px] min-h-[112px] w-full resize-none rounded-[16px] border border-[#eceff3] px-[18px] py-[16px] text-[17px] leading-[28px] text-[#2d3340] outline-none placeholder:text-[#b6bcc7]'

const seededResources: SeededResource[] = [
  {
    title: 'Tableau 数据可视化',
    desc: '汇总预算、ROI、达人转化与自然流量，生成统一的经营可视化看板。',
    category: '报告',
    lines: ['广告投放', '达人营销', 'SEO'],
    contributed: true,
    favorite: true,
  },
  {
    title: 'Google Analytics 报告',
    desc: '分析站点来源、转化路径与关键事件表现，用于落地页和自然流量复盘。',
    category: '报告',
    lines: ['广告投放', 'SEO'],
    contributed: true,
    favorite: false,
  },
  {
    title: 'X（Twitter）舆情追踪',
    desc: '监测品牌词、竞品与创作者讨论热度，快速捕捉实时话题和舆情变化。',
    category: '监控',
    lines: ['达人营销', 'SEO'],
    contributed: false,
    favorite: true,
  },
  {
    title: 'Ahrefs SEO 研究',
    desc: '查看关键词难度、外链和自然流量机会，辅助 SEO 选题与竞争分析。',
    category: '监控',
    lines: ['SEO'],
    contributed: true,
    favorite: true,
  },
  {
    title: 'GitHub 发布协作',
    desc: '管理官网、脚本与自动化仓库，跟踪需求变更并同步资源交付状态。',
    category: '自动化',
    lines: ['广告投放', '达人营销', 'SEO'],
    contributed: true,
    favorite: false,
  },
  {
    title: 'Meta Ads Manager',
    desc: '统一管理 Facebook 与 Instagram 广告系列、素材、受众和预算表现。',
    category: '常规',
    lines: ['广告投放'],
    contributed: true,
    favorite: true,
  },
  {
    title: 'Similarweb 市场洞察',
    desc: '比较站点流量来源、地区分布与竞品份额，辅助市场和投放策略判断。',
    category: '监控',
    lines: ['广告投放', 'SEO'],
    contributed: false,
    favorite: true,
  },
  {
    title: 'Instagram Creator 搜索',
    desc: '用于筛选达人账号、查看内容风格与互动质量，支持合作前评估。',
    category: '常规',
    lines: ['达人营销'],
    contributed: true,
    favorite: false,
  },
  {
    title: 'YouTube 趋势洞察',
    desc: '跟踪长视频与 Shorts 热门主题、频道表现和内容趋势机会。',
    category: '监控',
    lines: ['达人营销', 'SEO'],
    contributed: false,
    favorite: true,
  },
  {
    title: 'LinkedIn 品牌主页',
    desc: '管理品牌动态、案例与雇主内容，对外沉淀 B2B 传播和招聘资产。',
    category: '常规',
    lines: ['达人营销'],
    contributed: false,
    favorite: false,
  },
  {
    title: 'Pinterest 灵感板',
    desc: '收集视觉参考、内容方向和高互动素材，用于创意提案与选题整理。',
    category: '常规',
    lines: ['达人营销'],
    contributed: true,
    favorite: true,
  },
  {
    title: 'Gmail 邮件回执',
    desc: '集中处理合作邀约、报表回执与审批邮件，减少跨团队沟通遗漏。',
    category: '自动化',
    lines: ['广告投放', '达人营销', 'SEO'],
    contributed: false,
    favorite: false,
  },
] as const

const legacyResourceTitles = new Set([
  '晨间简报',
  '热点调研',
  '竞品调研',
  '邮件检查',
  '素材表现周报',
  '达人素材池',
  '预算预警',
  'Campaign 复盘看板',
  '灵感灵感库',
  '审批自动同步',
])

const seededTitles = new Set(seededResources.map((item) => item.title))

const initialDraft = {
  title: 'Tableau 数据可视化',
  category: '报告' as ResourceCategory,
  desc: '汇总预算、ROI、达人转化与自然流量，生成统一的经营可视化看板。',
}

function getResourceLines(category: ResourceCategory): Array<Exclude<BusinessLine, '全部业务线'>> {
  switch (category) {
    case '监控':
      return ['广告投放', 'SEO']
    case '常规':
    case '报告':
    case '自动化':
    default:
      return ['广告投放', '达人营销', 'SEO']
  }
}

export default function ResourceManagement({ modalMode }: { modalMode?: 'create' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { resources, addResource } = usePlatform()
  const { isCompactDesktop, rootMinWidthClass, widePagePaddingClass, widePageMaxWidthClass } = useDesktopShellClasses()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [draft, setDraft] = useState(initialDraft)
  const [activeLine, setActiveLine] = useState<BusinessLine>('全部业务线')
  const [showContributedOnly, setShowContributedOnly] = useState(false)
  const [showFavoritedOnly, setShowFavoritedOnly] = useState(false)
  const [showLineMenu, setShowLineMenu] = useState(false)
  const lineMenuRef = useRef<HTMLDivElement>(null)

  const resolvedModalMode = modalMode ?? (location.pathname === '/resource/new' ? 'create' : undefined)

  useEffect(() => {
    setShowCreateModal(resolvedModalMode === 'create')
  }, [resolvedModalMode])

  useEffect(() => {
    if (!showLineMenu) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (lineMenuRef.current && !lineMenuRef.current.contains(event.target as Node)) {
        setShowLineMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLineMenu])

  const userResources = useMemo(() => {
    return resources.filter((item) => !legacyResourceTitles.has(item.title) && !seededTitles.has(item.title))
  }, [resources])

  const allResources = useMemo<VisibleResourceCard[]>(() => {
    const createdResources: VisibleResourceCard[] = userResources.map((item) => ({
      ...item,
      lines: getResourceLines(item.category),
      contributed: true,
      favorite: false,
      logoSrc: getBrandLogo(item.title),
      status: '已添加',
      fallbackIcon: item.icon,
    }))

    return [
      ...seededResources.map((item) => ({
        ...item,
        logoSrc: getBrandLogo(item.title),
        status: '已绑定',
      })),
      ...createdResources,
    ]
  }, [userResources])

  const visibleResources = useMemo(() => {
    return allResources.filter((item) => {
      if (activeLine !== '全部业务线' && !item.lines.includes(activeLine)) {
        return false
      }

      if (showContributedOnly && !item.contributed) {
        return false
      }

      if (showFavoritedOnly && !item.favorite) {
        return false
      }

      return true
    })
  }, [activeLine, allResources, showContributedOnly, showFavoritedOnly])

  const filterTransitionKey = `${activeLine}-${showContributedOnly ? 'contributed' : 'all'}-${showFavoritedOnly ? 'favorited' : 'normal'}`
  const directoryMaxWidthClass = isCompactDesktop ? widePageMaxWidthClass : 'max-w-[960px]'

  return (
    <>
      <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
        <div className={`flex-1 overflow-y-auto ${widePagePaddingClass} pb-[36px] pt-[54px]`}>
          <div className={`mx-auto w-full ${widePageMaxWidthClass}`}>
            <div className="flex items-start justify-between gap-[20px]">
              <div>
                <div className="text-[26px] font-semibold tracking-[-0.045em] text-[#202531]">资源管理</div>
                <div className="mt-[10px] text-[14px] leading-[22px] text-[#a5adba]">
                  统一管理团队已接入的分析、投放、创作者和协作工具，方便在任务中直接复用。
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/resource/new')}
                className="flex h-[52px] items-center gap-[10px] rounded-[14px] bg-black px-[22px] text-[15px] font-medium text-white"
              >
                <Plus size={18} strokeWidth={1.8} />
                新建资源
              </button>
            </div>

            <div className="mt-[34px] flex items-center gap-[14px]">
              <div ref={lineMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowLineMenu((current) => !current)}
                  className="flex h-[48px] items-center gap-[10px] rounded-[14px] border border-[#e7ebf0] bg-white px-[18px] text-[15px] font-medium text-[#202531] transition hover:bg-[#fafbfc]"
                >
                  <Puzzle size={16} strokeWidth={1.8} className="text-[#333947]" />
                  业务线
                  <ChevronDown
                    size={16}
                    className={`text-[#9aa2af] transition-transform ${showLineMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                {showLineMenu ? (
                  <div className="absolute left-0 top-[56px] z-20 min-w-[168px] overflow-hidden rounded-[16px] border border-[#eaedf2] bg-white py-[6px] shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                    {businessLines.map((line) => {
                      const isActive = line === activeLine

                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => {
                            setActiveLine(line)
                            setShowLineMenu(false)
                          }}
                          className={`flex w-full items-center justify-between px-[14px] py-[10px] text-left text-[14px] transition ${
                            isActive ? 'bg-[#f6f7f9] font-medium text-[#202531]' : 'text-[#596171] hover:bg-[#f8f9fb]'
                          }`}
                        >
                          {line}
                          {isActive ? <span className="text-[#9aa2af]">当前</span> : null}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setShowContributedOnly((current) => !current)}
                className={`flex h-[48px] items-center gap-[10px] rounded-[14px] border px-[18px] text-[15px] font-medium transition ${
                  showContributedOnly
                    ? 'border-[#eef0f3] bg-[#f5f6f8] text-[#202531]'
                    : 'border-[#e7ebf0] bg-white text-[#202531] hover:bg-[#fafbfc]'
                }`}
              >
                <Puzzle size={16} strokeWidth={1.8} className="text-[#333947]" />
                我贡献的
              </button>

              <button
                type="button"
                onClick={() => setShowFavoritedOnly((current) => !current)}
                className={`flex h-[48px] items-center gap-[10px] rounded-[14px] border px-[18px] text-[15px] font-medium transition ${
                  showFavoritedOnly
                    ? 'border-[#eef0f3] bg-[#f5f6f8] text-[#202531]'
                    : 'border-[#e7ebf0] bg-white text-[#202531] hover:bg-[#fafbfc]'
                }`}
              >
                <Puzzle size={16} strokeWidth={1.8} className="text-[#333947]" />
                我收藏的
              </button>
            </div>

            <div className={`mt-[28px] w-full ${directoryMaxWidthClass}`}>
              <AnimatedSection activeKey={filterTransitionKey}>
                {visibleResources.length ? (
                  <div className="stagger-children grid grid-cols-2 gap-[12px]">
                    {visibleResources.map((item) => (
                      <BrandDirectoryCard
                        key={item.title}
                        title={item.title}
                        desc={item.desc}
                        logoSrc={item.logoSrc}
                        fallbackIcon={item.fallbackIcon}
                        status={item.status}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-[#eceff3] bg-[#fbfcfd] px-[28px] py-[36px] text-center text-[15px] text-[#9ca5b4]">
                    当前筛选条件下暂无资源。
                  </div>
                )}
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <PlatformModal
          title="新建资源"
          subtitle="录入新的常用资源，方便团队在不同任务中快速复用。"
          onClose={() => navigate('/resource')}
          footer={
            <>
              <button
                type="button"
                onClick={() => navigate('/resource')}
                className="h-[52px] rounded-[16px] border border-[#d7dbe3] px-[22px] text-[18px] font-medium text-[#4b5260]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!draft.title.trim()) {
                    return
                  }

                  addResource({
                    title: draft.title.trim(),
                    desc: draft.desc.trim() || initialDraft.desc,
                    category: draft.category,
                    icon: '🧩',
                  })
                  navigate('/resource')
                }}
                className="h-[52px] rounded-[16px] bg-black px-[22px] text-[18px] font-medium text-white"
              >
                新建资源
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-[16px]">
            <label className="text-[16px] font-medium text-[#2d3340]">
              资源名称
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className={inputClassName}
                placeholder="例如 Tableau 数据可视化"
              />
            </label>
            <label className="text-[16px] font-medium text-[#2d3340]">
              资源分类
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value as ResourceCategory }))
                }
                className={inputClassName}
              >
                {(['常规', '监控', '报告', '自动化'] as ResourceCategory[]).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-[18px] block text-[16px] font-medium text-[#2d3340]">
            资源说明
            <textarea
              value={draft.desc}
              onChange={(event) => setDraft((current) => ({ ...current, desc: event.target.value }))}
              className={textareaClassName}
              placeholder="例如：用于汇总多渠道投放与转化数据的统一看板资源。"
            />
          </label>
        </PlatformModal>
      ) : null}
    </>
  )
}
