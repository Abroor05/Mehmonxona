import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Typography, Statistic, Table, Spin, Empty } from 'antd'
import { UserOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod } from '../../types/enums'

const { Title } = Typography

export default function GuestStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: () => reportsApi.getGuestStats({ period: ReportPeriod.MONTHLY }),
    retry: false,
  })

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  const totalGuests     = data?.totalGuests     ?? 0
  const newGuests       = data?.newGuests       ?? 0
  const returningGuests = data?.returningGuests ?? 0
  const returningRate   = totalGuests > 0 ? Math.round((returningGuests / totalGuests) * 100) : 0

  const pieData = [
    { name: 'Yangi',     value: newGuests       },
    { name: 'Qaytuvchi', value: returningGuests },
  ].filter((d) => d.value > 0)

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Mijozlar statistikasi</Title></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami mijozlar"
              value={totalGuests}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Yangi mijozlar"
              value={newGuests}
              prefix={<UserAddOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Qaytuvchi mijozlar"
              value={returningGuests}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix={totalGuests > 0 ? `(${returningRate}%)` : ''}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Yangi vs Qaytuvchi mijozlar">
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
                    <Cell fill="#52c41a" />
                    <Cell fill="#1677ff" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Mijozlar yo'q" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Bronlar holati bo'yicha">
            <Table
              dataSource={[
                { key: 'total',    label: 'Jami mijozlar',     value: totalGuests     },
                { key: 'new',      label: 'Yangi mijozlar',    value: newGuests       },
                { key: 'return',   label: 'Qaytuvchi mijozlar', value: returningGuests },
              ]}
              columns={[
                { title: 'Ko\'rsatkich', dataIndex: 'label', key: 'label' },
                { title: 'Soni',         dataIndex: 'value', key: 'value' },
                {
                  title: 'Ulush',
                  key: 'share',
                  render: (_, record) => totalGuests > 0
                    ? `${Math.round((record.value / totalGuests) * 100)}%`
                    : '—',
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
