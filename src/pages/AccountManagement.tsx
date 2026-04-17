import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import BrandDirectoryCard from '../components/BrandDirectoryCard'
import PlatformModal from '../components/PlatformModal'
import { useDesktopShellClasses } from '../context/DesktopLayoutContext'
import { type AccountStatus, type Collaborator, usePlatform } from '../context/PlatformContext'
import { getBrandLogo } from '../utils/brandLogos'

type ModalType = 'add-account' | 'invite' | 'permission' | null

const inputClassName =
  'mt-[10px] h-[56px] w-full rounded-[16px] border border-[#eceff3] px-[18px] text-[17px] text-[#2d3340] outline-none placeholder:text-[#b6bcc7]'
const textareaClassName =
  'mt-[10px] min-h-[112px] w-full resize-none rounded-[16px] border border-[#eceff3] px-[18px] py-[16px] text-[17px] leading-[28px] text-[#2d3340] outline-none placeholder:text-[#b6bcc7]'

const boundAccounts = [
  { platform: 'similarweb', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'Gmail', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'X（Twitter）', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'Instagram', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'Github', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'Meta ads manager', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
] as const

const unboundAccounts = [
  { platform: 'Youtube', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'LinkedIn', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'similarweb', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
  { platform: 'Ahrefs', desc: '汇总今天天气、要闻和优先事项，开启新的一天' },
] as const

const legacyAccounts = new Set<string>(['TikTok Ads', 'Meta Ads', 'Google Ads'])
const seededAccountTitles = new Set<string>([
  ...boundAccounts.map((item) => item.platform),
  ...unboundAccounts.map((item) => item.platform),
])

const initialAccountDraft = {
  platform: 'Pinterest Ads',
  owner: 'CapCut Creative',
  accountName: 'CapCut Creative Global',
  budget: '$40K / 月',
  status: '已连接' as AccountStatus,
}

const initialInviteDraft = {
  name: 'Nova Lin',
  role: '账号运营',
  scope: '广告投放 / 资源管理',
  note: '负责新接入账号的预算归因和日常投放维护。',
}

export default function AccountManagement({
  modalMode,
}: {
  modalMode?: 'add-account' | 'invite' | 'permission'
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { collaboratorName } = useParams()
  const locationState = location.state as { platform?: string } | null
  const { accounts, collaborators, addAccount, addCollaborator } = usePlatform()
  const { isCompactDesktop, rootMinWidthClass, widePagePaddingClass, widePageMaxWidthClass } = useDesktopShellClasses()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null)
  const [accountDraft, setAccountDraft] = useState(initialAccountDraft)
  const [inviteDraft, setInviteDraft] = useState(initialInviteDraft)

  const resolvedModalMode: ModalType =
    modalMode ??
    (location.pathname === '/account/add'
      ? 'add-account'
      : location.pathname === '/account/invite'
        ? 'invite'
        : location.pathname.startsWith('/account/permission/')
          ? 'permission'
          : null)

  useEffect(() => {
    if (!resolvedModalMode) {
      setModalType(null)
      setSelectedCollaborator(null)
      return
    }

    setModalType(resolvedModalMode)
    if (resolvedModalMode === 'permission' && collaboratorName) {
      const decodedName = decodeURIComponent(collaboratorName)
      setSelectedCollaborator(collaborators.find((item) => item.name === decodedName) ?? null)
    }
    if (resolvedModalMode === 'add-account') {
      setAccountDraft((current) => ({
        ...current,
        platform: locationState?.platform ?? current.platform,
        accountName: locationState?.platform ? `${locationState.platform} Workspace` : current.accountName,
      }))
    }
  }, [collaboratorName, collaborators, locationState?.platform, resolvedModalMode])

  const extraAccounts = useMemo(() => {
    return accounts.filter((item) => !legacyAccounts.has(item.platform) && !seededAccountTitles.has(item.platform))
  }, [accounts])

  const visibleBoundAccounts = useMemo(() => {
    return [
      ...boundAccounts.map((item) => ({ ...item, status: '已绑定' })),
      ...extraAccounts.map((item) => ({
        platform: item.platform,
        desc: item.owner || '汇总今天天气、要闻和优先事项，开启新的一天',
        status: item.status === '已连接' ? '已绑定' : '待更新',
      })),
    ]
  }, [extraAccounts])

  const accountGridMaxWidthClass = isCompactDesktop ? widePageMaxWidthClass : 'max-w-[960px]'

  return (
    <>
      <div className={`flex h-full ${rootMinWidthClass} flex-col bg-white`}>
        <div className={`flex-1 overflow-y-auto ${widePagePaddingClass} pb-0 pt-[54px]`}>
          <div className={`mx-auto w-full ${widePageMaxWidthClass}`}>
            <div>
              <div className="text-[26px] font-semibold tracking-[-0.045em] text-[#202531]">账号管理</div>
              <div className="mt-[10px] text-[14px] leading-[22px] text-[#a5adba]">
                这里汇总当前账号下的任务:包括你手动新建的，以及在聊天中由智能体创建的定时任务。
              </div>
            </div>

            <div className={`mt-[34px] grid grid-cols-2 gap-[12px] ${accountGridMaxWidthClass}`}>
              {visibleBoundAccounts.map((item, index) => (
                <BrandDirectoryCard
                  key={`${item.platform}-${index}`}
                  title={item.platform}
                  desc={item.desc}
                  logoSrc={getBrandLogo(item.platform)}
                  status={item.status}
                />
              ))}
            </div>

            <div className="mt-[40px] text-[16px] font-medium text-[#a3abb8]">未绑定</div>
            <div className={`mt-[16px] grid grid-cols-2 gap-[12px] ${accountGridMaxWidthClass}`}>
              {unboundAccounts.map((item) => (
                <BrandDirectoryCard
                  key={item.platform}
                  title={item.platform}
                  desc={item.desc}
                  logoSrc={getBrandLogo(item.platform)}
                  status={null}
                  trailingContent={
                    <button
                      type="button"
                      onClick={() => navigate('/account/add', { state: { platform: item.platform } })}
                      className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-[#2e3441] transition hover:bg-[#f6f7f9]"
                      aria-label={`绑定 ${item.platform}`}
                    >
                      <Plus size={20} strokeWidth={1.7} />
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalType === 'add-account' ? (
        <PlatformModal
          title="新增账号"
          subtitle="补齐新的平台账号信息，并让它出现在当前的账号管理视图里。"
          onClose={() => navigate('/account')}
          footer={
            <>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="h-[52px] rounded-[16px] border border-[#d7dbe3] px-[22px] text-[18px] font-medium text-[#4b5260]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!accountDraft.platform.trim()) {
                    return
                  }
                  addAccount({
                    platform: accountDraft.platform.trim(),
                    owner: accountDraft.owner.trim() || accountDraft.accountName.trim(),
                    status: accountDraft.status,
                    budget: accountDraft.budget.trim() || '$0 / 月',
                  })
                  navigate('/account')
                }}
                className="h-[52px] rounded-[16px] bg-black px-[22px] text-[18px] font-medium text-white"
              >
                保存账号
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-[16px]">
            <label className="text-[16px] font-medium text-[#2d3340]">
              平台名称
              <input
                value={accountDraft.platform}
                onChange={(event) => setAccountDraft((current) => ({ ...current, platform: event.target.value }))}
                className={inputClassName}
                placeholder="例如 Youtube"
              />
            </label>
            <label className="text-[16px] font-medium text-[#2d3340]">
              归属团队
              <input
                value={accountDraft.owner}
                onChange={(event) => setAccountDraft((current) => ({ ...current, owner: event.target.value }))}
                className={inputClassName}
                placeholder="例如 CapCut Creative"
              />
            </label>
          </div>

          <div className="mt-[18px] grid grid-cols-2 gap-[16px]">
            <label className="text-[16px] font-medium text-[#2d3340]">
              账号名称
              <input
                value={accountDraft.accountName}
                onChange={(event) =>
                  setAccountDraft((current) => ({ ...current, accountName: event.target.value }))
                }
                className={inputClassName}
                placeholder="例如 Youtube Workspace"
              />
            </label>
            <label className="text-[16px] font-medium text-[#2d3340]">
              月度预算
              <input
                value={accountDraft.budget}
                onChange={(event) => setAccountDraft((current) => ({ ...current, budget: event.target.value }))}
                className={inputClassName}
                placeholder="例如 $40K / 月"
              />
            </label>
          </div>
        </PlatformModal>
      ) : null}

      {modalType === 'invite' ? (
        <PlatformModal
          title="邀请成员"
          subtitle="补充协作者信息，并把它纳入账号协作视图。"
          onClose={() => navigate('/account')}
          footer={
            <>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="h-[52px] rounded-[16px] border border-[#d7dbe3] px-[22px] text-[18px] font-medium text-[#4b5260]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!inviteDraft.name.trim()) {
                    return
                  }
                  addCollaborator({
                    name: inviteDraft.name.trim(),
                    role: inviteDraft.role.trim(),
                    scope: inviteDraft.scope.trim(),
                  })
                  navigate('/account')
                }}
                className="h-[52px] rounded-[16px] bg-black px-[22px] text-[18px] font-medium text-white"
              >
                发送邀请
              </button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-[16px]">
            <label className="text-[16px] font-medium text-[#2d3340]">
              成员姓名
              <input
                value={inviteDraft.name}
                onChange={(event) => setInviteDraft((current) => ({ ...current, name: event.target.value }))}
                className={inputClassName}
                placeholder="例如 Nova Lin"
              />
            </label>
            <label className="text-[16px] font-medium text-[#2d3340]">
              角色
              <input
                value={inviteDraft.role}
                onChange={(event) => setInviteDraft((current) => ({ ...current, role: event.target.value }))}
                className={inputClassName}
                placeholder="例如 账号运营"
              />
            </label>
          </div>

          <label className="mt-[18px] block text-[16px] font-medium text-[#2d3340]">
            协作范围
            <input
              value={inviteDraft.scope}
              onChange={(event) => setInviteDraft((current) => ({ ...current, scope: event.target.value }))}
              className={inputClassName}
              placeholder="例如 广告投放 / 资源管理"
            />
          </label>

          <label className="mt-[18px] block text-[16px] font-medium text-[#2d3340]">
            备注
            <textarea
              value={inviteDraft.note}
              onChange={(event) => setInviteDraft((current) => ({ ...current, note: event.target.value }))}
              className={textareaClassName}
              placeholder="补充成员负责的工作内容"
            />
          </label>
        </PlatformModal>
      ) : null}

      {modalType === 'permission' && selectedCollaborator ? (
        <PlatformModal
          title="成员权限"
          subtitle={`${selectedCollaborator.name} · ${selectedCollaborator.role}`}
          onClose={() => navigate('/account')}
          footer={
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="h-[52px] rounded-[16px] bg-black px-[22px] text-[18px] font-medium text-white"
            >
              完成
            </button>
          }
        >
          <div className="space-y-[14px]">
            {[
              `当前职责：${selectedCollaborator.role}`,
              `管理范围：${selectedCollaborator.scope}`,
              '已分配权限：广告投放、资源管理、数据看板',
            ].map((item) => (
              <div key={item} className="rounded-[16px] bg-[#f7f8fa] px-[18px] py-[14px] text-[16px] text-[#4b5260]">
                {item}
              </div>
            ))}
          </div>
        </PlatformModal>
      ) : null}
    </>
  )
}
