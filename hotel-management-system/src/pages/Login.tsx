import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Tag } from 'antd'
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { LoginDto } from '../types'
import { StaffRole } from '../types/enums'

const { Title, Text } = Typography

// Demo foydalanuvchilar — backend yo'q bo'lganda ishlatiladi
const DEMO_USERS = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      firstName: 'Sardor',
      lastName: 'Toshmatov',
      role: StaffRole.ADMIN,
      email: 'admin@hotel.uz',
    },
  },
  {
    username: 'manager',
    password: 'manager123',
    user: {
      id: '2',
      username: 'manager',
      firstName: 'Nilufar',
      lastName: 'Hasanova',
      role: StaffRole.MANAGER,
      email: 'manager@hotel.uz',
    },
  },
  {
    username: 'receptionist',
    password: 'recep123',
    user: {
      id: '3',
      username: 'receptionist',
      firstName: 'Bobur',
      lastName: 'Rahimov',
      role: StaffRole.RECEPTIONIST,
      email: 'bobur@hotel.uz',
    },
  },
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  const handleSubmit = async (values: LoginDto) => {
    setLoading(true)
    setError(null)

    // Demo rejim — backend yo'q bo'lganda
    await new Promise((r) => setTimeout(r, 500)) // loading effekti

    const demoUser = DEMO_USERS.find(
      (u) => u.username === values.username && u.password === values.password
    )

    if (demoUser) {
      login(demoUser.user, 'demo-access-token', 'demo-refresh-token')
      navigate('/dashboard', { replace: true })
    } else {
      setError("Foydalanuvchi nomi yoki parol noto'g'ri. Demo ma'lumotlarni ishlating.")
    }

    setLoading(false)
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
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        styles={{ body: { padding: '40px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677ff, #0958d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BankOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0, color: '#1a1a1a' }}>
              Mehmonxona Tizimi
            </Title>
            <Text type="secondary">Boshqaruv paneliga kirish</Text>
          </div>

          {/* Demo hisoblar */}
          <div style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 8,
            padding: '12px 16px',
          }}>
            <Text strong style={{ fontSize: 13, color: '#389e0d' }}>
              Demo hisoblar (bosing va kiring):
            </Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag
                color="red"
                style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => fillDemo('admin', 'admin123')}
              >
                👑 Admin
              </Tag>
              <Tag
                color="orange"
                style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => fillDemo('manager', 'manager123')}
              >
                📊 Menejer
              </Tag>
              <Tag
                color="blue"
                style={{ cursor: 'pointer', padding: '4px 10px' }}
                onClick={() => fillDemo('receptionist', 'recep123')}
              >
                🏨 Resepsionist
              </Tag>
            </div>
          </div>

          {/* Xato */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Forma */}
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
              <Input.Password prefix={<LockOutlined />} placeholder="admin123" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 48, fontSize: 16, borderRadius: 8 }}
              >
                Kirish
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Demo rejim</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              admin / admin123 &nbsp;|&nbsp; manager / manager123 &nbsp;|&nbsp; receptionist / recep123
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}
