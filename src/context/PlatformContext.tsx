import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type TemplateCategory = '广告投放' | '达人营销' | 'SEO'
export type PlatformTaskStatus = '进行中' | '需介入' | '已结束' | '已终止'
export type AccountStatus = '已连接' | '权限待更新'
export type ResourceCategory = '常规' | '监控' | '报告' | '自动化'
export type SkillCategory = '达人营销' | 'PSEO' | 'Paid Ads' | '创意生产'

export interface PlatformTask {
  id: number
  icon: string
  title: string
  subtitle: string
  description: string
  status: PlatformTaskStatus
  statusColor: string
  dotColor: string
  time: string
  budget: string
  ownerLabel: string
  period: string
  category: TemplateCategory
  channel: string
}

export interface PlatformTemplate {
  id: number
  title: string
  desc: string
  tags: string[]
  steps: string[]
  usage: string
  category: TemplateCategory
  favorite: boolean
  recommended: boolean
}

export interface AccountItem {
  platform: string
  owner: string
  status: AccountStatus
  budget: string
}

export interface Collaborator {
  name: string
  role: string
  scope: string
}

export interface ResourceItem {
  id: number
  icon: string
  title: string
  desc: string
  category: ResourceCategory
}

export interface SkillItem {
  id: number
  title: string
  desc: string
  category: SkillCategory
  enabled: boolean
}

interface PlatformState {
  tasks: PlatformTask[]
  templates: PlatformTemplate[]
  accounts: AccountItem[]
  collaborators: Collaborator[]
  resources: ResourceItem[]
  skills: SkillItem[]
}

interface CreateTaskInput {
  name: string
  desc: string
  category?: TemplateCategory
}

interface CreateTemplateInput {
  name: string
  desc: string
  category?: TemplateCategory
}

interface CreateAccountInput {
  platform: string
  owner: string
  status: AccountStatus
  budget: string
}

interface CreateCollaboratorInput {
  name: string
  role: string
  scope: string
}

interface CreateResourceInput {
  title: string
  desc: string
  category?: ResourceCategory
  icon?: string
}

interface CreateSkillInput {
  title: string
  desc: string
  category?: SkillCategory
}

interface PlatformContextValue extends PlatformState {
  addTask: (input: CreateTaskInput) => void
  updateTaskStatus: (id: number, status: PlatformTaskStatus) => void
  addTemplate: (input: CreateTemplateInput) => void
  toggleTemplateFavorite: (id: number) => void
  addAccount: (input: CreateAccountInput) => void
  addCollaborator: (input: CreateCollaboratorInput) => void
  addResource: (input: CreateResourceInput) => void
  addSkill: (input: CreateSkillInput) => void
  toggleSkillEnabled: (id: number) => void
}

const STORAGE_KEY = 'atom-platform-state-v1'

const defaultState: PlatformState = {
  tasks: [
    // ===== 广告投放 - TikTok Ads (3+) =====
    {
      id: 1,
      icon: '✦',
      title: 'CapCut – Mate AI video 投放计划 – 20260408',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description:
        '黑五大促期间，借助 KOL 内容提升 CapCut 图片编辑功能的海外认知度，黑五期间图片编辑功能新增用户 2 万，图片编辑功能适合推给电商商家。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '9 小时前',
      budget: '$50,000',
      ownerLabel: '达人营销（一口价）',
      period: '2024.11.01 – 2024.11.30',
      category: '广告投放',
      channel: 'TikTok Ads',
    },
    {
      id: 7,
      icon: '✦',
      title: 'CapCut – TikTok 短视频冷启动测试',
      subtitle: '针对新用户获取的短视频素材 A/B 测试与效果优化',
      description: '制作多组短视频创意素材进行 A/B 测试，优化 CTR 和转化率。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '3 小时前',
      budget: '$28,000',
      ownerLabel: '广告投放',
      period: '2024.12.01 – 2024.12.20',
      category: '广告投放',
      channel: 'TikTok Ads',
    },
    {
      id: 8,
      icon: '✦',
      title: 'CapCut – TikTok 节日营销活动',
      subtitle: '圣诞节/新年节日主题视频内容投放计划',
      description: '围绕节日热点制作系列短视频内容，提升品牌曝光和下载量。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '1 天前',
      budget: '$42,000',
      ownerLabel: '广告投放',
      period: '2024.12.15 – 2025.01.05',
      category: '广告投放',
      channel: 'TikTok Ads',
    },
    // ===== 广告投放 - Meta Ads (3+) =====
    {
      id: 4,
      icon: '▮',
      title: 'CapCut – Facebook AI video 投放计划 – 20260408',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description: '用于再营销投放的 AI Video 创意召回计划，包含素材替换和预算调整。',
      status: '已终止',
      statusColor: '#ff4863',
      dotColor: '#ff4863',
      time: '9 小时前',
      budget: '$22,000',
      ownerLabel: '广告投放',
      period: '2024.11.10 – 2024.11.26',
      category: '广告投放',
      channel: 'Meta Ads',
    },
    {
      id: 9,
      icon: '▮',
      title: 'CapCut – Instagram Reels 推广计划',
      subtitle: '针对 Z 世代用户的 Reels 素材投放与 KOL 合作',
      description: '联合 Instagram 创作者制作 Reels 内容，提升年轻用户群体认知。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '5 小时前',
      budget: '$35,000',
      ownerLabel: '广告投放',
      period: '2024.12.05 – 2024.12.25',
      category: '广告投放',
      channel: 'Meta Ads',
    },
    {
      id: 10,
      icon: '▮',
      title: 'CapCut – Facebook Lookalike 拓量',
      subtitle: '基于现有用户画像扩展相似受众投放',
      description: '利用 Facebook Lookalike Audience 功能拓展高价值潜在用户。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '2 天前',
      budget: '$18,000',
      ownerLabel: '广告投放',
      period: '2024.11.25 – 2024.12.15',
      category: '广告投放',
      channel: 'Meta Ads',
    },
    // ===== 广告投放 - Google Ads (3+) =====
    {
      id: 11,
      icon: '◈',
      title: 'CapCut – Google Search 品牌词保护',
      subtitle: '品牌关键词竞价保护与竞品拦截策略',
      description: '维护品牌词搜索排名，防止竞品截流品牌流量。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '6 小时前',
      budget: '$15,000',
      ownerLabel: '广告投放',
      period: '2024.12.01 – 2024.12.31',
      category: '广告投放',
      channel: 'Google Ads',
    },
    {
      id: 12,
      icon: '◈',
      title: 'CapCut – YouTube 视频广告投放',
      subtitle: 'YouTube TrueView 格式视频广告效果优化',
      description: '制作并投放 YouTube 前贴片和插播广告，提升视频编辑工具认知。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '4 天前',
      budget: '$32,000',
      ownerLabel: '广告投放',
      period: '2024.11.20 – 2024.12.10',
      category: '广告投放',
      channel: 'Google Ads',
    },
    {
      id: 13,
      icon: '◈',
      title: 'CapCut – Google Performance Max',
      subtitle: '跨渠道自动化投放方案效果追踪',
      description: '启用 Google PMax 自动化投放，覆盖搜索、展示、YouTube 多渠道。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '1 周前',
      budget: '$45,000',
      ownerLabel: '广告投放',
      period: '2024.10.01 – 2024.10.31',
      category: '广告投放',
      channel: 'Google Ads',
    },
    // ===== 广告投放 - 程序化广告 (3+) =====
    {
      id: 14,
      icon: '◎',
      title: 'CapCut – DSP 程序化购买测试',
      subtitle: '通过 Demand-Side Platform 进行程序化广告投放测试',
      description: '测试不同 DSP 平台的投放效果，评估 ROI 和人群精准度。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '2 小时前',
      budget: '$25,000',
      ownerLabel: '广告投放',
      period: '2024.12.08 – 2024.12.22',
      category: '广告投放',
      channel: '程序化广告',
    },
    {
      id: 15,
      icon: '◎',
      title: 'CapCut – 重定向 Retargeting 计划',
      subtitle: '基于用户行为的程序化重定向投放',
      description: '对访问过官网但未下载的用户进行程序化重定向广告投放。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '3 天前',
      budget: '$20,000',
      ownerLabel: '广告投放',
      period: '2024.11.28 – 2024.12.18',
      category: '广告投放',
      channel: '程序化广告',
    },
    {
      id: 16,
      icon: '◎',
      title: 'CapCut – PMP 私有交易市场合作',
      subtitle: '与优质媒体方建立 PMP 交易提升品牌安全',
      description: '与头部媒体平台建立私有交易，确保品牌安全和曝光质量。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '2 周前',
      budget: '$38,000',
      ownerLabel: '广告投放',
      period: '2024.10.15 – 2024.11.05',
      category: '广告投放',
      channel: '程序化广告',
    },

    // ===== 达人营销 - TikTok 达人 (3+) =====
    {
      id: 2,
      icon: '⌫',
      title: 'Q1 达人营销 Campaign 方案',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description: '梳理季度达人名单、预算计划和内容排期，建立可复用的达人营销节奏。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '12 小时前',
      budget: '$36,000',
      ownerLabel: '达人营销',
      period: '2024.12.01 – 2024.12.31',
      category: '达人营销',
      channel: 'TikTok 达人',
    },
    {
      id: 17,
      icon: '⌫',
      title: 'TikTok 创作者签约计划 Q4',
      subtitle: '筛选并签约 50 位优质 TikTok 创作者进行长期合作',
      description: '建立 TikTok 创作者资源库，签订长期合作协议确保内容供给稳定。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '1 天前',
      budget: '$55,000',
      ownerLabel: '达人营销',
      period: '2024.11.15 – 2024.12.31',
      category: '达人营销',
      channel: 'TikTok 达人',
    },
    {
      id: 18,
      icon: '⌫',
      title: 'TikTok 直播带货达人合作',
      subtitle: '联合 TikTok 直播主播进行 CapCut 产品推广直播',
      description: '筛选适合产品调性的直播达人，策划直播脚本和优惠机制。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '5 天前',
      budget: '$40,000',
      ownerLabel: '达人营销',
      period: '2024.10.20 – 2024.11.10',
      category: '达人营销',
      channel: 'TikTok 达人',
    },
    // ===== 达人营销 - Instagram 达人 (3+) =====
    {
      id: 19,
      icon: '◌',
      title: 'Instagram Reels 达人内容共创',
      subtitle: '与 Instagram Reels 创作者合作产出高质量教程内容',
      description: '邀请摄影/剪辑类 Reels 达人制作 CapCut 使用教程，提升产品认知。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '4 小时前',
      budget: '$30,000',
      ownerLabel: '达人营销',
      period: '2024.12.03 – 2024.12.23',
      category: '达人营销',
      channel: 'Instagram 达人',
    },
    {
      id: 20,
      icon: '◌',
      title: 'Instagram Stories 系列推广',
      subtitle: '通过 Instagram Stories 形式展示 CapCut 核心功能亮点',
      description: '策划 30 天 Stories 内容日历，每日展示不同功能使用技巧。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '2 天前',
      budget: '$22,000',
      ownerLabel: '达人营销',
      period: '2024.12.01 – 2024.12.30',
      category: '达人营销',
      channel: 'Instagram 达人',
    },
    {
      id: 21,
      icon: '◌',
      title: 'IG 达人 UGC 内容征集活动',
      subtitle: '发起用户生成内容活动激励达人参与创作',
      description: '设置奖励机制鼓励 IG 达人自发创作并分享使用体验。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '1 周前',
      budget: '$18,000',
      ownerLabel: '达人营销',
      period: '2024.11.01 – 2024.11.21',
      category: '达人营销',
      channel: 'Instagram 达人',
    },
    // ===== 达人营销 - Pinterest 达人 (3+) =====
    {
      id: 6,
      icon: '⌫',
      title: 'Pinterest 创作者专项',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description: '拓展 Pinterest 创作者池，完善签约与内容审核机制。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '9 小时前',
      budget: '$18,000',
      ownerLabel: '达人营销',
      period: '2024.09.15 – 2024.10.01',
      category: '达人营销',
      channel: 'Pinterest 达人',
    },
    {
      id: 22,
      icon: '◇',
      title: 'Pinterest 图文 Pin 推广计划',
      subtitle: '联合 Pinterest 创作型达人制作图文教程 Pin',
      description: '围绕 DIY、设计类主题制作高质量图文内容吸引目标用户。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '7 小时前',
      budget: '$16,000',
      ownerLabel: '达人营销',
      period: '2024.12.05 – 2024.12.25',
      category: '达人营销',
      channel: 'Pinterest 达人',
    },
    {
      id: 23,
      icon: '◇',
      title: 'Pinterest Idea Pin 系列合作',
      subtitle: '与 Pinterest Idea Pin 达人合作制作多页教程内容',
      description: '制作 Idea Pin 格式的分步骤教程，提升用户互动和收藏率。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '3 天前',
      budget: '$14,000',
      ownerLabel: '达人营销',
      period: '2024.11.20 – 2024.12.10',
      category: '达人营销',
      channel: 'Pinterest 达人',
    },
    // ===== 达人营销 - 品牌合作 (3+) =====
    {
      id: 24,
      icon: '◎',
      title: '品牌联名 KOL 合作项目',
      subtitle: '与知名品牌联合开展跨界达人营销活动',
      description: '寻找调性匹配的品牌进行联合营销，共享达人资源和曝光。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '1 天前',
      budget: '$60,000',
      ownerLabel: '达人营销',
      period: '2024.12.01 – 2025.01.15',
      category: '达人营销',
      channel: '品牌合作',
    },
    {
      id: 25,
      icon: '◎',
      title: '高校校园大使招募计划',
      subtitle: '在海外高校招募校园大使进行口碑传播',
      description: '建立高校校园大使体系，在学生群体中进行产品推广。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '5 天前',
      budget: '$25,000',
      ownerLabel: '达人营销',
      period: '2024.11.15 – 2024.12.31',
      category: '达人营销',
      channel: '品牌合作',
    },
    {
      id: 26,
      icon: '◎',
      title: '行业峰会 KOL 邀请出席',
      subtitle: '邀请行业意见领袖出席品牌活动并传播',
      description: '策划线下/线上峰会活动，邀请 KOL 出席并进行社交传播。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '2 周前',
      budget: '$35,000',
      ownerLabel: '达人营销',
      period: '2024.10.10 – 2024.10.25',
      category: '达人营销',
      channel: '品牌合作',
    },

    // ===== SEO - SEO (3+) =====
    {
      id: 3,
      icon: '◐',
      title: 'CapCut SEO 关键词攻坚',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description: '围绕 AI Video Maker、Image to Video 等关键词进行页面优化和内容补齐。',
      status: '已结束',
      statusColor: '#b3b3b4',
      dotColor: '#c4c4c5',
      time: '9 小时前',
      budget: '$12,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.10.01 – 2024.10.21',
      category: 'SEO',
      channel: 'SEO',
    },
    {
      id: 27,
      icon: '◐',
      title: 'CapCut 官网技术 SEO 优化',
      subtitle: '网站性能优化、结构化数据与技术 SEO 改进',
      description: '优化网站加载速度、添加 Schema 标记、修复技术 SEO 问题。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '3 小时前',
      budget: '$18,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.12.01 – 2024.12.31',
      category: 'SEO',
      channel: 'SEO',
    },
    {
      id: 28,
      icon: '◐',
      title: 'CapCut 博客内容矩阵建设',
      subtitle: '系统化建设博客内容体系提升自然搜索流量',
      description: '规划并执行博客内容日历，覆盖长尾关键词提升收录。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '2 天前',
      budget: '$15,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.11.20 – 2024.12.20',
      category: 'SEO',
      channel: 'SEO',
    },
    // ===== SEO - pSEO (3+) =====
    {
      id: 5,
      icon: '▮',
      title: '竞品关键词库更新',
      subtitle: '范围内最热门的 AI 相关资讯（包括模型发布、技术突破、行业动态、投融资等）输出格式...',
      description: '更新竞品关键词库并生成本周排名变化报告。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '9 小时前',
      budget: '$8,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.10.05 – 2024.10.08',
      category: 'SEO',
      channel: 'pSEO',
    },
    {
      id: 29,
      icon: '▮',
      title: 'pSEO 页面批量生成与上线',
      subtitle: '基于模板批量生成 pSEO 落地页并监控效果',
      description: '开发 pSEO 模板系统，批量生成关键词落地页并跟踪排名变化。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '6 小时前',
      budget: '$22,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.12.05 – 2025.01.15',
      category: 'SEO',
      channel: 'pSEO',
    },
    {
      id: 30,
      icon: '▮',
      title: 'pSEO 内容自动化工作流搭建',
      subtitle: '建立 pSEO 内容生产、审核、发布的自动化流程',
      description: '整合 AI 工具实现 pSEO 内容从关键词到上线的全流程自动化。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '4 天前',
      budget: '$28,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.11.25 – 2024.12.15',
      category: 'SEO',
      channel: 'pSEO',
    },
    // ===== SEO - 热点挖掘 (3+) =====
    {
      id: 31,
      icon: '◍',
      title: 'AI 视频工具热点话题追踪',
      subtitle: '实时追踪 AI video 相关热点并快速产出内容抢占排名',
      description: '建立热点监测机制，第一时间发现 AI 视频相关趋势并响应。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '2 小时前',
      budget: '$10,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.12.08 – 2024.12.28',
      category: 'SEO',
      channel: '热点挖掘',
    },
    {
      id: 32,
      icon: '◍',
      title: '节假日热点内容提前布局',
      subtitle: '针对即将到来的节假日提前准备热点内容',
      description: '预测圣诞/新年/情人节等节假日的搜索热点并提前布局内容。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '1 天前',
      budget: '$12,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.11.28 – 2025.02.15',
      category: 'SEO',
      channel: '热点挖掘',
    },
    {
      id: 33,
      icon: '◍',
      title: '竞品新品发布热点跟进',
      subtitle: '追踪竞品新品发布动态并及时产出对比评测内容',
      description: '监控主要竞品的新品发布节奏，快速产出差异化对比内容。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '1 周前',
      budget: '$9,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.10.20 – 2024.11.05',
      category: 'SEO',
      channel: '热点挖掘',
    },
    // ===== SEO - SEM (3+) =====
    {
      id: 34,
      icon: '◈',
      title: 'Google Ads 品牌词 SEM 投放',
      subtitle: '保护品牌搜索结果首位展示防止竞品截流',
      description: '对品牌核心词进行 SEM 出价确保搜索结果首屏展示。',
      status: '进行中',
      statusColor: '#15bf85',
      dotColor: '#15bf85',
      time: '4 小时前',
      budget: '$20,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.12.01 – 2024.12.31',
      category: 'SEO',
      channel: 'SEM',
    },
    {
      id: 35,
      icon: '◈',
      title: '竞品词 SEM 拦截策略',
      subtitle: '针对竞品品牌词进行 SEM 展示争夺用户注意力',
      description: '在用户搜索竞品产品时展示 CapCut 的优势对比信息。',
      status: '需介入',
      statusColor: '#f0b61c',
      dotColor: '#f0b61c',
      time: '3 天前',
      budget: '$16,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.11.22 – 2024.12.12',
      category: 'SEO',
      channel: 'SEM',
    },
    {
      id: 36,
      icon: '◈',
      title: 'SEM 长尾词低成本获客测试',
      subtitle: '挖掘低竞争高转化的长尾关键词进行 SEM 测试',
      description: '识别并测试长尾关键词的 SEM 表现，优化 CPA。',
      status: '已结束',
      statusColor: '#1fa8a3',
      dotColor: '#1fa8a3',
      time: '2 周前',
      budget: '$14,000',
      ownerLabel: 'SEO / PSEO',
      period: '2024.10.15 – 2024.11.01',
      category: 'SEO',
      channel: 'SEM',
    },
  ],
  templates: [
    {
      id: 1,
      title: 'CapCut – Mate AI video 投放计划',
      desc: '适用于新品投放冷启动，包含目标设定、达人筛选、签约审核和内容复盘完整流程。',
      tags: ['广告投放', '达人营销', '冷启动'],
      steps: ['目标设定', '预算拆分', '达人筛选', '审核签约', '内容复盘'],
      usage: '最近使用 6 次',
      category: '广告投放',
      favorite: true,
      recommended: true,
    },
    {
      id: 2,
      title: 'Facebook AI video 再营销模板',
      desc: '针对已触达受众的二次召回链路，强调素材替换、预算校准和 CTR 优化。',
      tags: ['再营销', 'Facebook', '转化'],
      steps: ['人群包同步', '再营销预算设定', '素材替换', '投放监控', '复盘优化', '沉淀素材'],
      usage: '最近使用 4 次',
      category: '广告投放',
      favorite: false,
      recommended: true,
    },
    {
      id: 3,
      title: 'Q1 达人营销 Campaign 方案',
      desc: '适合季度 Campaign，沉淀达人名单、内容节奏与预算节点协作方式。',
      tags: ['Campaign', '季度规划', '达人'],
      steps: ['季度目标', '达人池梳理', '合作排期', '内容脚本', '审核签约', '内容上线', '复盘总结'],
      usage: '最近使用 12 次',
      category: '达人营销',
      favorite: true,
      recommended: false,
    },
    {
      id: 4,
      title: 'SEO 热词攻坚联动模板',
      desc: '将关键词追踪与素材生产联动，适合 SEO 和投放协同推进的专项任务。',
      tags: ['SEO', '联动', '专项'],
      steps: ['热点词筛选', '内容机会评估', '页面制作', '内容追踪'],
      usage: '最近使用 3 次',
      category: 'SEO',
      favorite: false,
      recommended: true,
    },
  ],
  accounts: [
    { platform: 'TikTok Ads', owner: 'CapCut Global', status: '已连接', budget: '$320K / 月' },
    { platform: 'Meta Ads', owner: 'CapCut Performance', status: '权限待更新', budget: '$180K / 月' },
    { platform: 'Google Ads', owner: 'CapCut Search', status: '已连接', budget: '$95K / 月' },
  ],
  collaborators: [
    { name: 'Ari Wang', role: '投放负责人', scope: 'TikTok / Meta' },
    { name: 'Miya Chen', role: 'SEO Owner', scope: 'Google / 内容站' },
    { name: 'Leo Xu', role: '数据分析', scope: '数据看板 / 飞书同步' },
  ],
  resources: [
    { id: 1, icon: '🌞', title: '晨间简报', desc: '汇总今天天气、要闻和优先事项，开启新的一天', category: '常规' },
    { id: 2, icon: '🔥', title: '热点调研', desc: '聚合社媒与搜索趋势，提炼当天值得跟进的热点内容方向', category: '监控' },
    { id: 3, icon: '🔍', title: '竞品调研', desc: '追踪竞品投放、内容策略和创意更新频率，沉淀可复用观察结论', category: '报告' },
    { id: 4, icon: '📮', title: '邮件检查', desc: '汇总重点来信与待处理事项，减少多人协作时的信息遗漏', category: '常规' },
    { id: 5, icon: '💻', title: '素材表现周报', desc: '按素材维度整理 CTR、完播率和衰减节奏，输出每周复盘摘要', category: '报告' },
    { id: 6, icon: '📸', title: '达人素材池', desc: '按平台沉淀达人内容资产，便于 campaign 复用与投放分发', category: '自动化' },
    { id: 7, icon: '💸', title: '预算预警', desc: '预算异常波动时自动提醒负责人，并同步到看板和飞书群', category: '监控' },
    { id: 8, icon: '📺', title: 'Campaign 复盘看板', desc: '自动聚合关键指标、素材表现和经验结论，形成项目复盘页', category: '报告' },
    { id: 9, icon: '💡', title: '灵感灵感库', desc: '收集高表现创意方向与关键词机会，帮助快速启动新任务', category: '常规' },
    { id: 10, icon: '💎', title: '审批自动同步', desc: '节点状态和审批结果自动同步到飞书与日报，减少手动维护', category: '自动化' },
  ],
  skills: [
    { id: 1, title: '实时舆情告警', desc: '追踪平台舆情变化并输出异常提醒与建议动作。', category: '达人营销', enabled: true },
    { id: 2, title: '自动找达人', desc: '根据 campaign 目标筛选匹配达人池并输出候选名单。', category: '达人营销', enabled: true },
    { id: 3, title: '竞品内容监控', desc: '持续观察竞品内容节奏、素材主题与互动表现。', category: '达人营销', enabled: false },
    { id: 4, title: 'Google Analytics 报告', desc: '自动汇总 GA 关键指标与流量波动，生成日报摘要。', category: 'PSEO', enabled: true },
    { id: 5, title: "AI video maker b'r", desc: '围绕 AI video maker 主题沉淀内容结构与素材建议。', category: 'Paid Ads', enabled: false },
    { id: 6, title: '自动找达人', desc: '面向品牌合作场景补齐达人画像与历史合作表现。', category: '达人营销', enabled: false },
    { id: 7, title: 'Tableau 数据可视化', desc: '自动更新投放与内容效果可视化模块。', category: 'Paid Ads', enabled: true },
    { id: 8, title: '飞书文档自动生成', desc: '将任务进展同步成标准飞书文档，便于多方协作。', category: '创意生产', enabled: true },
    { id: 9, title: '创意设计', desc: '根据目标平台和人群特征生成创意方向与脚本建议。', category: '创意生产', enabled: false },
    { id: 10, title: '自动找达人', desc: '服务于 Pinterest 和 Instagram 的达人拓展动作。', category: '达人营销', enabled: false },
  ],
}

const PlatformContext = createContext<PlatformContextValue | null>(null)

function normalizeTaskIcon(task: PlatformTask): PlatformTask {
  const iconMap: Record<string, string> = {
    '📷': '◌',
    '📌': '◇',
    '🤝': '◎',
    '🔥': '◍',
    '💰': '◈',
  }

  const nextIcon = iconMap[task.icon] ?? task.icon
  return nextIcon === task.icon ? task : { ...task, icon: nextIcon }
}

function readInitialState(): PlatformState {
  if (typeof window === 'undefined') {
    return defaultState
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return defaultState
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlatformState>

    // Merge in newly-added mock tasks from `defaultState` without blowing away
    // any existing local state. This keeps demos fresh while preserving user edits.
    const mergedTasks = (() => {
      const existing = Array.isArray(parsed.tasks) ? parsed.tasks : []
      const byId = new Set<number>(existing.map((t) => t.id))
      const extras = defaultState.tasks.filter((t) => !byId.has(t.id))
      return [...existing, ...extras].map(normalizeTaskIcon)
    })()

    return {
      tasks: mergedTasks,
      templates: parsed.templates ?? defaultState.templates,
      accounts: parsed.accounts ?? defaultState.accounts,
      collaborators: parsed.collaborators ?? defaultState.collaborators,
      resources: parsed.resources ?? defaultState.resources,
      skills: parsed.skills ?? defaultState.skills,
    }
  } catch {
    return defaultState
  }
}

function buildTask(input: CreateTaskInput): PlatformTask {
  const category = input.category ?? '广告投放'
  const categoryConfig = {
    广告投放: { icon: '✦', budget: '$50,000', ownerLabel: '广告投放', status: '进行中' as const, color: '#15bf85', channel: 'TikTok Ads' },
    达人营销: { icon: '⌫', budget: '$36,000', ownerLabel: '达人营销', status: '需介入' as const, color: '#f0b61c', channel: 'TikTok 达人' },
    SEO: { icon: '◐', budget: '$12,000', ownerLabel: 'SEO / PSEO', status: '进行中' as const, color: '#15bf85', channel: 'SEO' },
  }[category]

  return {
    id: Date.now(),
    icon: categoryConfig.icon,
    title: input.name,
    subtitle: input.desc,
    description: input.desc,
    status: categoryConfig.status,
    statusColor: categoryConfig.color,
    dotColor: categoryConfig.color,
    time: '刚刚',
    budget: categoryConfig.budget,
    ownerLabel: categoryConfig.ownerLabel,
    period: '2024.11.01 – 2024.11.30',
    category,
    channel: categoryConfig.channel,
  }
}

function getStatusAppearance(status: PlatformTaskStatus) {
  return {
    进行中: { statusColor: '#15bf85', dotColor: '#15bf85' },
    需介入: { statusColor: '#f0b61c', dotColor: '#f0b61c' },
    已结束: { statusColor: '#1fa8a3', dotColor: '#1fa8a3' },
    已终止: { statusColor: '#ff4863', dotColor: '#ff4863' },
  }[status]
}

function buildTemplate(input: CreateTemplateInput): PlatformTemplate {
  const category = input.category ?? '广告投放'
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: input.name,
    desc: input.desc,
    tags: [category, '自定义模板'],
    steps: ['目标设定', '任务拆解', '执行推进', '复盘总结'],
    usage: '刚刚创建',
    category,
    favorite: false,
    recommended: false,
  }
}

function buildResource(input: CreateResourceInput): ResourceItem {
  const category = input.category ?? '常规'
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    icon: input.icon?.trim() || '🧩',
    title: input.title,
    desc: input.desc,
    category,
  }
}

function buildSkill(input: CreateSkillInput): SkillItem {
  const category = input.category ?? '达人营销'
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: input.title,
    desc: input.desc,
    category,
    enabled: true,
  }
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => readInitialState())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<PlatformContextValue>(
    () => ({
      ...state,
      addTask: (input) => {
        setState((current) => ({
          ...current,
          tasks: [buildTask(input), ...current.tasks],
        }))
      },
      updateTaskStatus: (id, status) => {
        const appearance = getStatusAppearance(status)
        setState((current) => ({
          ...current,
          tasks: current.tasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  statusColor: appearance.statusColor,
                  dotColor: appearance.dotColor,
                  time: '刚刚',
                }
              : item,
          ),
        }))
      },
      addTemplate: (input) => {
        setState((current) => ({
          ...current,
          templates: [buildTemplate(input), ...current.templates],
        }))
      },
      toggleTemplateFavorite: (id) => {
        setState((current) => ({
          ...current,
          templates: current.templates.map((item) =>
            item.id === id ? { ...item, favorite: !item.favorite } : item,
          ),
        }))
      },
      addAccount: (input) => {
        setState((current) => ({
          ...current,
          accounts: [input, ...current.accounts],
        }))
      },
      addCollaborator: (input) => {
        setState((current) => ({
          ...current,
          collaborators: [input, ...current.collaborators],
        }))
      },
      addResource: (input) => {
        setState((current) => ({
          ...current,
          resources: [buildResource(input), ...current.resources],
        }))
      },
      addSkill: (input) => {
        setState((current) => ({
          ...current,
          skills: [buildSkill(input), ...current.skills],
        }))
      },
      toggleSkillEnabled: (id) => {
        setState((current) => ({
          ...current,
          skills: current.skills.map((item) =>
            item.id === id ? { ...item, enabled: !item.enabled } : item,
          ),
        }))
      },
    }),
    [state],
  )

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider')
  }
  return context
}
