import { useQuery } from '@tanstack/react-query'
import { Row, Col, Card, Statistic, Typography, Spin, Alert } from 'antd'
import {
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  DollarOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reportsApi } from '../../api/reports'

const { Title } = Typography

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f']

const mockWeeklyRevenue = [
  { date: 'Dush', revenue: 1200000 },
  { date: 'Sesh', revenue: 1800000 },
  { date: 'Chor', revenue: 1500000 },
  { date: 'Pay', revenue: 2200000 },
  { date: 'Jum', revenue: 2800000 },
  { date: 'Shan', revenue: 3200000 },
  { date: 'Yak', revenue: 2600000 },
]

const mockRoomStatus = [
  { name: "Bo'sh", value: 12 },
  { name: 'Band', value: 28 },
  { name: 'Tozalanmoqda', value: 5 },
  { name: "Ta'mirda", value: 3 },
]

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportsApi.getDashboardStats,
    retry: false,
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  // Use mock data if API not available
  const displayStats = stats || {
    totalRooms: 48,
    occupiedRooms: 28,
    todayCheckIns: 8,
    todayCheckOuts: 5,
    todayRevenue: 4800000,
    pendingServices: 3,
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      {error && (
        <Alert
          message="API ulanmagan — demo ma'lumotlar ko'rsatilmoqda"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {/* Statistika kartochkalari */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Jami xonalar"
              value={displayStats.totalRooms}
              prefix={<HomeOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Band xonalar"
              value={displayStats.occupiedRooms}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${displayStats.totalRooms}`}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Bugungi Check-in"
              value={displayStats.todayCheckIns}
              prefix={<LoginOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Bugungi Check-out"
              value={displayStats.todayCheckOuts}
              prefix={<LogoutOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Card style={{ height: '100%', background: 'linear-gradient(135deg, #f9f0ff, #efdbff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#722ed1', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <DollarOutlined style={{ color: '#fff', fontSize: 22 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Bugungi daromad</div>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: '#722ed1',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayStats.todayRevenue.toLocaleString()} so'm
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={3}>
          <Card style={{ height: '100%' }}>
            <Statistic
              title="Xizmatlar"
              value={displayStats.pendingServices}
              prefix={<ToolOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: displayStats.pendingServices > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Grafiklar */}
      <Row gutter={[16, 16]}>
        {/* Haftalik daromad */}
        <Col xs={24} lg={16}>
          <Card title="Haftalik daromad (so'm)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockWeeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} so'm`, 'Daromad']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={{ fill: '#1677ff' }}
                  name="Daromad"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Xonalar holati */}
        <Col xs={24} lg={8}>
          <Card title="Xonalar holati">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={mockRoomStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {mockRoomStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Xona turlari bo'yicha band */}
        <Col xs={24}>
          <Card title="Xona turlari bo'yicha bandlik">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { type: 'Standard', total: 30, occupied: 18 },
                { type: 'Lux', total: 12, occupied: 8 },
                { type: 'VIP', total: 6, occupied: 2 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#e6f4ff" name="Jami" />
                <Bar dataKey="occupied" fill="#1677ff" name="Band" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
