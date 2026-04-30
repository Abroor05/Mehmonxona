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

const COLORS = ['#52c41a', '#ff4d4f', '#faad14', '#8c8c8c']

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportsApi.getDashboardStats,
    retry: false,
    staleTime: 30000,
  })

  const { data: occupancy } = useQuery({
    queryKey: ['occupancy-report'],
    queryFn: () => reportsApi.getOccupancy({ period: 'MONTHLY' as never }),
    retry: false,
    staleTime: 30000,
  })

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-report', 'MONTHLY'],
    queryFn: () => reportsApi.getRevenue({ period: 'MONTHLY' as never }),
    retry: false,
    staleTime: 30000,
  })

  const displayStats = stats || {
    totalRooms:      0,
    occupiedRooms:   0,
    todayCheckIns:   0,
    todayCheckOuts:  0,
    todayRevenue:    0,
    pendingServices: 0,
  }

  // Real revenue chart data from backend
  const weeklyRevenueData = revenueData?.data ?? []

  // Real room status pie data from occupancy report
  const roomStatusData = occupancy?.byType?.length
    ? occupancy.byType.map((t) => ({
        name: t.type === 'standard' ? 'Standard' : t.type === 'deluxe' ? 'Deluxe' : 'VIP',
        value: t.total,
      }))
    : [
        { name: "Bo'sh", value: displayStats.totalRooms - displayStats.occupiedRooms },
        { name: 'Band', value: displayStats.occupiedRooms },
      ]

  // Real room type bar data
  const roomTypeBarData = occupancy?.byType?.length
    ? occupancy.byType.map((t) => ({
        type: t.type === 'standard' ? 'Standard' : t.type === 'deluxe' ? 'Deluxe' : 'VIP',
        total: t.total,
        occupied: t.occupied,
      }))
    : [
        { type: 'Standard', total: 0, occupied: 0 },
        { type: 'Deluxe', total: 0, occupied: 0 },
        { type: 'VIP', total: 0, occupied: 0 },
      ]

  if (isLoading && !error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    )
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>

      {error && (
        <Alert
          message="Backend server bilan ulanishda xatolik"
          description="Django server ishlamayapti. Terminalda 'python manage.py runserver' ni ishga tushiring."
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
        {/* Daromad grafigi — real data */}
        <Col xs={24} lg={16}>
          <Card title="Daromad (so'm)">
            {weeklyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyRevenueData}>
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
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Hozircha to'lov ma'lumotlari yo'q
              </div>
            )}
          </Card>
        </Col>

        {/* Xonalar holati — real data */}
        <Col xs={24} lg={8}>
          <Card title="Xonalar holati">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {roomStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Xona turlari bo'yicha band — real data */}
        <Col xs={24}>
          <Card title="Xona turlari bo'yicha bandlik">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roomTypeBarData}>
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
