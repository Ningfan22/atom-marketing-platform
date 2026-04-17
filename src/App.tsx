import { Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom'
import AdaptiveDesktopViewport from './components/AdaptiveDesktopViewport'
import AnimatedRouteViewport, { type RouteVariant } from './components/AnimatedRouteViewport'
import FloatingConciergeComposer from './components/FloatingConciergeComposer'
import IframeScaledShell from './components/IframeScaledShell'
import Sidebar from './components/Sidebar'
import { DesktopLayoutProvider } from './context/DesktopLayoutContext'
import AdPlacement from './pages/AdPlacement'
import CreatorMarketing from './pages/CreatorMarketing'
import Dashboard from './pages/Dashboard'
import DataBoard from './pages/DataBoard'
import ResourceManagement from './pages/ResourceManagement'
import SEO from './pages/SEO'
import SkillManagement from './pages/SkillManagement'
import TaskFlowPage from './pages/TaskFlowPage'
import AccountManagement from './pages/AccountManagement'
import TaskTemplatePage from './pages/TaskTemplatePage'
import MessageDetailPage from './pages/MessageDetailPage'

function getRouteVariant(pathname: string): RouteVariant {
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname === '/settings') return 'home'
  if (pathname.startsWith('/messages/')) return 'message'
  if (pathname.startsWith('/ad-placement') || pathname.startsWith('/creator') || pathname.startsWith('/seo')) return 'task'
  if (pathname.startsWith('/skill')) return 'skill'
  if (pathname.startsWith('/data-board')) return 'analytics'
  if (pathname.startsWith('/account') || pathname.startsWith('/resource')) return 'settings'
  return 'default'
}

function getRouteTransitionKey(pathname: string) {
  if (pathname === '/' || pathname === '/settings' || pathname.startsWith('/dashboard')) {
    return 'dashboard'
  }

  if (pathname.startsWith('/messages/')) {
    return 'message-detail'
  }

  if (pathname.startsWith('/ad-placement/template')) {
    return 'ad-placement-template'
  }

  if (pathname.startsWith('/ad-placement')) {
    return 'ad-placement'
  }

  if (pathname.startsWith('/creator')) {
    return 'creator'
  }

  if (pathname.startsWith('/seo')) {
    return 'seo'
  }

  if (pathname.startsWith('/skill')) {
    return 'skill'
  }

  if (pathname.startsWith('/resource')) {
    return 'resource'
  }

  if (pathname.startsWith('/account')) {
    return 'account'
  }

  if (pathname.startsWith('/data-board')) {
    return 'data-board'
  }

  return pathname
}

export default function App() {
  const location = useLocation()
  const isImmersiveRoute = /^\/(ad-placement|creator|seo)\/flow(?:\/|$)/.test(location.pathname)
  const routeTransitionKey = getRouteTransitionKey(location.pathname)
  const routeVariant = getRouteVariant(location.pathname)

  const renderRoutes = (routeLocation: Location) => (
    <Routes location={routeLocation}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/settings" element={<Dashboard panelMode="settings" />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/dashboard/settings" element={<Navigate to="/settings" replace />} />
      <Route path="/messages/:messageId" element={<MessageDetailPage />} />

      <Route path="/ad-placement" element={<AdPlacement />} />
      <Route path="/ad-placement/new" element={<AdPlacement modalMode="create" />} />
      <Route path="/ad-placement/task/:taskId" element={<AdPlacement modalMode="detail" />} />
      <Route path="/ad-placement/template" element={<TaskTemplatePage />} />
      <Route path="/ad-placement/template/new" element={<TaskTemplatePage modalMode="create" />} />
      <Route path="/ad-placement/template/:templateId" element={<TaskTemplatePage modalMode="detail" />} />
      <Route path="/ad-placement/template/use/:templateId" element={<TaskTemplatePage modalMode="use" />} />
      <Route path="/ad-placement/flow" element={<TaskFlowPage />} />
      <Route path="/ad-placement/flow/:taskId" element={<TaskFlowPage />} />

      <Route path="/creator" element={<CreatorMarketing />} />
      <Route path="/creator/new" element={<CreatorMarketing modalMode="create" />} />
      <Route path="/creator/task/:taskId" element={<CreatorMarketing modalMode="detail" />} />
      <Route path="/creator/flow" element={<TaskFlowPage />} />
      <Route path="/creator/flow/:taskId" element={<TaskFlowPage />} />

      <Route path="/seo" element={<SEO />} />
      <Route path="/seo/new" element={<SEO modalMode="create" />} />
      <Route path="/seo/task/:taskId" element={<SEO modalMode="detail" />} />
      <Route path="/seo/flow" element={<TaskFlowPage />} />
      <Route path="/seo/flow/:taskId" element={<TaskFlowPage />} />
      <Route path="/skill" element={<Navigate to="/skill/ability" replace />} />
      <Route path="/skill/:viewKey" element={<SkillManagement />} />
      <Route path="/skill/:viewKey/:categoryKey" element={<SkillManagement />} />
      {/* Temporarily disable the route-based create modal (use the "创建Skill" dropdown instead). */}
      <Route path="/skill/new" element={<Navigate to="/skill/ability" replace />} />
      <Route path="/resource" element={<ResourceManagement />} />
      <Route path="/resource/:categoryKey" element={<ResourceManagement />} />
      <Route path="/resource/new" element={<ResourceManagement modalMode="create" />} />
      <Route path="/account" element={<AccountManagement />} />
      <Route path="/account/add" element={<AccountManagement modalMode="add-account" />} />
      <Route path="/account/invite" element={<AccountManagement modalMode="invite" />} />
      <Route
        path="/account/permission/:collaboratorName"
        element={<AccountManagement modalMode="permission" />}
      />
      <Route path="/data-board" element={<DataBoard />} />
      <Route path="/data-board/:scopeKey" element={<DataBoard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )

  return (
    <DesktopLayoutProvider>
      <IframeScaledShell>
        <div className="h-screen bg-white">
          <div className="flex h-full min-h-[820px] overflow-hidden bg-white">
            <Sidebar />
            <main className="relative flex-1 overflow-hidden bg-white">
              {isImmersiveRoute ? (
                renderRoutes(location)
              ) : (
                <AnimatedRouteViewport location={location} transitionKey={routeTransitionKey} variant={routeVariant}>
                  {(displayLocation) => (
                    <AdaptiveDesktopViewport>{renderRoutes(displayLocation)}</AdaptiveDesktopViewport>
                  )}
                </AnimatedRouteViewport>
              )}
              <FloatingConciergeComposer />
            </main>
          </div>
        </div>
      </IframeScaledShell>
    </DesktopLayoutProvider>
  )
}
