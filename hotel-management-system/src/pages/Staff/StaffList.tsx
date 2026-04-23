import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Button, Select, Space, Typography, Tag, Card,
  Row, Col, Modal, Form, Input, InputNumber, message, Avatar, Tooltip,
} from 'antd'
import {
  PlusOutlined, EditOutlined, UserOutlined,
  StopOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { staffApi } from '../../api/staff'
import { Staff, CreateStaffDto } from '../../types'
import { StaffRole } from '../../types/enums'

const { Title } = Typography
const { Option } = Select

const roleLabels: Record<StaffRole, string> = {
  [StaffRole.ADMIN]: 'Administrator',
  [StaffRole.MANAGER]: 'Menejer',
  [StaffRole.RECEPTIONIST]: 'Resepsionist',
  [StaffRole.HOUSEKEEPER]: 'Tozalovchi',
  [StaffRole.ACCOUNTANT]: 'Hisobchi',
}

const roleColors: Record<StaffRole, string> = {
  [StaffRole.ADMIN]: 'red',
  [StaffRole.MANAGER]: 'orange',
  [StaffRole.RECEPTIONIST]: 'blue',
  [StaffRole.HOUSEKEEPER]: 'green',
  [StaffRole.ACCOUNTANT]: 'purple',
}

const mockStaff: Staff[] = [
  { id: '1', firstName: 'Sardor', lastName: 'Toshmatov', role: StaffRole.ADMIN, phone: '+998901111111', email: 'sardor@hotel.uz', hourlyRate: 50000, isActive: true, createdAt: '', updatedAt: '' },
  { id: '2', firstName: 'Nilufar', lastName: 'Hasanova', role: StaffRole.MANAGER, phone: '+998902222222', email: 'nilufar@hotel.uz', hourlyRate: 40000, isActive: true, createdAt: '', updatedAt: '' },
  { id: '3', firstName: 'Bobur', lastName: 'Rahimov', role: StaffRole.RECEPTIONIST, phone: '+998903333333', email: 'bobur@hotel.uz', hourlyRate: 25000, isActive: true, createdAt: '', updatedAt: '' },
  { id: '4', firstName: 'Zulfiya', lastName: 'Mirzayeva', role: StaffRole.HOUSEKEEPER, phone: '+998904444444', email: 'zulfiya@hotel.uz', hourlyRate: 20000, isActive: true, createdAt: '', updatedAt: '' },
  { id: '5', firstName: 'Jasur', lastName: 'Qodirov', role: StaffRole.ACCOUNTANT, phone: '+998905555555', email: 'jasur@hotel.uz', hourlyRate: 35000, isActive: false, createdAt: '', updatedAt: '' },
]

export default function StaffList() {
  const queryClient = useQueryClient()
  const [filterRole, setFilterRole] = useState<StaffRole | 'ALL'>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [form] = Form.useForm()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['staff', page, filterRole],
    queryFn: () => staffApi.getAll({
      page,
      pageSize: 10,
      role: filterRole !== 'ALL' ? filterRole : undefined,
    }),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateStaffDto) => staffApi.create(data),
    onSuccess: () => {
      message.success('Xodim qo\'shildi')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => staffApi.archive(id),
    onSuccess: () => {
      message.success('Xodim arxivlandi')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const displayData = data?.data || mockStaff
  const filteredData = filterRole !== 'ALL' ? displayData.filter((s) => s.role === filterRole) : displayData

  const columns: ColumnsType<Staff> = [
    {
      title: 'Xodim',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: roleColors[record.role] }} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Lavozim',
      dataIndex: 'role',
      key: 'role',
      render: (role: StaffRole) => (
        <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
      ),
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Soatlik stavka',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      render: (val) => `${val.toLocaleString()} so'm`,
    },
    {
      title: 'Holat',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => isActive
        ? <Tag color="green" icon={<CheckCircleOutlined />}>Faol</Tag>
        : <Tag color="default">Arxivlangan</Tag>,
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => { setEditingStaff(record); form.setFieldsValue(record); setModalOpen(true) }}
            />
          </Tooltip>
          {record.isActive && (
            <Tooltip title="Arxivlash">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                size="small"
                onClick={() => Modal.confirm({
                  title: 'Xodimni arxivlash',
                  content: 'Xodim ma\'lumotlari saqlanib qoladi. Davom etasizmi?',
                  okText: 'Ha',
                  cancelText: 'Yo\'q',
                  onOk: () => archiveMutation.mutate(record.id),
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
        <Col><Title level={4} style={{ margin: 0 }}>Xodimlar</Title></Col>
        <Col>
          <Space>
            <Select value={filterRole} onChange={setFilterRole} style={{ width: 160 }}>
              <Option value="ALL">Barcha lavozimlar</Option>
              {Object.values(StaffRole).map((r) => (
                <Option key={r} value={r}>{roleLabels[r]}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingStaff(null); form.resetFields(); setModalOpen(true) }}
            >
              Yangi xodim
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            total: data?.total || filteredData.length,
            pageSize: 10,
            onChange: setPage,
            showTotal: (total) => `Jami: ${total} ta xodim`,
          }}
        />
      </Card>

      <Modal
        title={editingStaff ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Ism" rules={[{ required: true }]}>
                <Input placeholder="Ism" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Familiya" rules={[{ required: true }]}>
                <Input placeholder="Familiya" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="role" label="Lavozim" rules={[{ required: true }]}>
            <Select placeholder="Lavozimni tanlang">
              {Object.values(StaffRole).map((r) => (
                <Option key={r} value={r}>{roleLabels[r]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefon" rules={[{ required: true }]}>
                <Input placeholder="+998901234567" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                <Input placeholder="email@hotel.uz" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hourlyRate" label="Soatlik stavka (so'm)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {!editingStaff && (
                <Form.Item name="password" label="Parol" rules={[{ required: true }, { min: 8 }]}>
                  <Input.Password placeholder="Kamida 8 belgi" />
                </Form.Item>
              )}
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                {editingStaff ? 'Saqlash' : 'Qo\'shish'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
