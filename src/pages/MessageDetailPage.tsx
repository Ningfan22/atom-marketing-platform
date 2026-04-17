import { ArrowRight, ChevronLeft, ExternalLink, TrendingUp, Zap } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'

const messageMap = {
  'capcut-funnel': {
    title: 'Capcut pc 裂变的漏斗分析',
    category: '增长分析',
    categoryColor: '#5865f2',
    categoryBg: '#eef0ff',
    date: '今天 · 10:42',
    summary:
      '围绕 Capcut PC 裂变链路梳理近 7 天的触达、点击、激活与留存表现，定位转化流失最明显的阶段。',
    thread: [
      {
        role: 'ai' as const,
        text: '我分析了 Capcut PC 裂变链路近 7 天的完整漏斗数据，发现整体转化率处于正常范围，但有一个明显的流失节点需要关注。',
      },
      {
        role: 'ai' as const,
        text: '**下载完成 → 首次启动** 这一步流失了 37% 的用户。主要原因可能是安装包体积偏大（平均 214MB）以及首启引导步骤过多（当前 6 步）。',
      },
      {
        role: 'user' as const,
        text: '有什么优化建议吗？',
      },
      {
        role: 'ai' as const,
        text: '可以从两个方向入手：① 将安装包拆分为核心包 + 按需下载，目标体积控制在 80MB 以内；② 将首启引导缩减到 3 步，延迟功能介绍到用户完成第一次编辑之后。',
      },
    ],
    highlights: [
      { label: '触达转化率', value: '18.4%', meta: '较上周 +2.1%', up: true, icon: TrendingUp },
      { label: '激活完成率', value: '42%', meta: '建议优先优化首屏引导', up: false, icon: Zap },
      { label: '高流失环节', value: '37%', meta: '下载完成 → 首启', up: false, icon: ExternalLink },
    ],
    actions: [
      { label: '查看数据看板', desc: '跳转到全业务线数据视图', path: '/data-board/all' },
      { label: '回到首页设置', desc: '调整首页展示策略', path: '/settings?account=capcut&period=last-7d' },
    ],
  },
  'social-report': {
    title: '社媒达人 4 月数据分析',
    category: '达人营销',
    categoryColor: '#f0674b',
    categoryBg: '#fff1ee',
    date: '昨天 · 16:08',
    summary:
      '汇总 4 月达人营销内容产出、互动、带链点击和转化贡献，辅助判断下阶段达人池和内容方向。',
    thread: [
      {
        role: 'ai' as const,
        text: '4 月共合作 48 位达人，其中 12 位为复投达人，内容总曝光量约 8.4M，带链点击 62K。',
      },
      {
        role: 'ai' as const,
        text: '视频内容的平均互动率（6.8%）显著高于图文（4.9%），建议 5 月将图文达人的合作比例从 35% 调整到 20% 以下。',
      },
      {
        role: 'user' as const,
        text: '5 月有什么新节点需要提前布局？',
      },
      {
        role: 'ai' as const,
        text: '5 月有「母亲节」和「毕业季」两个节点适合 CapCut 创作工具的借势内容。建议提前 3 周储备测评型和教程型达人各 10 位，重点覆盖 TikTok 和 Instagram Reels。',
      },
    ],
    highlights: [
      { label: '合作达人', value: '48', meta: '其中 12 位复投达人', up: true, icon: TrendingUp },
      { label: '平均互动率', value: '6.8%', meta: '视频高于图文 1.9%', up: true, icon: TrendingUp },
      { label: '优先动作', value: '扩充测评型', meta: '适合 5 月新品节点', up: true, icon: Zap },
    ],
    actions: [
      { label: '前往达人营销', desc: '查看当前需介入任务', path: '/creator?status=需介入' },
      { label: '查看达人看板', desc: '跳转到达人营销数据视图', path: '/data-board/creator' },
    ],
  },
} as const

export default function MessageDetailPage() {
  const navigate = useNavigate()
  const { messageId } = useParams()
  const { rootMinWidthClass, messagePagePaddingClass, messagePageMaxWidthClass } = useDesktopShellClasses()

  const content = useMemo(() => {
    if (!messageId) return messageMap['capcut-funnel']
    return messageMap[messageId as keyof typeof messageMap] ?? messageMap['capcut-funnel']
  }, [messageId])

  return (
    <div className={`flex h-full ${rootMinWidthClass} flex-col bg-[#f9fafb]`}>
      <div className="flex-1 overflow-y-auto">
        {/* ── Header ── */}
        <div className={`border-b border-[#eaedf2] bg-white ${messagePagePaddingClass} py-[20px]`}>
          <button
            onClick={() => navigate('/')}
            className="flex h-[34px] items-center gap-[6px] rounded-[10px] text-[14px] font-medium text-[#8f97a6] transition hover:text-[#4b5260]"
          >
            <ChevronLeft size={16} />
            返回首页
          </button>

          <div className="mt-[16px] flex items-start justify-between gap-[24px]">
            <div>
              <span
                className="inline-flex h-[24px] items-center rounded-full px-[10px] text-[12px] font-medium"
                style={{ color: content.categoryColor, backgroundColor: content.categoryBg }}
              >
                {content.category}
              </span>
              <h1 className="mt-[10px] text-[28px] font-semibold leading-[36px] tracking-[-0.03em] text-[#1a1f2c]">
                {content.title}
              </h1>
              <p className="mt-[8px] max-w-[680px] text-[14px] leading-[22px] text-[#8f97a6]">
                {content.summary}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-[8px]">
              <div className="text-[13px] text-[#b0b7c2]">{content.date}</div>
              <div className="rounded-[10px] bg-[#0f1219] px-[14px] py-[8px] text-[13px] font-medium text-white">
                已同步最新结论
              </div>
            </div>
          </div>
        </div>

        <div className={`mx-auto ${messagePageMaxWidthClass} ${messagePagePaddingClass} py-[28px]`}>
          {/* ── Metrics ── */}
          <div className="grid grid-cols-3 gap-[14px]">
            {content.highlights.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="rounded-[18px] border border-[#eaedf2] bg-white px-[20px] py-[18px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px] text-[13px] font-medium text-[#9aa3b2]">
                      <Icon size={14} strokeWidth={1.8} />
                      {item.label}
                    </div>
                    <span
                      className={[
                        'rounded-full px-[8px] py-[2px] text-[11px] font-medium',
                        item.up ? 'bg-[#eafaf3] text-[#12d88d]' : 'bg-[#fff1ee] text-[#f0674b]',
                      ].join(' ')}
                    >
                      {item.up ? '↗' : '↘'}
                    </span>
                  </div>
                  <div className="mt-[14px] text-[32px] font-semibold leading-none tracking-[-0.04em] text-[#1a1f2c]">
                    {item.value}
                  </div>
                  <div className="mt-[8px] text-[13px] text-[#a3abb8]">{item.meta}</div>
                </div>
              )
            })}
          </div>

          {/* ── AI Thread ── */}
          <div className="mt-[24px] rounded-[20px] border border-[#eaedf2] bg-white px-[24px] py-[20px]">
            <div className="mb-[18px] flex items-center gap-[8px]">
              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#0f1219] text-[13px] text-white">
                ✦
              </div>
              <span className="text-[14px] font-semibold text-[#1a1f2c]">分析过程</span>
            </div>

            <div className="space-y-[16px]">
              {content.thread.map((msg, i) => (
                <div
                  key={i}
                  className={['flex gap-[12px]', msg.role === 'user' ? 'flex-row-reverse' : ''].join(' ')}
                >
                  {msg.role === 'ai' ? (
                    <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-[#f3f4f7] text-[12px] text-[#6b7280]">
                      AI
                    </div>
                  ) : (
                    <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-[#0f1219] text-[11px] font-semibold text-white">
                      我
                    </div>
                  )}
                  <div
                    className={[
                      'max-w-[80%] rounded-[14px] px-[16px] py-[12px] text-[14px] leading-[22px]',
                      msg.role === 'ai'
                        ? 'bg-[#f5f6f8] text-[#2d3340]'
                        : 'bg-[#0f1219] text-white',
                    ].join(' ')}
                  >
                    {msg.text.split('**').map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="mt-[20px]">
            <div className="mb-[12px] text-[14px] font-medium text-[#9aa3b2]">推荐后续动作</div>
            <div className="grid grid-cols-2 gap-[14px]">
              {content.actions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex items-center justify-between rounded-[16px] border border-[#eaedf2] bg-white px-[20px] py-[16px] text-left transition hover:border-[#c8cdd8] hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]"
                >
                  <div>
                    <div className="text-[15px] font-medium tracking-[-0.02em] text-[#1a1f2c]">
                      {action.label}
                    </div>
                    <div className="mt-[4px] text-[13px] text-[#a3abb8]">{action.desc}</div>
                  </div>
                  <ArrowRight size={16} className="flex-shrink-0 text-[#9aa3b2]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
