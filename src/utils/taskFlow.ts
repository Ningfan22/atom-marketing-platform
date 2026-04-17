import type { PlatformTask } from '../context/PlatformContext'

export type FlowStepState = 'pending' | 'done' | 'active'
export type FlowBadgeTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface FlowStep {
  id: number
  title: string
  subtitle: string
  detail: string
  action?: string
  state: FlowStepState
  badgeLabel?: string
  badgeTone?: FlowBadgeTone
  focusByDefault?: boolean
}

const flowPresets = {
  广告投放: {
    subtitles: [
      '目标平台：TikTok · Meta',
      '目标人群：欧美创作者 · 电商商家',
      '素材类型：静态图 · 短视频',
      '审批环节：预算 · 素材 · 账户',
      '复盘维度：CTR · CPA · ROI',
    ],
    titles: ['目标与预算设定', '受众画像定义', '广告素材准备', '投放审核与上线', '数据复盘'],
    details: [
      '确认本轮 campaign 的预算上限、ROI 目标和重点投放区域，明确后续素材和渠道节奏。',
      '根据目标市场和内容类型梳理核心人群包，并确认投放平台的优先级与预算拆分逻辑。',
      '整理静态图、短视频和多尺寸广告素材，补齐素材说明与替换优先级。',
      '围绕预算、素材和账户权限做最终审核，并同步素材替换建议与投放节奏。',
      '复盘 CTR、CPA 与 ROI 表现，确认下轮预算迁移、素材迭代与创意方向。',
    ],
  },
  达人营销: {
    subtitles: [
      '目标平台：TikTok · Instagram',
      '达人画像：垂类创作者 · 商业化达人',
      '招募方式：自然邀约 · 白名单',
      '审批环节：名单 · 报价 · 脚本',
      '复盘维度：内容通过率 · 转化',
    ],
    titles: ['目标与预算设定', '达人画像定义', '寻找达人', '审核签约', '达人内容审核'],
    details: [
      '明确本阶段达人合作目标、整体预算和核心平台，将任务拆分到招募、签约和内容审核三个阶段。',
      '统一达人筛选标准，包括粉丝结构、内容垂类、转化能力和合作报价区间。',
      '查找 TikTok、Instagram、Pinterest 上与图片编辑功能相关的达人，并整理成候选名单。',
      '复核达人名单、报价与脚本，确认可合作达人并同步签约节点与素材要求。',
      '拓展 Pinterest 创作者池，完善签约与内容审核机制，持续跟进内容通过率与转化效果。',
    ],
  },
  SEO: {
    subtitles: [
      '目标词池：核心词 · 长尾词',
      '内容类型：工具页 · 博客页',
      '优化动作：结构化数据 · 内链',
      '上线检查：收录 · 排名波动',
      '复盘维度：流量 · 排名 · CTR',
    ],
    titles: ['热点词筛选', '内容机会评估', '页面制作优化', '上线追踪', '排名复盘'],
    details: [
      '筛选高潜力核心词与长尾词，建立关键词优先级和页面承接关系。',
      '判断工具页、聚合页和博客页的内容机会，优先补齐高流量缺口。',
      '围绕重点关键词补齐页面结构、FAQ 与内部链接，确保基础 SEO 信号完整。',
      '检查页面上线后的收录、排名和内部链接传递情况，及时修正异常波动。',
      '复盘自然流量、关键词排名和 CTR 变化，沉淀下一轮内容优先级。',
    ],
  },
} as const

const statusMeta = {
  进行中: {
    action: '标记完成',
    badgeLabel: '进行中',
    badgeTone: 'warning' as const,
    activeState: 'active' as const,
  },
  需介入: {
    action: '恢复推进',
    badgeLabel: '需介入',
    badgeTone: 'warning' as const,
    activeState: 'active' as const,
  },
  已结束: {
    action: '再次启动',
    badgeLabel: '已完成',
    badgeTone: 'success' as const,
    activeState: 'done' as const,
  },
  已终止: {
    action: '重新开启',
    badgeLabel: '已终止',
    badgeTone: 'danger' as const,
    activeState: 'active' as const,
  },
}

export function getTaskFlowSteps(task?: PlatformTask): FlowStep[] {
  const category = task?.category ?? '广告投放'
  const preset = flowPresets[category]
  const status = task?.status ?? '进行中'
  const finalStepIndex = preset.titles.length
  const meta = statusMeta[status]

  return preset.titles.map((title, index) => {
    const stepId = index + 1
    const isFinalStep = stepId === finalStepIndex
    const isCompletedStep = stepId < finalStepIndex
    const state: FlowStepState = isFinalStep ? meta.activeState : isCompletedStep ? 'done' : 'pending'

    return {
      id: stepId,
      title: `Step ${stepId} ${title}`,
      subtitle: preset.subtitles[index],
      detail: isFinalStep ? task?.description || preset.details[index] : preset.details[index],
      action: isFinalStep ? meta.action : undefined,
      state,
      badgeLabel: state === 'done' ? '已完成' : isFinalStep ? meta.badgeLabel : undefined,
      badgeTone: state === 'done' ? 'success' : isFinalStep ? meta.badgeTone : undefined,
      focusByDefault: isFinalStep,
    }
  })
}

export function getTaskFlowChipLabel(task?: PlatformTask) {
  return task?.title ?? 'Dreamina – Mate AI video 投放计划...'
}

export function getNextTaskStatus(status: PlatformTask['status']) {
  return {
    进行中: '已结束',
    需介入: '进行中',
    已结束: '进行中',
    已终止: '进行中',
  }[status] as PlatformTask['status']
}
