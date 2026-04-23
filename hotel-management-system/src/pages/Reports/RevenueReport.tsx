import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card, Row, Col, Typography, Select, DatePicker, Button,
  Statistic, Space, Table, Spin,
} from 'antd'
import {
  DownloadOutlined, DollarOutlined, RiseOutlined,
} from '@ant-design/icons'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reportsApi } from '../../api/reports'
import { ReportPeriod, ReportFormat } from '../../types/enums'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const mockData = {
  period: 'monthly',
  totalRevenue: 48500000,
  roomRevenue: 38000000,
  serviceRevenue: 10500000,
  data: [
    { date: 'Yanvar', revenue: 3200000 },
    { date: 'Fevral', revenue: 4100000 },
    { date: 'Mart', revenue: 3800000 },
    { date: 'Aprel', revenue: 5200000 },
    { date: 'May', revenue: 6100000 },
    { date: 'Iyun', revenue: 7800000 },
    { date: 'Iyul', revenue: 8200000 },
    { date: 'Avgust', revenue: 7500000 },
    { date: 'Sentabr', revenue: 5900000 },
    { date: 'Oktabr', revenue: 4800000 },
    { date: 'Noyabr', revenue: 3900000 },
    { date: 'Dekabr', revenue: 4200000 },
  ],
}

export default function RevenueReport() {
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.MONTHLY)

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-report', period],
    queryFn: () => reportsApi.getRevenue({ period }),
    retry: false,
  })

  const displayData = data || mockData

  const tableData = displayData.data.map((item, index) => ({
    key: index,
    date: item.date,
    revenue: item.revenue,
    growth: index > 0
      ? ((item.revenue - displayData.data[index - 1].revenue) / displayData.data[index - 1].revenue * 100).toFixed(1)
      : '—',
  }))

  const handleExport = async (format: ReportFormat) => {
    try {
      const blob = await reportsApi.exportReport('revenue', { period, format })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `daromad-hisobot.${format.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Demo mode
    }
  }

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Daromad hisoboti</Title></Col>
        <Col>
          <Space>
            <Select value={period} onChange={setPeriod} style={{ width: 140 }}>
              <Option value={ReportPeriod.DAILY}>Kunlik</Option>
              <Option value={ReportPeriod.WEEKLY}>Haftalik</Option>
              <Option value={ReportPeriod.MONTHLY}>Oylik</Option>
            </Select>
            <RangePicker placeholder={['Boshlanish', 'Tugash']} />
            <Button icon={<DownloadOutlined />} onClick={() => handleExport(ReportFormat.PDF)}>PDF</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport(ReportFormat.EXCEL)}>Excel</Button>
          </Space>
        </Col>
      </Row>

      {/* Statistika */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Jami daromad"
              value={displayData.totalRevenue}
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
              value={displayData.roomRevenue}
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
              value={displayData.serviceRevenue}
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(v) => `${Number(v).toLocaleString()} so'm`}
            />
          </Card>
        </Col>
      </Row>

      {/* Grafik */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Daromad dinamikasi">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} so'm`, 'Daromad']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1677ff" strokeWidth={2} name="Daromad" dot={{ fill: '#1677ff' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Daromad taqsimoti">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Xona', value: displayData.roomRevenue },
                { name: 'Xizmat', value: displayData.serviceRevenue },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} so'm`]} />
                <Bar dataKey="value" fill="#1677ff" name="Summa" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Jadval */}
        <Col xs={24}>
          <Card title="Batafsil ma'lumot">
            <Table
              dataSource={tableData}
              columns={[
                { title: 'Davr', dataIndex: 'date', key: 'date' },
                { title: 'Daromad', dataIndex: 'revenue', key: 'revenue', render: (v) => `${v.toLocaleString()} so'm` },
                {
                  title: 'O\'sish', dataIndex: 'growth', key: 'growth',
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
          </Card>
        </Col>
      </Row>
    </div>
  )
}
