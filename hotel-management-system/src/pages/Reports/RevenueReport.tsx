import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card, Row, Col, Typography, Select,
  Statistic, Space, Table, Spin, Empty,
} from 'antd'
import { DollarOutlined, RiseOutlined } from '@ant-design/icons'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod } from '../../types/enums'

const { Title } = Typography
const { Option } = Select

export default function RevenueReport() {
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.MONTHLY)

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-report', period],
    queryFn: () => reportsApi.getRevenue({ period }),
    retry: false,
  })

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  const chartData = data?.data ?? []
  const totalRevenue = data?.totalRevenue ?? 0
  const roomRevenue = data?.roomRevenue ?? 0
  const serviceRevenue = data?.serviceRevenue ?? 0

  const tableData = chartData.map((item, index) => ({
    key: index,
    date: item.date,
    revenue: item.revenue,
    growth: index > 0 && chartData[index - 1].revenue > 0
      ? ((item.revenue - chartData[index - 1].revenue) / chartData[index - 1].revenue * 100).toFixed(1)
      : '—',
  }))

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Daromad hisoboti</Title></Col>
        <Col>
          <Space>
            <Select value={period} onChange={setPeriod} style={{ width: 140 }}>
              <Option value={ReportPeriod.DAILY}>Kunlik</Option>
              <Option value={ReportPeriod.MONTHLY}>Oylik</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* Statistika */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami daromad"
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(v) => `${Number(v).toLocaleString()} so'm`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Xona daromadi"
              value={roomRevenue}
              prefix={<RiseOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
              formatter={(v) => `${Number(v).toLocaleString()} so'm`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Xizmat daromadi"
              value={serviceRevenue}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(v) => `${Number(v).toLocaleString()} so'm`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Daromad dinamikasi">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} so'm`, 'Daromad']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} name="Daromad" dot={{ fill: '#1677ff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Ma'lumot yo'q" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Daromad taqsimoti">
            {roomRevenue > 0 || serviceRevenue > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Xona',   value: roomRevenue    },
                  { name: 'Xizmat', value: serviceRevenue },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} so'm`]} />
                  <Bar dataKey="value" fill="#1677ff" name="Summa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Ma'lumot yo'q" style={{ padding: 40 }} />
            )}
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Batafsil ma'lumot">
            {tableData.length > 0 ? (
              <Table
                dataSource={tableData}
                columns={[
                  { title: 'Davr',    dataIndex: 'date',    key: 'date' },
                  { title: 'Daromad', dataIndex: 'revenue', key: 'revenue', render: (v) => `${Number(v).toLocaleString()} so'm` },
                  {
                    title: "O'sish", dataIndex: 'growth', key: 'growth',
                    render: (v) => v === '—' ? '—' : (
                      <span style={{ color: Number(v) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                        {Number(v) >= 0 ? '+' : ''}{v}%
                      </span>
                    ),
                  },
                ]}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="Hozircha to'lov ma'lumotlari yo'q" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
