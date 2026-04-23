import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Select, Space, Typography, Tag, Card,
  Row, Col, Modal, Form, Input, DatePicker, message, Tooltip, Alert,
} from 'antd'
import {
  PlusOutlined, CheckOutlined, ClockCircleOutlined, WarningOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { servicesApi } from '../../api/services'
import { ServiceOrder, CreateServiceOrderDto } from '../../types'
import { ServiceType, ServiceOrderStatus } from '../../types/enums'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.ROOM_CLEANING]: 'Xona tozalash',
  [ServiceType.LAUNDRY]: 'Kir yuvish',
  [ServiceType.TRANSPORT]: 'Transport',
  [ServiceType.SPA]: 'SPA',
  [ServiceType.GYM]: 'Sport zali',
  [ServiceType.CONFERENCE_HALL]: 'Konferensiya zali',
}

const statusConfig: Record<ServiceOrderStatus, { label: string; color: string }> = {
  [ServiceOrderStatus.PENDING]: { label: 'Kutilmoqda', color: 'orange' },
  [ServiceOrderStatus.ASSIGNED]: { label: 'Tayinlangan', color: 'blue' },
  [ServiceOrderStatus.IN_PROGRESS]: { label: 'Bajarilmoqda', color: 'processing' },
  [ServiceOrderStatus.COMPLETED]: { label: 'Bajarildi', color: 'green' },
  [ServiceOrderStatus.CANCELLED]: { label: 'Bekor qilingan', color: 'red' },
}

const mockOrders: ServiceOrder[] = [
  {
    id: '1', orderNumber: 'SVC-001', bookingId: '1', serviceType: ServiceType.ROOM_CLEANING,
    status: ServiceOrderStatus.PENDING, scheduledAt: dayjs().add(1, 'hour').toISOString(),
    price: 50000, createdAt: dayjs().toISOString(),
  },
  {
    id: '2', orderNumber: 'SVC-002', bookingId: '2', serviceType: ServiceType.SPA,
    status: ServiceOrderStatus.ASSIGNED, scheduledAt: dayjs().add(2, 'hour').toISOString(),
    price: 300000, createdAt: dayjs().toISOString(),
  },
  {
    id: '3', orderNumber: 'SVC-003', bookingId: '1', serviceType: ServiceType.LAUNDRY,
    status: ServiceOrderStatus.COMPLETED, scheduledAt: dayjs().subtract(1, 'hour').toISOString(),
    completedAt: dayjs().toISOString(), price: 80000, createdAt: dayjs().toISOString(),
  },
]

export default function ServiceOrders() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<ServiceOrderStatus | 'ALL'>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['service-orders', filterStatus],
    queryFn: () => servicesApi.getOrders({
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
    }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceOrderDto) => servicesApi.createOrder(data),
    onSuccess: () => {
      message.success('Xizmat buyurtmasi yaratildi')
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => servicesApi.completeOrder(id),
    onSuccess: () => {
      message.success('Xizmat bajarildi deb belgilandi')
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const displayData = data?.data || mockOrders
  const filteredData = filterStatus !== 'ALL'
    ? displayData.filter((o) => o.status === filterStatus)
    : displayData

  const isLate = (order: ServiceOrder) => {
    if (order.status === ServiceOrderStatus.COMPLETED || order.status === ServiceOrderStatus.CANCELLED) return false
    return dayjs().diff(dayjs(order.scheduledAt), 'minute') > 30
  }

  const columns: ColumnsType<ServiceOrder> = [
    {
      title: 'Buyurtma',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (val, record) => (
        <Space>
          {isLate(record) && <WarningOutlined style={{ color: '#ff4d4f' }} />}
          <strong>{val}</strong>
        </Space>
      ),
    },
    {
      title: 'Xizmat turi',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type: ServiceType) => serviceTypeLabels[type],
    },
    {
      title: 'Bron',
      dataIndex: 'bookingId',
      key: 'bookingId',
    },
    {
      title: 'Rejalashtirilgan vaqt',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (val) => dayjs(val).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `${val.toLocaleString()} so'm`,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: ServiceOrderStatus, record) => (
        <Space>
          <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
          {isLate(record) && <Tag color="red" icon={<ClockCircleOutlined />}>Kechikmoqda</Tag>}
        </Space>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {[ServiceOrderStatus.ASSIGNED, ServiceOrderStatus.IN_PROGRESS].includes(record.status) && (
            <Tooltip title="Bajarildi deb belgilash">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => completeMutation.mutate(record.id)}
              >
                Bajarildi
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const lateCount = displayData.filter(isLate).length

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Xizmat buyurtmalari</Title></Col>
        <Col>
          <Space>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}>
              <Option value="ALL">Barcha holatlar</Option>
              {Object.values(ServiceOrderStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              Yangi buyurtma
            </Button>
          </Space>
        </Col>
      </Row>

      {lateCount > 0 && (
        <Alert
          message={`${lateCount} ta xizmat 30 daqiqadan ko'proq kechikmoqda!`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          rowClassName={(record) => isLate(record) ? 'ant-table-row-warning' : ''}
          pagination={{ showTotal: (total) => `Jami: ${total} ta buyurtma` }}
        />
      </Card>

      <Modal
        title="Yangi xizmat buyurtmasi"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)} style={{ marginTop: 16 }}>
          <Form.Item name="bookingId" label="Bron ID" rules={[{ required: true }]}>
            <Input placeholder="Bron ID" />
          </Form.Item>
          <Form.Item name="serviceType" label="Xizmat turi" rules={[{ required: true }]}>
            <Select placeholder="Xizmat turini tanlang">
              {Object.values(ServiceType).map((t) => (
                <Option key={t} value={t}>{serviceTypeLabels[t]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="scheduledAt" label="Rejalashtirilgan vaqt" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Izoh">
            <Input.TextArea rows={3} placeholder="Qo'shimcha ma'lumot..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Yaratish</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
