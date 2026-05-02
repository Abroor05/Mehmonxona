import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Input, Space, Typography, Modal, Form,
  message, Tooltip, Card, Row, Col, Avatar, Upload,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, UserOutlined, CameraOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { guestsApi } from '../../api/guests'
import { Guest, CreateGuestDto } from '../../types'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Search } = Input

export default function GuestList() {
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(1)
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingGuest,  setEditingGuest]  = useState<Guest | null>(null)
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['guests', page, search],
    queryFn: () => guestsApi.getAll({ page, pageSize: 10, search }),
    retry: false,
  })

  // ── Mijoz qo'shish ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (values: CreateGuestDto) =>
      guestsApi.create({ ...values, avatarFile: avatarFile ?? undefined }),
    onSuccess: () => {
      message.success("Mijoz muvaffaqiyatli qo'shildi")
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      closeModal()
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const errors = e?.response?.data
      if (errors) {
        message.error(Object.values(errors).flat().join(' | '), 6)
      } else {
        message.error("Mijoz qo'shishda xatolik yuz berdi")
      }
    },
  })

  // ── Mijozni yangilash ────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateGuestDto }) =>
      guestsApi.update(id, data),
    onSuccess: () => {
      message.success("Mijoz ma'lumotlari yangilandi")
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      closeModal()
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const errors = e?.response?.data
      if (errors) {
        message.error(Object.values(errors).flat().join(' | '), 6)
      } else {
        message.error('Yangilashda xatolik yuz berdi')
      }
    },
  })

  // ── Mijozni o'chirish ────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => guestsApi.delete(id),
    onSuccess: () => {
      message.success("Mijoz o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
    onError: () => message.error("O'chirishda xatolik yuz berdi"),
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingGuest(null)
    setAvatarFile(null)
    setAvatarPreview(null)
    form.resetFields()
  }

  const handleSubmit = (values: CreateGuestDto) => {
    if (editingGuest) {
      updateMutation.mutate({ id: editingGuest.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setAvatarPreview(guest.avatarUrl ?? null)
    form.setFieldsValue({
      firstName: guest.firstName,
      lastName:  guest.lastName,
      phone:     guest.phone,
      email:     guest.email,
    })
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Mijozni o'chirish",
      content: "Haqiqatan ham bu mijozni o'chirmoqchimisiz?",
      okText: "Ha, o'chirish",
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    })
  }

  // Rasm tanlash
  const handleAvatarChange = (info: { fileList: UploadFile[] }) => {
    const file = info.fileList[0]?.originFileObj
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  const displayData = data?.data ?? []

  const columns: ColumnsType<Guest> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Mijoz',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar
            size={36}
            src={record.avatarUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button type="text" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          {hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]) && (
            <Tooltip title="Tahrirlash">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {hasRole([StaffRole.ADMIN]) && (
            <Tooltip title="O'chirish">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id)}
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

      {/* ── Qo'shish / Tahrirlash modali ── */}
      <Modal
        title={editingGuest ? 'Mijozni tahrirlash' : "Yangi mijoz qo'shish"}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          {/* ── Profil rasmi ── */}
          <Form.Item label="Profil rasmi" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                size={80}
                src={avatarPreview}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1677ff', flexShrink: 0 }}
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleAvatarChange}
                maxCount={1}
              >
                <Button icon={<CameraOutlined />}>
                  {avatarPreview ? "Rasmni o'zgartirish" : 'Rasm tanlash'}
                </Button>
              </Upload>
              {avatarPreview && (
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                >
                  Olib tashlash
                </Button>
              )}
            </div>
          </Form.Item>

          {/* ── Ism / Familiya ── */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Ism"
                rules={[{ required: true, message: 'Ismni kiriting' }]}
              >
                <Input placeholder="Ism" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Familiya"
                rules={[{ required: true, message: 'Familiyani kiriting' }]}
              >
                <Input placeholder="Familiya" />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Telefon ── */}
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

          {/* ── Email ── */}
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

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>Bekor qilish</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingGuest ? 'Saqlash' : "Qo'shish"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
