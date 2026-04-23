import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  TeamOutlined,
  ToolOutlined,
  BarChartOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Sider } = Layout

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
  roles: StaffRole[]
  children?: { key: string; label: string; roles: StaffRole[] }[]
}

const ALL_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST, StaffRole.HOUSEKEEPER, StaffRole.ACCOUNTANT]
const ADMIN_MANAGER = [StaffRole.ADMIN, StaffRole.MANAGER]
const ADMIN_MANAGER_RECEPTIONIST = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]
const ADMIN_MANAGER_ACCOUNTANT = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTANT]

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    roles: ALL_ROLES,
  },
  {
    key: '/guests',
    icon: <UserOutlined />,
    label: 'Mijozlar',
    roles: ADMIN_MANAGER_RECEPTIONIST,
  },
  {
    key: '/rooms',
    icon: <HomeOutlined />,
    label: 'Xonalar',
    roles: ALL_ROLES,
  },
  {
    key: '/bookings',
    icon: <CalendarOutlined />,
    label: 'Bronlar',
    roles: ADMIN_MANAGER_RECEPTIONIST,
    children: [
      { key: '/bookings', label: 'Barcha bronlar', roles: ADMIN_MANAGER_RECEPTIONIST },
      { key: '/bookings/check-in', label: 'Check-in', roles: ADMIN_MANAGER_RECEPTIONIST },
      { key: '/bookings/check-out', label: 'Check-out', roles: ADMIN_MANAGER_RECEPTIONIST },
    ],
  },
  {
    key: '/payments',
    icon: <CreditCardOutlined />,
    label: "To'lovlar",
    roles: ADMIN_MANAGER_ACCOUNTANT,
  },
  {
    key: '/staff',
    icon: <TeamOutlined />,
    label: 'Xodimlar',
    roles: ADMIN_MANAGER,
  },
  {
    key: '/services',
    icon: <ToolOutlined />,
    label: 'Xizmatlar',
    roles: ALL_ROLES,
    children: [
      { key: '/services', label: 'Xizmat turlari', roles: ALL_ROLES },
      { key: '/services/orders', label: 'Buyurtmalar', roles: ALL_ROLES },
    ],
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: 'Hisobotlar',
    roles: ADMIN_MANAGER_ACCOUNTANT,
    children: [
      { key: '/reports/revenue', label: 'Daromad', roles: ADMIN_MANAGER_ACCOUNTANT },
      { key: '/reports/occupancy', label: 'Bandlik', roles: ADMIN_MANAGER },
      { key: '/reports/guests', label: 'Mijozlar statistikasi', roles: ADMIN_MANAGER },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed } = useUIStore()
  const { user } = useAuthStore()

  const userRole = user?.role

  const filteredItems = menuItems
    .filter((item) => !userRole || item.roles.includes(userRole))
    .map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      children: item.children
        ?.filter((child) => !userRole || child.roles.includes(userRole))
        .map((child) => ({
          key: child.key,
          label: child.label,
        })),
    }))

  const selectedKeys = [location.pathname]
  const openKeys = menuItems
    .filter((item) => item.children?.some((child) => location.pathname.startsWith(child.key)))
    .map((item) => item.key)

  return (
    <Sider
      collapsed={sidebarCollapsed}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 16px',
      }}>
        <BankOutlined style={{ fontSize: 24, color: '#fff' }} />
        {!sidebarCollapsed && (
          <span style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            marginLeft: 12,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>
            Mehmonxona
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={filteredItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  )
}
