import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Card, Typography, Tag, Select, Space, Row, Col,
  DatePicker, Statistic, Button, Modal, Form, Input, InputNumber, message,
} from 'antd'
import { DollarOutlined, FileTextOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { paymentsApi } from '../../api/payments'
import { Payment } from '../../types'
import { PaymentMethod, PaymentStatus } from '../../types/enums'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const methodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: '💵 Naqd pul',
  [PaymentMethod.CARD]: '💳 Bank kartasi',
  [PaymentMethod.ONLINE]: '🌐 Onlayn',
}

const methodColors: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'green',
  [PaymentMethod.CARD]: 'blue',
  [PaymentMethod.ONLINE]: 'purple',
}

const statusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Kutilmoqda',
  [PaymentStatus.COMPLETED]: 'Bajarildi',
  [PaymentStatus.FAILED]: 'Xato',
  [PaymentStatus.REFUNDED]: 'Qaytarildi',
}

const statusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'orange',
  [PaymentStatus.COMPLETED]: 'green',
  [PaymentStatus.FAILED]: 'red',
  [PaymentStatus.REFUNDED]: 'default',
}

// Demo to'lovlar
const mockPayments: Payment[] = [
  { id: '1', transactionNumber: 'TXN-001', bookingId: 'BK-2024-001', amount: 1050000, method: PaymentMethod.CASH, status: PaymentStatus.COMPLETED, processedBy: 'Admin', processedAt: '2024-04-20 10:30' },
  { id: '2', transactionNumber: 'TXN-002', bookingId: 'BK-2024-002', amount: 2320000, method: PaymentMethod.CARD, status: PaymentStatus.COMPLETED, processedBy: 'Menejer', processedAt: '2024-04-22 14:15' },
  { id: '3', transactionNumber: 'TXN-003', bookingId: 'BK-2024-003', amount: 3600000, method: PaymentMethod.ONLINE, status: PaymentStatus.PENDING, processedBy: 'Admin', processedAt: '2024-04-23 09:00' },
]

export default function PaymentList() {
  const queryClient = useQueryClient()
  const { user, hasRole } = useAuthStore()
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [localPayments, setLocalPayments] = useState<Payment[]>(mockPayments)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, filterMethod],
    queryFn: () => paymentsApi.getAll({
      page,
      pageSize: 10,
      method: filterMethod !== 'ALL' ? filterMethod : undefined,
    }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (values: { bookingId: string; amount: number; method: PaymentMethod; discountCode?: string }) =>
      paymentsApi.processPayment(values),
    onSuccess: () => {
      message.success("To'lov muvaffaqiyatli amalga oshirildi!")
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      // Demo rejim — API yo'q bo'lsa ham ishlaydi
      const values = form.getFieldsValue()
      const newPayment: Payment = {
        id: String(Date.now()),
        transactionNumber: `TXN-${String(Date.now()).slice(-4)}`,
        bookingId: values.bookingId || 'BK-DEMO',
        amount: values.amount || 0,
        method: values.method,
        status: PaymentStatus.COMPLETED,
        processedBy: user?.firstName || 'Xodim',
        processedAt: new Date().toLocaleString('uz-UZ'),
      }
      setLocalPayments((prev) => [newPayment, ...prev])
      message.success("To'lov muvaffaqiyatli amalga oshirildi! (Demo)")
      setModalOpen(false)
      form.resetFields()
    },
  })

  const displayData = data?.data || localPayments
  const filteredData = filterMethod !== 'ALL'
    ? displayData.filter((p) => p.method === filterMethod)
    : displayData

  const totalRevenue = filteredData
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0)

  const columns: ColumnsType<Payment> = [
    {
      title: 'Tranzaksiya',
      dataIndex: 'transactionNumber',
      key: 'transactionNumber',
      render: (val) => <strong style={{ color: '#1677ff' }}>{val}</strong>,
    },
    {
      title: 'Bron raqami',
      dataIndex: 'bookingId',
      key: 'bookingId',
    },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => (
        <strong style={{ color: '#52c41a' }}>{val.toLocaleString()} so'm</strong>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "To'lov usuli",
      dataIndex: 'method',
      key: 'method',
      render: (method: PaymentMethod) => (
        <Tag color={methodColors[method]}>{methodLabels[method]}</Tag>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: PaymentStatus) => (
        <Tag color={statusColors[status]} icon={status === PaymentStatus.COMPLETED ? <CheckCircleOutlined /> : undefined}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'Xodim',
      dataIndex: 'processedBy',
      key: 'processedBy',
    },
    {
      title: 'Vaqt',
      dataIndex: 'processedAt',
      key: 'processedAt',
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: () => (
        <Button type="text" icon={<FileTextOutlined />} size="small">
          Faktura
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>To'lovlar</Title></Col>
        <Col>
          <Space>
            <Select value={filterMethod} onChange={setFilterMethod} style={{ width: 150 }}>
              <Option value="ALL">Barcha usullar</Option>
              {Object.values(PaymentMethod).map((m) => (
                <Option key={m} value={m}>{methodLabels[m]}</Option>
              ))}
            </Select>
            <RangePicker placeholder={['Boshlanish', 'Tugash']} />
            {hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTANT]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Yangi to'lov
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Statistika */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card style={{ background: 'linear-gradient(135deg, #f6ffed, #d9f7be)' }}>
            <Statistic
              title="Jami daromad"
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
              formatter={(v) => `${Number(v).toLocaleString()} so'm`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bajarilgan to'lovlar"
              value={filteredData.filter((p) => p.status === PaymentStatus.COMPLETED).length}
              valueStyle={{ color: '#1677ff' }}
              suffix="ta"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Kutilayotgan to'lovlar"
              value={filteredData.filter((p) => p.status === PaymentStatus.PENDING).length}
              valueStyle={{ color: '#faad14' }}
              suffix="ta"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            total: data?.total || filteredData.length,
            pageSize: 10,
            onChange: setPage,
            showTotal: (total) => `Jami: ${total} ta to'lov`,
          }}
        />
      </Card>

      {/* Yangi to'lov modali */}
      <Modal
        title="Yangi to'lov qo'shish"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="bookingId"
            label="Bron raqami"
            rules={[{ required: true, message: 'Bron raqamini kiriting' }]}
          >
            <Input placeholder="BK-2024-001" prefix={<FileTextOutlined />} />
          </Form.Item>

          <Form.Item
            name="amount"
            label="To'lov summasi (so'm)"
            rules={[{ required: true, message: 'Summani kiriting' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="1 000 000"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="method"
            label="To'lov usuli"
            rules={[{ required: true, message: "To'lov usulini tanlang" }]}
          >
            <Select placeholder="Usulni tanlang" size="large">
              {Object.values(PaymentMethod).map((m) => (
                <Option key={m} value={m}>{methodLabels[m]}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="discountCode" label="Chegirma kodi (ixtiyoriy)">
            <Input placeholder="DISCOUNT10" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
                icon={<DollarOutlined />}
                size="large"
              >
                To'lovni amalga oshirish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
