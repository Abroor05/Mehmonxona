import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Statistic, Progress, Table, Button, Space, Spin } from 'antd'
import { DownloadOutlined, HomeOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod, RoomType, ReportFormat } from '../../types/enums'

const { Title } = Typography

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f']

const roomTypeLabels: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Standard',
  [RoomType.LUX]: 'Lux',
  [RoomType.VIP]: 'VIP',
}

const mockData = {
  totalRooms: 48,
  occupiedRooms: 28,
  occupancyRate: 58.3,
  byType: [
    { type: RoomType.STANDARD, total: 30, occupied: 18, rate: 60 },
    { type: RoomType.LUX, total: 12, occupied: 8, rate: 66.7 },
    { type: RoomType.VIP, total: 6, occupied: 2, rate: 33.3 },
  ],
}

export default function OccupancyReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['occupancy-report'],
    queryFn: () => reportsApi.getOccupancy({ period: ReportPeriod.MONTHLY }),
    retry: false,
  })

  const displayData = data || mockData

  const handleExport = async (format: ReportFormat) => {
    try {
      const blob = await reportsApi.exportReport('occupancy', { period: ReportPeriod.MONTHLY, format })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bandlik-hisobot.${format.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Demo mode
    }
  }

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  const pieData = displayData.byType.map((item) => ({
    name: roomTypeLabels[item.type],
    value: item.occupied,
  }))

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Bandlik hisoboti</Title></Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport(ReportFormat.PDF)}>PDF</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport(ReportFormat.EXCEL)}>Excel</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami xonalar"
              value={displayData.totalRooms}
              prefix={<HomeOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Band xonalar"
              value={displayData.occupiedRooms}
              suffix={`/ ${displayData.totalRooms}`}
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
              percent={Math.round(displayData.occupancyRate)}
              strokeColor={displayData.occupancyRate >= 70 ? '#52c41a' : displayData.occupancyRate >= 40 ? '#faad14' : '#ff4d4f'}
              format={(p) => `${p}%`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Xona turlari bo'yicha bandlik">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Xona turi bo'yicha taqqoslash">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={displayData.byType.map((item) => ({
                name: roomTypeLabels[item.type],
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
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Xona turlari bo'yicha batafsil">
            <Table
              dataSource={displayData.byType.map((item, i) => ({ ...item, key: i }))}
              columns={[
                { title: 'Xona turi', dataIndex: 'type', key: 'type', render: (t: RoomType) => roomTypeLabels[t] },
                { title: 'Jami', dataIndex: 'total', key: 'total' },
                { title: 'Band', dataIndex: 'occupied', key: 'occupied' },
                { title: "Bo'sh", key: 'free', render: (_, r) => r.total - r.occupied },
                {
                  title: 'Bandlik %', dataIndex: 'rate', key: 'rate',
                  render: (rate) => (
                    <Progress percent={Math.round(rate)} size="small"
                      strokeColor={rate >= 70 ? '#52c41a' : rate >= 40 ? '#faad14' : '#ff4d4f'}
                    />
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
