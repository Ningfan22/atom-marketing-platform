import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Settings } from 'lucide-react'
import { useDesktopLayout } from '../context/DesktopLayoutContext'
import {
  AtomBottomIcon1,
  AtomBottomIcon2,
  AtomBottomIcon3,
  AtomBottomIcon4,
  AtomBottomIcon5,
  AtomBottomIcon6,
} from './AtomBottomIcons'
import UserAvatar from './UserAvatar'
import { CollapseGlyph } from './PlatformIcons'
import SettingsModal from './SettingsModal'

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

const mainNav: NavItem[] = [
  { label: '达人营销', path: '/creator', icon: <AtomBottomIcon1 size={18} /> },
  { label: '广告投放', path: '/ad-placement', icon: <AtomBottomIcon2 size={18} /> },
  { label: 'SEO', path: '/seo', icon: <AtomBottomIcon3 size={18} /> },
]

const capabilityNav: NavItem[] = [
  // Always return to the radar ("我的能力") view when entering Skill from the sidebar.
  { label: 'Skill', path: '/skill/ability', icon: <AtomBottomIcon4 size={18} /> },
  { label: '资源管理', path: '/resource', icon: <AtomBottomIcon5 size={18} /> },
  { label: '账号管理', path: '/account', icon: <AtomBottomIcon6 size={18} /> },
  { label: '数据看板', path: '/data-board', icon: <AtomBottomIcon1 size={18} /> },
]

function SidebarLink({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive =
    location.pathname === item.path ||
    (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)) ||
    (item.path === '/ad-placement' &&
      (location.pathname === '/ad-placement/new' || location.pathname.startsWith('/ad-placement/task/')))

  return (
    <NavLink
      to={item.path}
      className={() =>
        `flex h-[44px] items-center gap-[12px] rounded-[14px] px-[14px] text-[16px] font-medium transition ${
          isActive
            ? 'bg-[#f5f6f8] text-[#1f2430]'
            : 'text-[#2f3542] hover:bg-[#f7f8fa]'
        }`
      }
    >
      <span className="text-[#2f3542]">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  )
}

function RecentMessage({
  label,
  showMore = false,
  onClick,
}: {
  label: string
  showMore?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-[10px] py-[8px] text-left"
    >
      <div className="line-clamp-2 text-[15px] leading-[22px] tracking-[-0.02em] text-[#2e3441]">
        {label}
      </div>
      {showMore ? <MoreHorizontal size={18} className="text-[#a7aebb]" /> : null}
    </button>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { sidebarWidth } = useDesktopLayout()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <aside
      className="flex flex-shrink-0 flex-col border-r border-[#eaedf2] bg-white"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="flex h-[72px] items-center justify-between px-[20px]">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-[10px]"
        >
          <div className="h-[32px] w-[32px] rounded-full bg-[#0f1219]" />
          <div className="text-[18px] font-semibold tracking-[-0.03em] text-[#11161f]">Atom</div>
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[#d7dbe3] text-[#8f97a6]"
        >
          <CollapseGlyph size={14} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[16px] pb-[20px]">
        <div className="pt-[20px]">
          <div className="px-[14px] text-[14px] font-medium text-[#a6aebb]">手段</div>
          <div className="mt-[12px] space-y-[6px]">
            {mainNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        <div className="pt-[34px]">
          <div className="px-[14px] text-[14px] font-medium text-[#a6aebb]">能力</div>
          <div className="mt-[12px] space-y-[6px]">
            {capabilityNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        <div className="pt-[36px]">
          <div className="px-[14px] text-[14px] font-medium text-[#a6aebb]">消息</div>
          <div className="mt-[8px] px-[14px]">
            <RecentMessage label="Capcut pc 裂变的漏斗分析" onClick={() => navigate('/messages/capcut-funnel')} />
            <RecentMessage
              label="社媒达人 4 月数据分析"
              showMore
              onClick={() => navigate('/messages/social-report')}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-[20px] pb-[20px]">
        <button type="button" onClick={() => setShowSettings(true)}>
          <UserAvatar size={32} />
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#2c313d] transition hover:bg-[#f6f7f9]"
        >
          <Settings size={20} strokeWidth={1.9} />
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </aside>
  )
}
