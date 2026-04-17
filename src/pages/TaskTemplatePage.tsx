import { useMemo } from 'react'
import { Check, ChevronDown, Copy, Plus, Sparkles, Star } from 'lucide-react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AnimatedSection from '../components/AnimatedSection'
import CreateTaskModal from '../components/CreateTaskModal'
import PlatformModal from '../components/PlatformModal'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { type PlatformTemplate, usePlatform } from '../context/PlatformContext'

function Metric({
  title,
  value,
  change,
  color,
}: {
  title: string
  value: string
  change: string
  color: string
}) {
  return (
    <div className="panel-border rounded-[18px] bg-white px-[16px] py-[16px]">
      <div className="text-[14px] font-medium text-[#8f97a6]">{title}</div>
      <div className="mt-[14px] flex items-end gap-[6px]">
        <div className="text-[32px] font-medium leading-[36px] tracking-[-0.04em] text-[#202531]">{value}</div>
        <div className="mb-[5px] text-[14px] font-medium" style={{ color }}>
          ↗ {change}
        </div>
      </div>
    </div>
  )
}

export default function TaskTemplatePage({
  modalMode,
}: {
  modalMode?: 'create' | 'detail' | 'use'
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { templateId } = useParams()
  const { templates, tasks, addTask, addTemplate, toggleTemplateFavorite } = usePlatform()
  const { rootMinWidthClass, mediumPagePaddingClass } = useDesktopShellClasses()
  const activeTab = searchParams.get('tab') === 'favorites' ? 'favorites' : 'all'
  const showRecommendedOnly = searchParams.get('recommended') === '1'

  const templateMetrics = useMemo(
    () => [
      { title: '可用模板', value: `${templates.length}`, change: '4%', color: '#12d88d' },
      { title: '本周使用', value: `${tasks.length * 27}`, change: '11%', color: '#f0b61c' },
      {
        title: '复用成功率',
        value: `${Math.min(98, 80 + templates.filter((item) => item.recommended).length * 2)}%`,
        change: '3%',
        color: '#12d88d',
      },
      {
        title: '平均节省时长',
        value: `${(1.5 + templates.length * 0.2).toFixed(1)}h`,
        change: '8%',
        color: '#12d88d',
      },
    ],
    [tasks.length, templates],
  )

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (activeTab === 'favorites' && !template.favorite) {
        return false
      }
      if (showRecommendedOnly && !template.recommended) {
        return false
      }
      return true
    })
  }, [activeTab, showRecommendedOnly, templates])

  const resolvedModalMode =
    modalMode ??
    (location.pathname === '/ad-placement/template/new'
      ? 'create'
      : location.pathname.startsWith('/ad-placement/template/use/')
        ? 'use'
        : location.pathname.startsWith('/ad-placement/template/') && templateId
          ? 'detail'
          : undefined)

  const selectedTemplate = useMemo<PlatformTemplate | null>(() => {
    if (!templateId || resolvedModalMode !== 'detail') {
      return null
    }
    return templates.find((template) => template.id === Number(templateId)) ?? null
  }, [resolvedModalMode, templateId, templates])

  const templateForCreation = useMemo<PlatformTemplate | null>(() => {
    if (!templateId || resolvedModalMode !== 'use') {
      return null
    }
    return templates.find((template) => template.id === Number(templateId)) ?? null
  }, [resolvedModalMode, templateId, templates])

  const showCreateModal = resolvedModalMode === 'create' || resolvedModalMode === 'use'
  const templateSearch = searchParams.toString()
  const templateResultsKey = `${activeTab}-${showRecommendedOnly ? 'recommended' : 'all'}`

  const updateTemplateFilters = (nextValues: { tab?: 'all' | 'favorites'; recommended?: boolean }) => {
    const nextSearch = new URLSearchParams(searchParams)
    const nextTab = nextValues.tab ?? activeTab
    const nextRecommended = nextValues.recommended ?? showRecommendedOnly

    if (nextTab === 'favorites') {
      nextSearch.set('tab', 'favorites')
    } else {
      nextSearch.delete('tab')
    }

    if (nextRecommended) {
      nextSearch.set('recommended', '1')
    } else {
      nextSearch.delete('recommended')
    }

    setSearchParams(nextSearch, { replace: true })
  }

  return (
    <>
      <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
        <div className={`flex-1 overflow-y-auto ${mediumPagePaddingClass} pb-[36px] pt-[54px]`}>
          <div className="flex items-start justify-between gap-[20px]">
            <div className="flex items-center gap-[10px] pt-[2px] text-[24px] font-semibold tracking-[-0.03em] text-[#222733]">
              <span>广告投放</span>
              <ChevronDown size={22} className="text-[#959daa]" />
              <span>任务模板</span>
            </div>

            <button
              onClick={() => {
                navigate({
                  pathname: '/ad-placement/template/new',
                  search: templateSearch ? `?${templateSearch}` : '',
                })
              }}
              className="flex h-[48px] items-center gap-[10px] rounded-[14px] border border-[#bcc2cc] px-[18px] text-[16px] font-medium text-[#2f3642]"
            >
              <Plus size={18} strokeWidth={1.8} />
              新建模板
            </button>
          </div>

          <div className="mt-[12px] max-w-[720px] text-[15px] leading-[24px] text-[#a3abb8]">
            将高频投放流程沉淀成模板，缩短任务创建时间，并保持不同 campaign 的执行动作一致。
          </div>

          <div className="mt-[24px] grid grid-cols-4 gap-[14px]">
            {templateMetrics.map((item) => (
              <Metric key={item.title} {...item} />
            ))}
          </div>

          <div className="mt-[28px] flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <button
                onClick={() => updateTemplateFilters({ tab: 'all' })}
                className={`flex h-[44px] items-center gap-[8px] rounded-[14px] px-[14px] text-[15px] font-medium ${
                  activeTab === 'all' ? 'bg-[#f5f6f8] text-[#2d3340]' : 'text-[#a3abb8]'
                }`}
              >
                全部模板
              </button>
              <button
                onClick={() => updateTemplateFilters({ tab: 'favorites' })}
                className={`flex h-[44px] items-center gap-[8px] rounded-[14px] px-[14px] text-[15px] font-medium ${
                  activeTab === 'favorites' ? 'bg-[#f5f6f8] text-[#2d3340]' : 'text-[#a3abb8]'
                }`}
              >
                我的收藏
              </button>
            </div>
            <button
              onClick={() => updateTemplateFilters({ recommended: !showRecommendedOnly })}
              className={`flex h-[44px] items-center gap-[8px] rounded-[14px] border px-[14px] text-[15px] font-medium ${
                showRecommendedOnly
                  ? 'border-[#11161f] bg-[#11161f] text-white'
                  : 'border-[#e8ebf0] text-[#353b46]'
              }`}
            >
              <Sparkles size={18} className={showRecommendedOnly ? 'text-white' : 'text-[#555c68]'} />
              智能推荐
            </button>
          </div>

          <AnimatedSection activeKey={templateResultsKey}>
            <div className="mt-[18px] grid grid-cols-2 gap-[14px] stagger-children">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="panel-border rounded-[20px] bg-white px-[18px] py-[18px] transition hover:shadow-[0_16px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-start justify-between gap-[14px]">
                    <button
                      className="min-w-0 text-left"
                      onClick={() =>
                        navigate({
                          pathname: `/ad-placement/template/${template.id}`,
                          search: templateSearch ? `?${templateSearch}` : '',
                        })
                      }
                    >
                      <div className="text-[20px] font-medium tracking-[-0.03em] text-[#202531]">
                        {template.title}
                      </div>
                      <div className="mt-[6px] text-[15px] leading-[24px] text-[#a3abb8]">
                        {template.desc}
                      </div>
                    </button>
                    <div className="flex items-center gap-[8px]">
                      <button
                        onClick={() =>
                          addTemplate({
                            name: `${template.title}（副本）`,
                            desc: template.desc,
                            category: template.category,
                          })
                        }
                        className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[#f5f6f8] text-[#4a5260]"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => toggleTemplateFavorite(template.id)}
                        className={`flex h-[36px] w-[36px] items-center justify-center rounded-[12px] ${
                          template.favorite ? 'bg-[#fff6da] text-[#f0b61c]' : 'bg-[#f5f6f8] text-[#9097a6]'
                        }`}
                      >
                        <Star size={16} fill={template.favorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-[14px] flex flex-wrap gap-[8px]">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f5f7fa] px-[12px] py-[6px] text-[13px] font-medium text-[#66707d]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-[18px] rounded-[16px] bg-[#fbfbfc] px-[16px] py-[14px]">
                    <div className="flex items-center justify-between text-[14px] font-medium text-[#66707d]">
                      <span>{template.steps.length} 个标准步骤</span>
                      <span>{template.usage}</span>
                    </div>
                    <div className="mt-[12px] flex items-center gap-[8px]">
                      {template.steps.map((step, index) => (
                        <div key={step} className="flex items-center gap-[8px]">
                          <div
                            className={`h-[12px] w-[12px] rounded-full ${
                              index === Math.floor(template.steps.length / 2)
                                ? 'bg-[#f0b61c]'
                                : 'bg-[#dfe6f0]'
                            }`}
                          />
                          {index < template.steps.length - 1 ? <div className="h-px w-[44px] bg-[#dfe5ed]" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-[18px] flex items-center justify-between">
                    <div className="text-[14px] text-[#a3abb8]">
                      {template.recommended ? '推荐优先使用' : '适用于中大型新品投放项目'}
                    </div>
                    <button
                      onClick={() =>
                        navigate({
                          pathname: `/ad-placement/template/use/${template.id}`,
                          search: templateSearch ? `?${templateSearch}` : '',
                        })
                      }
                      className="h-[42px] rounded-[14px] bg-black px-[16px] text-[15px] font-medium text-white"
                    >
                      使用模板
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {selectedTemplate ? (
        <PlatformModal
          title={selectedTemplate.title}
          subtitle={selectedTemplate.desc}
          onClose={() =>
            navigate({
              pathname: '/ad-placement/template',
              search: templateSearch ? `?${templateSearch}` : '',
            })
          }
          footer={
            <>
              <button
                onClick={() =>
                  navigate({
                    pathname: '/ad-placement/template',
                    search: templateSearch ? `?${templateSearch}` : '',
                  })
                }
                className="h-[52px] rounded-[16px] border border-[#d7dbe3] px-[22px] text-[18px] font-medium text-[#4b5260]"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  navigate({
                    pathname: `/ad-placement/template/use/${selectedTemplate.id}`,
                    search: templateSearch ? `?${templateSearch}` : '',
                  })
                }}
                className="h-[52px] rounded-[16px] bg-black px-[22px] text-[18px] font-medium text-white"
              >
                使用模板
              </button>
            </>
          }
        >
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-[18px]">
            <div className="rounded-[24px] bg-[#fbfbfc] px-[22px] py-[22px]">
              <div className="text-[20px] font-medium text-[#202531]">执行步骤</div>
              <div className="mt-[18px] space-y-[14px]">
                {selectedTemplate.steps.map((step, index) => (
                  <div key={step} className="flex items-start gap-[14px]">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#11161f] text-[14px] font-medium text-white">
                      {index + 1}
                    </div>
                    <div className="pt-[3px] text-[17px] leading-[24px] text-[#4b5260]">{step}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-[18px]">
              <div className="rounded-[24px] bg-[#fbfbfc] px-[22px] py-[22px]">
                <div className="text-[20px] font-medium text-[#202531]">适用场景</div>
                <div className="mt-[12px] text-[17px] leading-[28px] text-[#a3abb8]">
                  {selectedTemplate.category} 任务中常用，适合需要稳定复制执行链路的项目。
                </div>
              </div>
              <div className="rounded-[24px] bg-[#fbfbfc] px-[22px] py-[22px]">
                <div className="text-[20px] font-medium text-[#202531]">模板特性</div>
                <div className="mt-[14px] space-y-[12px]">
                  <div className="flex items-center gap-[10px] text-[17px] text-[#4b5260]">
                    <Check size={18} className="text-[#12d88d]" />
                    最近使用频率高
                  </div>
                  <div className="flex items-center gap-[10px] text-[17px] text-[#4b5260]">
                    <Check size={18} className="text-[#12d88d]" />
                    适合多人协作审批
                  </div>
                  <div className="flex items-center gap-[10px] text-[17px] text-[#4b5260]">
                    <Check size={18} className="text-[#12d88d]" />
                    可以直接复用到新任务
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PlatformModal>
      ) : null}

      {showCreateModal ? (
        <CreateTaskModal
          onClose={() =>
            navigate({
              pathname: '/ad-placement/template',
              search: templateSearch ? `?${templateSearch}` : '',
            })
          }
          title={templateForCreation ? '使用模板创建任务' : '新建模板'}
          actionLabel={templateForCreation ? '立即创建' : '保存模板'}
          categoryLabel={templateForCreation?.category ?? '广告投放'}
          nameValue={
            templateForCreation
              ? `${templateForCreation.category}：${templateForCreation.title} – 20260408`
              : 'CapCut – 标准投放模板 – 20260408'
          }
          descValue={
            templateForCreation
              ? templateForCreation.desc
              : '适用于新品投放冷启动，包含目标设定、预算拆分、达人筛选与内容复盘动作。'
          }
          nameLabel={templateForCreation ? '名称' : '模板名称'}
          descriptionLabel={templateForCreation ? '任务描述' : '模板说明'}
          showTemplateButton={false}
          onSubmit={({ name, desc }) => {
            if (templateForCreation) {
              addTask({
                name,
                desc,
                category: templateForCreation.category,
              })
              navigate({
                pathname: '/ad-placement/template',
                search: templateSearch ? `?${templateSearch}` : '',
              })
              return
            }

            addTemplate({
              name,
              desc,
              category: '广告投放',
            })
            navigate({
              pathname: '/ad-placement/template',
              search: templateSearch ? `?${templateSearch}` : '',
            })
          }}
        />
      ) : null}
    </>
  )
}
