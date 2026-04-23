import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Input, Space, Typography, Modal, Form,
  message, Tag, Tooltip, Card, Row, Col,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, UserOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { guestsApi } from '../../api/guests'
import { Guest, CreateGuestDto } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Search } = Input

export default function GuestList() {
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['guests', page, search],
    queryFn: () => guestsApi.getAll({ page, pageSize: 10, search }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateGuestDto) => guestsApi.create(data),
    onSuccess: () => {
      message.success('Mijoz muvaffaqiyatli qo\'shildi')
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateGuestDto }) => guestsApi.update(id, data),
    onSuccess: () => {
      message.success('Mijoz ma\'lumotlari yangilandi')
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      setModalOpen(false)
      setEditingGuest(null)
      form.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => guestsApi.delete(id),
    onSuccess: () => {
      message.success('Mijoz o\'chirildi')
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const handleSubmit = (values: CreateGuestDto) => {
    if (editingGuest) {
      updateMutation.mutate({ id: editingGuest.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    form.setFieldsValue(guest)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Mijozni o\'chirish',
      content: 'Haqiqatan ham bu mijozni o\'chirmoqchimisiz?',
      okText: 'Ha, o\'chirish',
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    })
  }

  // Mock data for demo
  const mockGuests: Guest[] = [
    { id: '1', firstName: 'Alisher', lastName: 'Karimov', passportNumber: 'AA1234567', phone: '+998901234567', email: 'alisher@example.com', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '2', firstName: 'Malika', lastName: 'Yusupova', passportNumber: 'BB7654321', phone: '+998907654321', email: 'malika@example.com', nationality: 'O\'zbek', createdAt: '2024-01-16', updatedAt: '2024-01-16' },
    { id: '3', firstName: 'John', lastName: 'Smith', passportNumber: 'US9876543', phone: '+12025551234', email: 'john@example.com', nationality: 'Amerika', createdAt: '2024-01-17', updatedAt: '2024-01-17' },
  ]

  const displayData = data?.data || mockGuests

  const columns: ColumnsType<Guest> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Ism Familiya',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <span>{record.firstName} {record.lastName}</span>
        </Space>
      ),
    },
    {
      title: 'Pasport',
      dataIndex: 'passportNumber',
      key: 'passportNumber',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Millat',
      dataIndex: 'nationality',
      key: 'nationality',
      render: (val) => val ? <Tag color="blue">{val}</Tag> : <Tag>Noma\'lum</Tag>,
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]) && (
            <Tooltip title="Tahrirlash">
              <Button type="text" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
            </Tooltip>
          )}
          {hasRole([StaffRole.ADMIN]) && (
            <Tooltip title="O'chirish">
              <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Mijozlar</Title>
        </Col>
        <Col>
          <Space>
            <Search
              placeholder="Qidirish..."
              allowClear
              onSearch={setSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            {hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { setEditingGuest(null); form.resetFields(); setModalOpen(true) }}
              >
                Yangi mijoz
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
            showTotal: (total) => `Jami: ${total} ta mijoz`,
          }}
        />
      </Card>

      {/* Qo'shish/Tahrirlash modali */}
      <Modal
        title={editingGuest ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingGuest(null); form.resetFields() }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Ism" rules={[{ required: true, message: 'Ismni kiriting' }]}>
                <Input placeholder="Ism" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Familiya" rules={[{ required: true, message: 'Familiyani kiriting' }]}>
                <Input placeholder="Familiya" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="passportNumber"
            label="Pasport raqami"
            rules={[
              { required: true, message: 'Pasport raqamini kiriting' },
              { pattern: /^[A-Z]{2}\d{7}$/, message: 'Format: AA1234567' },
            ]}
          >
            <Input placeholder="AA1234567" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefon raqami"
            rules={[
              { required: true, message: 'Telefon raqamini kiriting' },
              { pattern: /^\+?[\d\s\-()]{9,15}$/, message: "To'g'ri telefon raqam kiriting" },
            ]}
          >
            <Input placeholder="+998901234567" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email kiriting' },
              { type: 'email', message: "To'g'ri email kiriting" },
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="nationality" label="Millat">
            <Input placeholder="O'zbek" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Bekor qilish</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingGuest ? 'Saqlash' : 'Qo\'shish'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
