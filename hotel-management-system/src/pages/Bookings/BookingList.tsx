import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Select, Space, Typography, Tag, Card,
  Row, Col, Modal, Form, Input, InputNumber, DatePicker,
  message, Tooltip, Alert,
} from 'antd'
import {
  PlusOutlined, LoginOutlined, LogoutOutlined,
  StopOutlined, EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { bookingsApi } from '../../api/bookings'
import { roomsApi } from '../../api/rooms'
import { Booking } from '../../types'
import { BookingStatus, RoomType } from '../../types/enums'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Option } = Select

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  [BookingStatus.PENDING]:     { label: 'Kutilmoqda',      color: 'orange'  },
  [BookingStatus.CONFIRMED]:   { label: 'Tasdiqlangan',    color: 'blue'    },
  [BookingStatus.CHECKED_IN]:  { label: 'Kirgan',          color: 'green'   },
  [BookingStatus.CHECKED_OUT]: { label: 'Chiqqan',         color: 'default' },
  [BookingStatus.CANCELLED]:   { label: 'Bekor qilingan',  color: 'red'     },
}

const roomTypeLabels: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Standard',
  [RoomType.LUX]:      'Deluxe',
  [RoomType.VIP]:      'VIP',
}

export default function BookingList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Bronlar ro'yxati
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, filterStatus],
    queryFn: () => bookingsApi.getAll({
      page,
      pageSize: 10,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
    }),
    retry: false,
  })

  // Bo'sh xonalar (bron yaratish uchun)
  const checkIn  = form.getFieldValue('checkInDate')
  const checkOut = form.getFieldValue('checkOutDate')
  const { data: availableRooms } = useQuery({
    queryKey: ['available-rooms', checkIn, checkOut],
    queryFn: () => roomsApi.getAvailableRooms({
      checkInDate:  checkIn  ? dayjs(checkIn).format('YYYY-MM-DD')  : dayjs().format('YYYY-MM-DD'),
      checkOutDate: checkOut ? dayjs(checkOut).format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD'),
    }),
    enabled: !!checkIn && !!checkOut,
    retry: false,
  })

  // Yangi bron yaratish
  const createMutation = useMutation({
    mutationFn: (values: {
      roomId: string
      checkInDate: string
      checkOutDate: string
      guestsCount: number
      notes?: string
    }) => bookingsApi.create({
      guestId:      '',
      roomId:       values.roomId,
      checkInDate:  values.checkInDate,
      checkOutDate: values.checkOutDate,
      guestsCount:  values.guestsCount,
      notes:        values.notes,
    }),
    onSuccess: (booking) => {
      message.success(`Bron yaratildi: ${booking.bookingNumber}`)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const errors = e?.response?.data
      if (errors) {
        const msg = Object.values(errors).flat().join(' | ')
        message.error(msg)
      } else {
        message.error('Bron yaratishda xatolik yuz berdi')
      }
    },
  })

  // Bronni bekor qilish
  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      message.success('Bron bekor qilindi')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const handleCreate = (values: Record<string, unknown>) => {
    createMutation.mutate({
      roomId:       String(values.roomId),
      checkInDate:  dayjs(values.checkInDate as string).format('YYYY-MM-DD'),
      checkOutDate: dayjs(values.checkOutDate as string).format('YYYY-MM-DD'),
      guestsCount:  Number(values.guestsCount),
      notes:        values.notes as string | undefined,
    })
  }

  const displayData = data?.data ?? []

  const columns: ColumnsType<Booking> = [
    {
      title: 'Bron raqami',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (val) => <strong style={{ color: '#1677ff' }}>{val}</strong>,
    },
    {
      title: 'Mijoz',
      key: 'guest',
      render: (_, r) => r.guest
        ? `${r.guest.firstName} ${r.guest.lastName}`
        : <span style={{ color: '#999' }}>#{r.guestId}</span>,
    },
    {
      title: 'Xona',
      key: 'room',
      render: (_, r) => r.room
        ? <Tag color="blue">{r.room.roomNumber}</Tag>
        : <span style={{ color: '#999' }}>#{r.roomId}</span>,
    },
    {
      title: 'Kirish',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
    },
    {
      title: 'Chiqish',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
    },
    {
      title: 'Summa',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val) => <strong>{Number(val).toLocaleString()} so'm</strong>,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: BookingStatus) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.label}</Tag>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {record.status === BookingStatus.CONFIRMED && (
            <Tooltip title="Check-in">
              <Button
                type="text"
                icon={<LoginOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => navigate('/bookings/check-in')}
              />
            </Tooltip>
          )}
          {record.status === BookingStatus.CHECKED_IN && (
            <Tooltip title="Check-out">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                size="small"
                style={{ color: '#1677ff' }}
                onClick={() => navigate('/bookings/check-out')}
              />
            </Tooltip>
          )}
          {[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(record.status) && (
            <Tooltip title="Bekor qilish">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => Modal.confirm({
                  title: 'Bronni bekor qilish',
                  content: 'Haqiqatan ham bekor qilmoqchimisiz?',
                  okText: 'Ha',
                  cancelText: "Yo'q",
                  okButtonProps: { danger: true },
                  onOk: () => cancelMutation.mutate(record.id),
                })}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>Bronlar</Title></Col>
        <Col>
          <Space>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}>
              <Option value="ALL">Barcha holatlar</Option>
              {Object.values(BookingStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
            {hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { form.resetFields(); setModalOpen(true) }}
              >
                Yangi bron
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={displayData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            total: data?.total || displayData.length,
            pageSize: 10,
            onChange: setPage,
            showTotal: (total) => `Jami: ${total} ta bron`,
          }}
        />
      </Card>

      {/* Yangi bron yaratish modali */}
      <Modal
        title="Yangi bron yaratish"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        width={560}
      >
        <Alert
          message="Bron yaratilganda siz (tizimga kirgan xodim) mijoz sifatida belgilanadi"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          style={{ marginTop: 8 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkInDate"
                label="Kirish sanasi"
                rules={[{ required: true, message: 'Kirish sanasini tanlang' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(d) => d.isBefore(dayjs(), 'day')}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkOutDate"
                label="Chiqish sanasi"
                rules={[{ required: true, message: 'Chiqish sanasini tanlang' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(d) => {
                    const ci = form.getFieldValue('checkInDate')
                    return ci ? d.isBefore(dayjs(ci).add(1, 'day'), 'day') : d.isBefore(dayjs(), 'day')
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="roomId"
            label="Xona"
            rules={[{ required: true, message: 'Xonani tanlang' }]}
          >
            <Select
              placeholder={
                checkIn && checkOut
                  ? `${availableRooms?.length ?? 0} ta bo'sh xona`
                  : "Avval sanalarni tanlang"
              }
              disabled={!checkIn || !checkOut}
              showSearch
              optionFilterProp="children"
            >
              {(availableRooms ?? []).map((room) => (
                <Option key={room.id} value={room.id}>
                  Xona {room.roomNumber} — {roomTypeLabels[room.type]} —{' '}
                  {room.pricePerNight.toLocaleString()} so'm/kun
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="guestsCount"
            label="Mehmonlar soni"
            rules={[{ required: true, message: 'Mehmonlar sonini kiriting' }]}
            initialValue={1}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="notes" label="Izoh (ixtiyoriy)">
            <Input.TextArea rows={2} placeholder="Qo'shimcha ma'lumot..." />
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
                icon={<PlusOutlined />}
              >
                Bron yaratish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
