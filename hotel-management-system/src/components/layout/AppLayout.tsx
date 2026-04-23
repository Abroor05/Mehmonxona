import { Outlet } from 'react-router-dom'
import { Layout, theme } from 'antd'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import { useUIStore } from '../../store/uiStore'

const { Content } = Layout

export default function AppLayout() {
  const { sidebarCollapsed } = useUIStore()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <AppHeader />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
