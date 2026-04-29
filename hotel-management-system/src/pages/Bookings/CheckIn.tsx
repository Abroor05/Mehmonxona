import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Card, Form, Input, Button, Steps, Typography, Space,
  Descriptions, Tag, Alert, message, Spin,
} from 'antd'
import { SearchOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons'
import axiosInstance from '../../api/axiosInstance'
import { bookingsApi } from '../../api/bookings'
import { Booking } from '../../types'
import { BookingStatus } from '../../types/enums'

const { Title, Text } = Typography

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  [BookingStatus.PENDING]:     { label: 'Kutilmoqda',     color: 'orange'  },
  [BookingStatus.CONFIRMED]:   { label: 'Tasdiqlangan',   color: 'blue'    },
  [BookingStatus.CHECKED_IN]:  { label: 'Kirgan',         color: 'green'   },
  [BookingStatus.CHECKED_OUT]: { label: 'Chiqqan',        color: 'default' },
  [BookingStatus.CANCELLED]:   { label: 'Bekor qilingan', color: 'red'     },
}

export default function CheckIn() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [searchForm] = Form.useForm()
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [searching, setSearching] = useState(false)

  // Bron qidirish — booking_number yoki ID bo'yicha
  const handleSearch = async (values: { query: string }) => {
    setSearching(true)
    try {
      const query = values.query.trim()
      let booking: Booking | null = null

      // BK- bilan boshlansa — booking_number, aks holda ID
      if (query.toUpperCase().startsWith('BK-')) {
        const res = await axiosInstance.get('/bookings/', {
          params: { booking_number: query.toUpperCase() },
        })
        const list = res.data.results || (Array.isArray(res.data) ? res.data : [])
        if (list.length > 0) {
          // normalize qilish
          const b = list[0]
          booking = {
            id:             String(b.id),
            bookingNumber:  b.booking_number,
            guestId:        String(b.customer),
            guest: b.customer_name ? {
              id:             String(b.customer),
              firstName:      b.customer_name.split(' ')[0] || '',
              lastName:       b.customer_name.split(' ').slice(1).join(' ') || '',
              passportNumber: '',
              phone:          '',
              email:          '',
              createdAt:      '',
              updatedAt:      '',
            } : undefined,
            roomId:         String(b.room),
            room: b.room_number ? {
              id:            String(b.room),
              roomNumber:    b.room_number,
              type:          b.room_type as never,
              capacity:      2,
              pricePerNight: 0,
              status:        'available' as never,
              createdAt:     '',
              updatedAt:     '',
            } : undefined,
            checkInDate:    b.check_in,
            checkOutDate:   b.check_out,
            guestsCount:    b.guests_count,
            status:         b.status as BookingStatus,
            totalAmount:    Number(b.total_amount),
            discountAmount: Number(b.discount_amount || 0),
            notes:          b.notes || '',
            createdAt:      b.created_at,
            updatedAt:      b.updated_at,
          }
        }
      } else {
        // ID bo'yicha qidirish
        const res = await axiosInstance.get(`/bookings/${query}/`)
        const b = res.data
        booking = {
          id:             String(b.id),
          bookingNumber:  b.booking_number,
          guestId:        String(b.customer),
          guest: b.customer_name ? {
            id:             String(b.customer),
            firstName:      b.customer_name.split(' ')[0] || '',
            lastName:       b.customer_name.split(' ').slice(1).join(' ') || '',
            passportNumber: '',
            phone:          '',
            email:          '',
            createdAt:      '',
            updatedAt:      '',
          } : undefined,
          roomId:         String(b.room),
          room: b.room_number ? {
            id:            String(b.room),
            roomNumber:    b.room_number,
            type:          b.room_type as never,
            capacity:      2,
            pricePerNight: 0,
            status:        'available' as never,
            createdAt:     '',
            updatedAt:     '',
          } : undefined,
          checkInDate:    b.check_in,
          checkOutDate:   b.check_out,
          guestsCount:    b.guests_count,
          status:         b.status as BookingStatus,
          totalAmount:    Number(b.total_amount),
          discountAmount: Number(b.discount_amount || 0),
          notes:          b.notes || '',
          createdAt:      b.created_at,
          updatedAt:      b.updated_at,
        }
      }

      if (!booking) {
        message.error('Bron topilmadi')
        return
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        message.warning(
          `Bu bron check-in uchun mos emas. Holati: "${statusConfig[booking.status]?.label}". ` +
          `Faqat "Tasdiqlangan" bronlar uchun check-in mumkin.`
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

  // Check-in API
  const checkInMutation = useMutation({
    mutationFn: () => bookingsApi.checkIn({ bookingId: foundBooking!.id }),
    onSuccess: (updated) => {
      message.success(`Check-in muvaffaqiyatli! Bron: ${updated.bookingNumber}`)
      navigate('/bookings')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } }
      message.error(e?.response?.data?.error || 'Check-in amalga oshmadi')
    },
  })

  const steps = [
    { title: 'Qidirish',   icon: <SearchOutlined /> },
    { title: 'Tasdiqlash', icon: <UserOutlined />    },
    { title: 'Check-in',   icon: <LoginOutlined />   },
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>Check-in</Title>

      <Steps current={step} items={steps} style={{ marginBottom: 32 }} />

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
                placeholder="BK-148C1621 yoki 1"
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

      {/* QADAM 2: Bron ma'lumotlari */}
      {step === 1 && foundBooking && (
        <Card
          title="Bron ma'lumotlari"
          extra={
            <Space>
              <Button onClick={() => { setStep(0); setFoundBooking(null) }}>Orqaga</Button>
              <Button type="primary" icon={<LoginOutlined />} onClick={() => setStep(2)}>
                Tasdiqlash
              </Button>
            </Space>
          }
        >
          <Descriptions bordered column={2} size="small">
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
            <Descriptions.Item label="Mehmonlar soni">
              {foundBooking.guestsCount} kishi
            </Descriptions.Item>
            <Descriptions.Item label="Xona">
              {foundBooking.room
                ? `${foundBooking.room.roomNumber} (${foundBooking.room.type})`
                : `Xona #${foundBooking.roomId}`}
            </Descriptions.Item>
            <Descriptions.Item label="Jami summa">
              <Text strong style={{ color: '#1677ff' }}>
                {Number(foundBooking.totalAmount).toLocaleString()} so'm
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kirish sanasi">
              {foundBooking.checkInDate}
            </Descriptions.Item>
            <Descriptions.Item label="Chiqish sanasi">
              {foundBooking.checkOutDate}
            </Descriptions.Item>
            {foundBooking.notes && (
              <Descriptions.Item label="Izoh" span={2}>
                {foundBooking.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* QADAM 3: Check-in tasdiqlash */}
      {step === 2 && foundBooking && (
        <Card title="Check-in tasdiqlash">
          <Alert
            message="Check-in amalga oshirilmoqda"
            description={
              `Mijoz: ${foundBooking.guest
                ? `${foundBooking.guest.firstName} ${foundBooking.guest.lastName}`
                : `#${foundBooking.guestId}`
              } | Xona: ${foundBooking.room?.roomNumber ?? foundBooking.roomId} | ` +
              `Bron: ${foundBooking.bookingNumber}`
            }
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          {checkInMutation.isPending && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Spin tip="Check-in amalga oshirilmoqda..." />
            </div>
          )}
          <Space>
            <Button onClick={() => setStep(1)}>Orqaga</Button>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              loading={checkInMutation.isPending}
              onClick={() => checkInMutation.mutate()}
            >
              Check-in ni tasdiqlash
            </Button>
          </Space>
        </Card>
      )}
    </div>
  )
}
