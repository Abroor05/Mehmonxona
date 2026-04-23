import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Select, Space, Typography, Tag, Card,
  Row, Col, DatePicker, Modal, message, Tooltip,
} from 'antd'
import {
  PlusOutlined, LoginOutlined, LogoutOutlined,
  StopOutlined, EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { bookingsApi } from '../../api/bookings'
import { Booking } from '../../types'
import { BookingStatus } from '../../types/enums'

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  [BookingStatus.PENDING]: { label: 'Kutilmoqda', color: 'orange' },
  [BookingStatus.CONFIRMED]: { label: 'Tasdiqlangan', color: 'blue' },
  [BookingStatus.CHECKED_IN]: { label: 'Kirgan', color: 'green' },
  [BookingStatus.CHECKED_OUT]: { label: 'Chiqqan', color: 'default' },
  [BookingStatus.CANCELLED]: { label: 'Bekor qilingan', color: 'red' },
}

const mockBookings: Booking[] = [
  {
    id: '1', bookingNumber: 'BK-2024-001', guestId: '1',
    guest: { id: '1', firstName: 'Alisher', lastName: 'Karimov', passportNumber: 'AA1234567', phone: '+998901234567', email: 'a@a.com', createdAt: '', updatedAt: '' },
    roomId: '1',
    room: { id: '1', roomNumber: '101', type: 'STANDARD' as never, capacity: 2, pricePerNight: 350000, status: 'AVAILABLE' as never, createdAt: '', updatedAt: '' },
    checkInDate: '2024-04-20', checkOutDate: '2024-04-23', guestsCount: 2,
    status: BookingStatus.CONFIRMED, totalAmount: 1050000, createdAt: '2024-04-18', updatedAt: '2024-04-18',
  },
  {
    id: '2', bookingNumber: 'BK-2024-002', guestId: '2',
    guest: { id: '2', firstName: 'Malika', lastName: 'Yusupova', passportNumber: 'BB7654321', phone: '+998907654321', email: 'm@m.com', createdAt: '', updatedAt: '' },
    roomId: '3',
    room: { id: '3', roomNumber: '201', type: 'LUX' as never, capacity: 3, pricePerNight: 650000, status: 'OCCUPIED' as never, createdAt: '', updatedAt: '' },
    checkInDate: '2024-04-22', checkOutDate: '2024-04-25', guestsCount: 2,
    status: BookingStatus.CHECKED_IN, totalAmount: 1950000, createdAt: '2024-04-19', updatedAt: '2024-04-22',
  },
]

export default function BookingList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', page, filterStatus],
    queryFn: () => bookingsApi.getAll({
      page,
      pageSize: 10,
      status: filterStatus !== 'ALL' ? filterStatus : undefined,
    }),
    retry: false,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      message.success('Bron bekor qilindi')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const displayData = data?.data || mockBookings

  const columns: ColumnsType<Booking> = [
    {
      title: 'Bron raqami',
      dataIndex: 'bookingNumber',
      key: 'bookingNumber',
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: 'Mijoz',
      key: 'guest',
      render: (_, r) => r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : r.guestId,
    },
    {
      title: 'Xona',
      key: 'room',
      render: (_, r) => r.room ? `${r.room.roomNumber}` : r.roomId,
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
      render: (val) => `${val.toLocaleString()} so'm`,
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: BookingStatus) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
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
                  cancelText: 'Yo\'q',
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
            <RangePicker placeholder={['Boshlanish', 'Tugash']} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/bookings/check-in')}>
              Yangi bron
            </Button>
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
    </div>
  )
}
