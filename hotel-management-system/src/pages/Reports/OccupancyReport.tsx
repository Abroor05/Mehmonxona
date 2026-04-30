import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Statistic, Progress, Table, Spin, Empty } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod, RoomType } from '../../types/enums'

const { Title } = Typography

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f']

const roomTypeLabels: Record<string, string> = {
  standard: 'Standard',
  deluxe:   'Deluxe',
  vip:      'VIP',
}

export default function OccupancyReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['occupancy-report'],
    queryFn: () => reportsApi.getOccupancy({ period: ReportPeriod.MONTHLY }),
    retry: false,
  })

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  const totalRooms    = data?.totalRooms    ?? 0
  const occupiedRooms = data?.occupiedRooms ?? 0
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0
  const byType        = data?.byType        ?? []

  const pieData = byType.map((item) => ({
    name:  roomTypeLabels[item.type as string] ?? item.type,
    value: item.occupied,
  })).filter((d) => d.value > 0)

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Bandlik hisoboti</Title></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami xonalar"
              value={totalRooms}
              prefix={<HomeOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Band xonalar"
              value={occupiedRooms}
              suffix={`/ ${totalRooms}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Title level={5} style={{ margin: 0, color: '#666', fontWeight: 400 }}>Bandlik darajasi</Title>
            </div>
            <Progress
              percent={occupancyRate}
              strokeColor={occupancyRate >= 70 ? '#52c41a' : occupancyRate >= 40 ? '#faad14' : '#ff4d4f'}
              format={(p) => `${p}%`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Xona turlari bo'yicha bandlik">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Band xonalar yo'q" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Xona turi bo'yicha taqqoslash">
            {byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byType.map((item) => ({
                  name: roomTypeLabels[item.type as string] ?? item.type,
                  jami: item.total,
                  band: item.occupied,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="jami" fill="#e6f4ff" name="Jami" />
                  <Bar dataKey="band" fill="#1677ff" name="Band" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Ma'lumot yo'q" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Xona turlari bo'yicha batafsil">
            {byType.length > 0 ? (
              <Table
                dataSource={byType.map((item, i) => ({ ...item, key: i }))}
                columns={[
                  {
                    title: 'Xona turi',
                    dataIndex: 'type',
                    key: 'type',
                    render: (t: RoomType) => roomTypeLabels[t as string] ?? t,
                  },
                  { title: 'Jami',  dataIndex: 'total',    key: 'total'    },
                  { title: 'Band',  dataIndex: 'occupied', key: 'occupied' },
                  { title: "Bo'sh", key: 'free', render: (_, r) => r.total - r.occupied },
                  {
                    title: 'Bandlik %',
                    dataIndex: 'rate',
                    key: 'rate',
                    render: (rate) => (
                      <Progress
                        percent={Math.round(rate)}
                        size="small"
                        strokeColor={rate >= 70 ? '#52c41a' : rate >= 40 ? '#faad14' : '#ff4d4f'}
                      />
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Xonalar yo'q" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
