import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Tag } from 'antd'
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { LoginDto } from '../types'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  const handleSubmit = async (values: LoginDto) => {
    setLoading(true)
    setError(null)

    try {
      // Real API call to Django backend
      const response = await authApi.login(values)
      login(response.user, response.accessToken, response.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { detail?: string; non_field_errors?: string[] } }
      }

      if (axiosError.response?.status === 401) {
        setError("Foydalanuvchi nomi yoki parol noto'g'ri")
      } else if (axiosError.response?.status === 400) {
        const detail = axiosError.response.data?.non_field_errors?.[0]
          || axiosError.response.data?.detail
          || "Ma'lumotlar noto'g'ri"
        setError(detail)
      } else if (!axiosError.response) {
        // Network error — backend ishlamayapti
        setError('Backend serverga ulanib bo\'lmadi. Django server ishga tushganligini tekshiring (localhost:8000)')
      } else {
        setError('Tizimga kirishda xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (username: string, password: string) => {
    form.setFieldsValue({ username, password })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
      padding: '24px',
    }}>
      <Card
        style={{ width: '100%', maxWidth: 440, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: '40px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677ff, #0958d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BankOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>Mehmonxona Tizimi</Title>
            <Text type="secondary">Boshqaruv paneliga kirish</Text>
          </div>

          {/* Tezkor kirish */}
          <div style={{
            background: '#f6ffed', border: '1px solid #b7eb8f',
            borderRadius: 8, padding: '12px 16px',
          }}>
            <Text strong style={{ fontSize: 13, color: '#389e0d' }}>
              Tezkor kirish (Django admin):
            </Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag color="red" style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => fillDemo('admin', 'Admin1234!')}>
                👑 Admin
              </Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
              Django server: http://localhost:8000 ishga tushgan bo'lishi kerak
            </Text>
          </div>

          {/* Xato */}
          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} />
          )}

          {/* Forma */}
          <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off" size="large">
            <Form.Item
              name="username"
              label="Foydalanuvchi nomi"
              rules={[{ required: true, message: 'Foydalanuvchi nomini kiriting' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="admin" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Parol"
              rules={[{ required: true, message: 'Parolni kiriting' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Admin1234!" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary" htmlType="submit" loading={loading} block
                style={{ height: 48, fontSize: 16, borderRadius: 8 }}
              >
                Kirish
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: 0 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              admin / Admin1234!
            </Text>
          </Divider>
        </Space>
      </Card>
    </div>
  )
}
