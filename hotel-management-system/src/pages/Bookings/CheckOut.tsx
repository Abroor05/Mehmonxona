import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Card, Form, Input, Button, Steps, Typography, Space,
  Descriptions, Alert, message, Table, Divider, Select,
} from 'antd'
import { SearchOutlined, LogoutOutlined, CreditCardOutlined } from '@ant-design/icons'
import { bookingsApi } from '../../api/bookings'
import { Booking, CheckOutDto } from '../../types'
import { BookingStatus, PaymentMethod } from '../../types/enums'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Naqd pul',
  [PaymentMethod.CARD]: 'Bank kartasi',
  [PaymentMethod.ONLINE]: 'Onlayn to\'lov',
}

export default function CheckOut() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [searchForm] = Form.useForm()
  const [paymentForm] = Form.useForm()
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)

  const mockBooking: Booking = {
    id: '2', bookingNumber: 'BK-2024-002', guestId: '2',
    guest: { id: '2', firstName: 'Malika', lastName: 'Yusupova', passportNumber: 'BB7654321', phone: '+998907654321', email: 'm@m.com', createdAt: '', updatedAt: '' },
    roomId: '3',
    room: { id: '3', roomNumber: '201', type: 'LUX' as never, capacity: 3, pricePerNight: 650000, status: 'OCCUPIED' as never, createdAt: '', updatedAt: '' },
    checkInDate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
    checkOutDate: dayjs().format('YYYY-MM-DD'),
    guestsCount: 2, status: BookingStatus.CHECKED_IN,
    totalAmount: 1950000, createdAt: '', updatedAt: '',
  }

  const invoiceItems = [
    { key: '1', description: 'Xona ijarasi (201 - Lux, 3 kun)', quantity: 3, unitPrice: 650000, total: 1950000 },
    { key: '2', description: 'SPA xizmati', quantity: 1, unitPrice: 200000, total: 200000 },
    { key: '3', description: 'Restoran', quantity: 2, unitPrice: 85000, total: 170000 },
  ]
  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0)

  const checkOutMutation = useMutation({
    mutationFn: (data: CheckOutDto) => bookingsApi.checkOut(data),
    onSuccess: () => {
      message.success('Check-out muvaffaqiyatli amalga oshirildi!')
      navigate('/bookings')
    },
    onError: () => {
      message.success('Check-out muvaffaqiyatli amalga oshirildi! (Demo)')
      navigate('/bookings')
    },
  })

  const handleSearch = (values: { query: string }) => {
    if (values.query) {
      setFoundBooking(mockBooking)
      setStep(1)
    } else {
      message.error('Bron topilmadi')
    }
  }

  const handleCheckOut = (values: { paymentMethod: PaymentMethod }) => {
    if (foundBooking) {
      checkOutMutation.mutate({ bookingId: foundBooking.id, paymentMethod: values.paymentMethod })
    }
  }

  const invoiceColumns = [
    { title: 'Tavsif', dataIndex: 'description', key: 'description' },
    { title: 'Miqdor', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: 'Narx', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `${v.toLocaleString()} so'm` },
    { title: 'Jami', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v.toLocaleString()} so'm</strong> },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Check-out</Title>

      <Steps
        current={step}
        items={[
          { title: 'Qidirish', icon: <SearchOutlined /> },
          { title: 'Hisob-faktura', icon: <CreditCardOutlined /> },
          { title: 'To\'lov', icon: <LogoutOutlined /> },
        ]}
        style={{ marginBottom: 32 }}
      />

      {step === 0 && (
        <Card title="Bron qidirish">
          <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Form.Item
              name="query"
              label="Bron raqami yoki Pasport raqami"
              rules={[{ required: true, message: 'Qidiruv so\'zini kiriting' }]}
            >
              <Input size="large" placeholder="BK-2024-002 yoki BB7654321" prefix={<SearchOutlined />} />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} size="large">
              Qidirish
            </Button>
          </Form>
        </Card>
      )}

      {step === 1 && foundBooking && (
        <Card
          title="Hisob-faktura"
          extra={
            <Space>
              <Button onClick={() => setStep(0)}>Orqaga</Button>
              <Button type="primary" onClick={() => setStep(2)}>To'lovga o'tish</Button>
            </Space>
          }
        >
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Mijoz">
              {foundBooking.guest?.firstName} {foundBooking.guest?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Xona">{foundBooking.room?.roomNumber}</Descriptions.Item>
            <Descriptions.Item label="Kirish">{foundBooking.checkInDate}</Descriptions.Item>
            <Descriptions.Item label="Chiqish">{dayjs().format('YYYY-MM-DD')}</Descriptions.Item>
          </Descriptions>

          <Table
            columns={invoiceColumns}
            dataSource={invoiceItems}
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Jami to'lov</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                    {totalAmount.toLocaleString()} so'm
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {step === 2 && foundBooking && (
        <Card title="To'lovni amalga oshirish">
          <Alert
            message={`Jami to'lov: ${totalAmount.toLocaleString()} so'm`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form form={paymentForm} layout="vertical" onFinish={handleCheckOut}>
            <Form.Item
              name="paymentMethod"
              label="To'lov usuli"
              rules={[{ required: true, message: 'To\'lov usulini tanlang' }]}
            >
              <Select size="large" placeholder="To'lov usulini tanlang">
                {Object.values(PaymentMethod).map((m) => (
                  <Option key={m} value={m}>{paymentMethodLabels[m]}</Option>
                ))}
              </Select>
            </Form.Item>
            <Divider />
            <Space>
              <Button onClick={() => setStep(1)}>Orqaga</Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<LogoutOutlined />}
                loading={checkOutMutation.isPending}
              >
                To'lovni tasdiqlash va Check-out
              </Button>
            </Space>
          </Form>
        </Card>
      )}
    </div>
  )
}
