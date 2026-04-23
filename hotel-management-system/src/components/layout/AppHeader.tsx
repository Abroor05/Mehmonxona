import { useNavigate } from 'react-router-dom'
import { Layout, Button, Avatar, Dropdown, Badge, Space, Typography } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { authApi } from '../../api/auth'

const { Header } = Layout
const { Text } = Typography

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Menejer',
  RECEPTIONIST: 'Resepsionist',
  HOUSEKEEPER: 'Tozalovchi',
  ACCOUNTANT: 'Hisobchi',
}

export default function AppHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, unreadCount } = useUIStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Sozlamalar',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Header style={{
      padding: '0 24px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 99,
    }}>
      {/* Sidebar toggle */}
      <Button
        type="text"
        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={toggleSidebar}
        style={{ fontSize: 18, width: 40, height: 40 }}
      />

      {/* Right side */}
      <Space size="middle">
        {/* Bildirishnomalar */}
        <Badge count={unreadCount} size="small">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            style={{ width: 40, height: 40 }}
          />
        </Badge>

        {/* Foydalanuvchi */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              style={{ backgroundColor: '#1677ff' }}
              icon={<UserOutlined />}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div>
                <Text strong style={{ fontSize: 14 }}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role ? roleLabels[user.role] : ''}
                </Text>
              </div>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  )
}
