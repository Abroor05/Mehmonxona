import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Card, Form, Input, Button, Steps, Typography, Space,
  Descriptions, Alert, message, Table, Divider, Select, Spin, Tag,
} from 'antd'
import { SearchOutlined, LogoutOutlined, CreditCardOutlined } from '@ant-design/icons'
import axiosInstance from '../../api/axiosInstance'
import { bookingsApi } from '../../api/bookings'
import { Booking } from '../../types'
import { BookingStatus, PaymentMethod } from '../../types/enums'

const { Title, Text } = Typography
const { Option } = Select

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]:   '💵 Naqd pul',
  [PaymentMethod.CARD]:   '💳 Bank kartasi',
  [PaymentMethod.ONLINE]: '🌐 Onlayn to\'lov',
}

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  [BookingStatus.PENDING]:     { label: 'Kutilmoqda',     color: 'orange'  },
  [BookingStatus.CONFIRMED]:   { label: 'Tasdiqlangan',   color: 'blue'    },
  [BookingStatus.CHECKED_IN]:  { label: 'Kirgan',         color: 'green'   },
  [BookingStatus.CHECKED_OUT]: { label: 'Chiqqan',        color: 'default' },
  [BookingStatus.CANCELLED]:   { label: 'Bekor qilingan', color: 'red'     },
}

export default function CheckOut() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [searchForm] = Form.useForm()
  const [paymentForm] = Form.useForm()
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [searching, setSearching] = useState(false)

  // Bron qidirish
  const handleSearch = async (values: { query: string }) => {
    setSearching(true)
    try {
      const query = values.query.trim()
      let b: Record<string, unknown> | null = null

      if (query.toUpperCase().startsWith('BK-')) {
        const res = await axiosInstance.get('/bookings/', {
          params: { booking_number: query.toUpperCase() },
        })
        const list = res.data.results || (Array.isArray(res.data) ? res.data : [])
        b = list[0] || null
      } else {
        const res = await axiosInstance.get(`/bookings/${query}/`)
        b = res.data
      }

      if (!b) {
        message.error('Bron topilmadi')
        return
      }

      const booking: Booking = {
        id:             String(b.id),
        bookingNumber:  b.booking_number as string,
        guestId:        String(b.customer),
        guest: b.customer_name ? {
          id:             String(b.customer),
          firstName:      (b.customer_name as string).split(' ')[0] || '',
          lastName:       (b.customer_name as string).split(' ').slice(1).join(' ') || '',
          passportNumber: '',
          phone:          '',
          email:          '',
          createdAt:      '',
          updatedAt:      '',
        } : undefined,
        roomId:         String(b.room),
        room: b.room_number ? {
          id:            String(b.room),
          roomNumber:    b.room_number as string,
          type:          b.room_type as never,
          capacity:      2,
          pricePerNight: Number(b.price_per_night || 0),
          status:        'booked' as never,
          createdAt:     '',
          updatedAt:     '',
        } : undefined,
        checkInDate:    b.check_in as string,
        checkOutDate:   b.check_out as string,
        guestsCount:    b.guests_count as number,
        status:         b.status as BookingStatus,
        totalAmount:    Number(b.total_amount),
        discountAmount: Number(b.discount_amount || 0),
        notes:          b.notes as string || '',
        createdAt:      b.created_at as string,
        updatedAt:      b.updated_at as string,
      }

      if (booking.status !== BookingStatus.CHECKED_IN) {
        message.warning(
          `Bu bron check-out uchun mos emas. Holati: "${statusConfig[booking.status]?.label}". ` +
          `Faqat "Kirgan" bronlar uchun check-out mumkin.`
        )
        return
      }

      setFoundBooking(booking)
      setStep(1)
    } catch {
      message.error("Bron topilmadi. Bron raqami yoki ID ni tekshiring.")
    } finally {
      setSearching(false)
    }
  }

  // Check-out API
  const checkOutMutation = useMutation({
    mutationFn: (paymentMethod: PaymentMethod) =>
      bookingsApi.checkOut({ bookingId: foundBooking!.id, paymentMethod }),
    onSuccess: (updated) => {
      message.success(`Check-out muvaffaqiyatli! Bron: ${updated.bookingNumber}`)
      navigate('/bookings')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } }
      message.error(e?.response?.data?.error || 'Check-out amalga oshmadi')
    },
  })

  const handleCheckOut = (values: { paymentMethod: PaymentMethod }) => {
    checkOutMutation.mutate(values.paymentMethod)
  }

  // Hisob-faktura qatorlari
  const nights = foundBooking
    ? Math.max(1, Math.ceil(
        (new Date(foundBooking.checkOutDate).getTime() - new Date(foundBooking.checkInDate).getTime())
        / (1000 * 60 * 60 * 24)
      ))
    : 0

  const invoiceItems = foundBooking ? [
    {
      key: '1',
      description: `Xona ijarasi (${foundBooking.room?.roomNumber ?? foundBooking.roomId}, ${nights} kun)`,
      quantity: nights,
      unitPrice: foundBooking.room?.pricePerNight || (foundBooking.totalAmount / nights),
      total: foundBooking.totalAmount,
    },
  ] : []

  const invoiceColumns = [
    { title: 'Tavsif',  dataIndex: 'description', key: 'description' },
    { title: 'Miqdor',  dataIndex: 'quantity',    key: 'quantity', width: 80 },
    {
      title: 'Narx',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (v: number) => `${Number(v).toLocaleString()} so'm`,
    },
    {
      title: 'Jami',
      dataIndex: 'total',
      key: 'total',
      render: (v: number) => <strong>{Number(v).toLocaleString()} so'm</strong>,
    },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Check-out</Title>

      <Steps
        current={step}
        items={[
          { title: 'Qidirish',      icon: <SearchOutlined />     },
          { title: 'Hisob-faktura', icon: <CreditCardOutlined /> },
          { title: "To'lov",        icon: <LogoutOutlined />      },
        ]}
        style={{ marginBottom: 32 }}
      />

      {/* QADAM 1: Qidirish */}
      {step === 0 && (
        <Card title="Bron qidirish">
          <Alert
            message="Bron raqami (BK-XXXXXXXX) yoki bron ID raqami orqali qidiring"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
            <Form.Item
              name="query"
              label="Bron raqami yoki ID"
              rules={[{ required: true, message: "Qidiruv so'zini kiriting" }]}
            >
              <Input
                size="large"
                placeholder="BK-BC38C8DC yoki 2"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              size="large"
              loading={searching}
            >
              Qidirish
            </Button>
          </Form>
        </Card>
      )}

      {/* QADAM 2: Hisob-faktura */}
      {step === 1 && foundBooking && (
        <Card
          title="Hisob-faktura"
          extra={
            <Space>
              <Button onClick={() => { setStep(0); setFoundBooking(null) }}>Orqaga</Button>
              <Button type="primary" onClick={() => setStep(2)}>
                To'lovga o'tish
              </Button>
            </Space>
          }
        >
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Bron raqami">
              <strong style={{ color: '#1677ff' }}>{foundBooking.bookingNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Holat">
              <Tag color={statusConfig[foundBooking.status]?.color}>
                {statusConfig[foundBooking.status]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mijoz">
              {foundBooking.guest
                ? `${foundBooking.guest.firstName} ${foundBooking.guest.lastName}`
                : `Mijoz #${foundBooking.guestId}`}
            </Descriptions.Item>
            <Descriptions.Item label="Xona">
              {foundBooking.room?.roomNumber ?? `#${foundBooking.roomId}`}
            </Descriptions.Item>
            <Descriptions.Item label="Kirish">
              {foundBooking.checkInDate}
            </Descriptions.Item>
            <Descriptions.Item label="Chiqish">
              {foundBooking.checkOutDate}
            </Descriptions.Item>
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
                    {Number(foundBooking.totalAmount).toLocaleString()} so'm
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>
      )}

      {/* QADAM 3: To'lov */}
      {step === 2 && foundBooking && (
        <Card title="To'lovni amalga oshirish">
          <Alert
            message={`Jami to'lov: ${Number(foundBooking.totalAmount).toLocaleString()} so'm`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          {checkOutMutation.isPending && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Spin tip="Check-out amalga oshirilmoqda..." />
            </div>
          )}
          <Form form={paymentForm} layout="vertical" onFinish={handleCheckOut}>
            <Form.Item
              name="paymentMethod"
              label="To'lov usuli"
              rules={[{ required: true, message: "To'lov usulini tanlang" }]}
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
