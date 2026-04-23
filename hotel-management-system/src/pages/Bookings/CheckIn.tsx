import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Card, Form, Input, Button, Steps, Typography, Space,
  Descriptions, Tag, Alert, message, Row, Col, DatePicker, Select, InputNumber,
} from 'antd'
import { SearchOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons'
import { bookingsApi } from '../../api/bookings'
import { Booking, CheckInDto } from '../../types'
import { BookingStatus, RoomType } from '../../types/enums'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const roomTypeLabels: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Standard',
  [RoomType.LUX]: 'Lux',
  [RoomType.VIP]: 'VIP',
}

export default function CheckIn() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [searchForm] = Form.useForm()
  const [bookingForm] = Form.useForm()
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [isNewBooking, setIsNewBooking] = useState(false)

  // Mock booking for demo
  const mockBooking: Booking = {
    id: '1', bookingNumber: 'BK-2024-001', guestId: '1',
    guest: { id: '1', firstName: 'Alisher', lastName: 'Karimov', passportNumber: 'AA1234567', phone: '+998901234567', email: 'alisher@example.com', createdAt: '', updatedAt: '' },
    roomId: '1',
    room: { id: '1', roomNumber: '101', type: RoomType.STANDARD, capacity: 2, pricePerNight: 350000, status: 'AVAILABLE' as never, createdAt: '', updatedAt: '' },
    checkInDate: dayjs().format('YYYY-MM-DD'),
    checkOutDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    guestsCount: 2, status: BookingStatus.CONFIRMED,
    totalAmount: 1050000, createdAt: '', updatedAt: '',
  }

  const checkInMutation = useMutation({
    mutationFn: (data: CheckInDto) => bookingsApi.checkIn(data),
    onSuccess: () => {
      message.success('Check-in muvaffaqiyatli amalga oshirildi!')
      navigate('/bookings')
    },
    onError: () => {
      // Demo mode
      message.success('Check-in muvaffaqiyatli amalga oshirildi! (Demo)')
      navigate('/bookings')
    },
  })

  const handleSearch = (values: { query: string }) => {
    // Demo: find mock booking
    if (values.query) {
      setFoundBooking(mockBooking)
      setStep(1)
    } else {
      message.error('Bron topilmadi')
    }
  }

  const handleCheckIn = () => {
    if (foundBooking) {
      checkInMutation.mutate({ bookingId: foundBooking.id })
    }
  }

  const steps = [
    { title: 'Qidirish', icon: <SearchOutlined /> },
    { title: 'Tasdiqlash', icon: <UserOutlined /> },
    { title: 'Check-in', icon: <LoginOutlined /> },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Check-in</Title>

      <Steps current={step} items={steps} style={{ marginBottom: 32 }} />

      {step === 0 && (
        <Card title="Bron qidirish">
          <Alert
            message="Bron raqami yoki pasport raqami orqali qidiring"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Form.Item
              name="query"
              label="Bron raqami yoki Pasport raqami"
              rules={[{ required: true, message: 'Qidiruv so\'zini kiriting' }]}
            >
              <Input
                size="large"
                placeholder="BK-2024-001 yoki AA1234567"
                prefix={<SearchOutlined />}
              />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large">
                Qidirish
              </Button>
              <Button size="large" onClick={() => setIsNewBooking(true)}>
                Yangi bron yaratish
              </Button>
            </Space>
          </Form>

          {isNewBooking && (
            <Card style={{ marginTop: 24 }} title="Yangi bron">
              <Form form={bookingForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="guestId" label="Mijoz" rules={[{ required: true }]}>
                      <Input placeholder="Mijoz ID yoki pasport" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="roomType" label="Xona turi" rules={[{ required: true }]}>
                      <Select placeholder="Turni tanlang">
                        {Object.values(RoomType).map((t) => (
                          <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="checkInDate" label="Kirish sanasi" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="checkOutDate" label="Chiqish sanasi" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="guestsCount" label="Mehmonlar soni" rules={[{ required: true }]}>
                      <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  onClick={() => {
                    setFoundBooking(mockBooking)
                    setStep(1)
                    setIsNewBooking(false)
                  }}
                >
                  Bron yaratish va davom etish
                </Button>
              </Form>
            </Card>
          )}
        </Card>
      )}

      {step === 1 && foundBooking && (
        <Card
          title="Bron ma'lumotlari"
          extra={
            <Space>
              <Button onClick={() => setStep(0)}>Orqaga</Button>
              <Button type="primary" icon={<LoginOutlined />} onClick={() => setStep(2)}>
                Tasdiqlash
              </Button>
            </Space>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Bron raqami">
              <strong>{foundBooking.bookingNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Holat">
              <Tag color="blue">Tasdiqlangan</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mijoz">
              {foundBooking.guest?.firstName} {foundBooking.guest?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Pasport">
              {foundBooking.guest?.passportNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Xona">
              {foundBooking.room?.roomNumber} ({foundBooking.room?.type})
            </Descriptions.Item>
            <Descriptions.Item label="Mehmonlar soni">
              {foundBooking.guestsCount} kishi
            </Descriptions.Item>
            <Descriptions.Item label="Kirish sanasi">
              {foundBooking.checkInDate}
            </Descriptions.Item>
            <Descriptions.Item label="Chiqish sanasi">
              {foundBooking.checkOutDate}
            </Descriptions.Item>
            <Descriptions.Item label="Jami summa" span={2}>
              <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                {foundBooking.totalAmount.toLocaleString()} so'm
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {step === 2 && foundBooking && (
        <Card title="Check-in tasdiqlash">
          <Alert
            message={`Mijoz ${foundBooking.guest?.firstName} ${foundBooking.guest?.lastName} uchun check-in amalga oshirilmoqda`}
            description={`Xona: ${foundBooking.room?.roomNumber} | Kirish vaqti: ${dayjs().format('DD.MM.YYYY HH:mm')}`}
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Space>
            <Button onClick={() => setStep(1)}>Orqaga</Button>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              loading={checkInMutation.isPending}
              onClick={handleCheckIn}
            >
              Check-in ni tasdiqlash
            </Button>
          </Space>
        </Card>
      )}
    </div>
  )
}
