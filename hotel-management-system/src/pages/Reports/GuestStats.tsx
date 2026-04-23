import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Statistic, Table, Button, Space, Spin } from 'antd'
import { DownloadOutlined, UserOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod, ReportFormat } from '../../types/enums'

const { Title } = Typography

const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']

const mockData = {
  totalGuests: 342,
  newGuests: 89,
  returningGuests: 253,
  byNationality: [
    { nationality: "O'zbek", count: 180 },
    { nationality: 'Rus', count: 62 },
    { nationality: 'Qozog\'istonlik', count: 38 },
    { nationality: 'Turk', count: 28 },
    { nationality: 'Amerika', count: 18 },
    { nationality: 'Boshqa', count: 16 },
  ],
}

export default function GuestStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: () => reportsApi.getGuestStats({ period: ReportPeriod.MONTHLY }),
    retry: false,
  })

  const displayData = data || mockData

  const handleExport = async (format: ReportFormat) => {
    try {
      const blob = await reportsApi.exportReport('guests', { period: ReportPeriod.MONTHLY, format })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mijozlar-statistika.${format.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Demo mode
    }
  }

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  const returningRate = Math.round((displayData.returningGuests / displayData.totalGuests) * 100)

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Mijozlar statistikasi</Title></Col>
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
              title="Jami mijozlar"
              value={displayData.totalGuests}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Yangi mijozlar"
              value={displayData.newGuests}
              prefix={<UserAddOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Qaytuvchi mijozlar"
              value={displayData.returningGuests}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix={`(${returningRate}%)`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Yangi vs Qaytuvchi mijozlar">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Yangi', value: displayData.newGuests },
                    { name: 'Qaytuvchi', value: displayData.returningGuests },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#52c41a" />
                  <Cell fill="#1677ff" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Millat bo'yicha taqsimot">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={displayData.byNationality} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nationality" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" name="Mijozlar soni">
                  {displayData.byNationality.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Millat bo'yicha batafsil">
            <Table
              dataSource={displayData.byNationality.map((item, i) => ({ ...item, key: i }))}
              columns={[
                { title: 'Millat', dataIndex: 'nationality', key: 'nationality' },
                { title: 'Mijozlar soni', dataIndex: 'count', key: 'count' },
                {
                  title: 'Ulush', key: 'share',
                  render: (_, record) => `${Math.round((record.count / displayData.totalGuests) * 100)}%`,
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
