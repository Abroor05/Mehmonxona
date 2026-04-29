import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Row, Col, Card, Tag, Button, Select, Space, Typography,
  Modal, Form, Input, InputNumber, message, Badge, Tooltip,
} from 'antd'
import {
  PlusOutlined, EditOutlined, HomeOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, SyncOutlined,
} from '@ant-design/icons'
import { roomsApi } from '../../api/rooms'
import { Room, CreateRoomDto } from '../../types'
import { RoomType, RoomStatus } from '../../types/enums'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Option } = Select

const roomTypeLabels: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Standard',
  [RoomType.LUX]: 'Lux',
  [RoomType.VIP]: 'VIP',
}

const roomTypeColors: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'blue',
  [RoomType.LUX]: 'gold',
  [RoomType.VIP]: 'purple',
}

const statusConfig: Record<RoomStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [RoomStatus.AVAILABLE]: { label: "Bo'sh", color: '#52c41a', icon: <CheckCircleOutlined /> },
  [RoomStatus.OCCUPIED]: { label: 'Band', color: '#ff4d4f', icon: <CloseCircleOutlined /> },
  [RoomStatus.CLEANING]: { label: 'Tozalanmoqda', color: '#faad14', icon: <SyncOutlined spin /> },
  [RoomStatus.MAINTENANCE]: { label: "Ta'mirda", color: '#8c8c8c', icon: <ToolOutlined /> },
}

export default function RoomList() {
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const [filterType, setFilterType] = useState<RoomType | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'ALL'>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [form] = Form.useForm()
  const [statusForm] = Form.useForm()

  const { data } = useQuery({
    queryKey: ['rooms', filterType, filterStatus],
    queryFn: () => roomsApi.getAll({
      type: filterType !== 'ALL' ? filterType : undefined,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
    }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateRoomDto) => roomsApi.create(data),
    onSuccess: () => {
      message.success('Xona qo\'shildi')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: RoomStatus; reason?: string }) =>
      roomsApi.updateStatus(id, { status, reason }),
    onSuccess: () => {
      message.success('Xona holati yangilandi')
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setStatusModalOpen(false)
      statusForm.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const displayRooms = data?.data ?? []
  const filteredRooms = displayRooms.filter((room) => {
    if (filterType !== 'ALL' && room.type !== filterType) return false
    if (filterStatus !== 'ALL' && room.status !== filterStatus) return false
    return true
  })

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Xonalar</Title>
        </Col>
        <Col>
          <Space>
            <Select value={filterType} onChange={setFilterType} style={{ width: 140 }}>
              <Option value="ALL">Barcha turlar</Option>
              {Object.values(RoomType).map((t) => (
                <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}>
              <Option value="ALL">Barcha holatlar</Option>
              {Object.values(RoomStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
            {hasRole([StaffRole.ADMIN]) && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                Yangi xona
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Statistika */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {Object.values(RoomStatus).map((status) => {
          const count = displayRooms.filter((r) => r.status === status).length
          const cfg = statusConfig[status]
          return (
            <Col key={status}>
              <Tag color={cfg.color} style={{ padding: '4px 12px', fontSize: 13 }}>
                {cfg.icon} {cfg.label}: {count}
              </Tag>
            </Col>
          )
        })}
      </Row>

      {/* Xonalar grid */}
      <Row gutter={[16, 16]}>
        {filteredRooms.map((room) => {
          const cfg = statusConfig[room.status]
          return (
            <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card
                hoverable
                style={{ borderTop: `3px solid ${cfg.color}` }}
                actions={[
                  hasRole([StaffRole.ADMIN, StaffRole.MANAGER]) ? (
                    <Tooltip title="Holat o'zgartirish" key="status">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => { setSelectedRoom(room); setStatusModalOpen(true) }}
                      />
                    </Tooltip>
                  ) : <span key="empty" />,
                ]}
              >
                <div style={{ textAlign: 'center' }}>
                  <HomeOutlined style={{ fontSize: 32, color: cfg.color, marginBottom: 8 }} />
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{room.roomNumber}</div>
                  <Tag color={roomTypeColors[room.type]} style={{ marginTop: 4 }}>
                    {roomTypeLabels[room.type]}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Badge color={cfg.color} text={cfg.label} />
                  </div>
                  <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                    {room.capacity} kishi • {room.pricePerNight.toLocaleString()} so'm/kun
                  </div>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Yangi xona modali */}
      <Modal
        title="Yangi xona qo'shish"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createMutation.mutate(v)} style={{ marginTop: 16 }}>
          <Form.Item name="roomNumber" label="Xona raqami" rules={[{ required: true }]}>
            <Input placeholder="101" />
          </Form.Item>
          <Form.Item name="type" label="Xona turi" rules={[{ required: true }]}>
            <Select placeholder="Turni tanlang">
              {Object.values(RoomType).map((t) => (
                <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capacity" label="Sig'im" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pricePerNight" label="Narx (so'm/kun)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Qo'shish</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Holat o'zgartirish modali */}
      <Modal
        title={`Xona ${selectedRoom?.roomNumber} — holat o'zgartirish`}
        open={statusModalOpen}
        onCancel={() => { setStatusModalOpen(false); statusForm.resetFields() }}
        footer={null}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={(v) => selectedRoom && updateStatusMutation.mutate({ id: selectedRoom.id, ...v })}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="status" label="Yangi holat" rules={[{ required: true }]}>
            <Select placeholder="Holatni tanlang">
              {Object.values(RoomStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="Sabab (ixtiyoriy)">
            <Input.TextArea rows={3} placeholder="Holat o'zgarish sababi..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStatusModalOpen(false)}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={updateStatusMutation.isPending}>Saqlash</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
