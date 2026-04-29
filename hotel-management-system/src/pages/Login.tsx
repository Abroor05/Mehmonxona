import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Tag } from 'antd'
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { LoginDto } from '../types'

const { Title, Text } = Typography

// Barcha foydalanuvchilar — Django da yaratilgan
const QUICK_USERS = [
  { label: '👑 Admin',        username: 'admin1',        password: 'Admin1234!',   color: 'red'    },
  { label: '📊 Menejer',      username: 'manager1',      password: 'Manager123!',  color: 'orange' },
  { label: '🏨 Resepsionist', username: 'receptionist1', password: 'Recept123!',   color: 'blue'   },
  { label: '🧹 Tozalovchi',   username: 'housekeeper1',  password: 'House1234!',   color: 'green'  },
  { label: '💰 Hisobchi',     username: 'accountant1',   password: 'Account123!',  color: 'purple' },
]

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [form]                = Form.useForm()

  const handleSubmit = async (values: LoginDto) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.login(values)
      login(response.user, response.accessToken, response.refreshToken)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { detail?: string; non_field_errors?: string[] } } }
      if (!e.response) {
        setError('Django server ishlamayapti. Terminalda "python manage.py runserver" ni ishga tushiring.')
      } else if (e.response.status === 401) {
        setError("Login yoki parol noto'g'ri")
      } else {
        const msg = e.response.data?.non_field_errors?.[0] || e.response.data?.detail || 'Xatolik yuz berdi'
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (username: string, password: string) => {
    form.setFieldsValue({ username, password })
    // Avtomatik submit
    form.submit()
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
        style={{ width: '100%', maxWidth: 460, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        styles={{ body: { padding: '36px' } }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677ff, #0958d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <BankOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>Mehmonxona Tizimi</Title>
            <Text type="secondary">Boshqaruv paneliga kirish</Text>
          </div>

          {/* Tezkor kirish tugmalari */}
          <div style={{
            background: '#f0f5ff',
            border: '1px solid #adc6ff',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <Text strong style={{ fontSize: 13, color: '#2f54eb', display: 'block', marginBottom: 10 }}>
              ⚡ Tezkor kirish — bosing va kiring:
            </Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUICK_USERS.map((u) => (
                <Tag
                  key={u.username}
                  color={u.color}
                  style={{ cursor: 'pointer', padding: '5px 12px', fontSize: 13, borderRadius: 6 }}
                  onClick={() => quickLogin(u.username, u.password)}
                >
                  {u.label}
                </Tag>
              ))}
            </div>
          </div>

          {/* Xato xabari */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Login formasi */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
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
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 48, fontSize: 16, borderRadius: 8 }}
              >
                {loading ? 'Kirilmoqda...' : 'Kirish'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '4px 0' }} />

          {/* Parollar jadvali */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 14px' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <b>Parollar:</b> admin1→Admin1234! | manager1→Manager123! | receptionist1→Recept123!
            </Text>
          </div>

        </Space>
      </Card>
    </div>
  )
}
