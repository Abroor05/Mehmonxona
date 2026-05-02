import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Row, Col, Card, Tag, Button, Select, Space, Typography,
  Modal, Form, Input, InputNumber, message, Badge, Tooltip,
  Statistic, Progress,
} from 'antd'
import {
  PlusOutlined, EditOutlined, HomeOutlined, ArrowLeftOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, SyncOutlined,
  BuildOutlined,
} from '@ant-design/icons'
import { roomsApi } from '../../api/rooms'
import { Room, CreateRoomDto } from '../../types'
import { RoomType, RoomStatus } from '../../types/enums'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'
import RoomDetail from './RoomDetail'

const { Title, Text } = Typography
const { Option } = Select

// ─── Konstantalar ────────────────────────────────────────────────────────────

const TOTAL_FLOORS = 10

const roomTypeLabels: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'Standard',
  [RoomType.LUX]:      'Deluxe',
  [RoomType.VIP]:      'VIP',
}

const roomTypeColors: Record<RoomType, string> = {
  [RoomType.STANDARD]: 'blue',
  [RoomType.LUX]:      'gold',
  [RoomType.VIP]:      'purple',
}

const statusConfig: Record<RoomStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  [RoomStatus.AVAILABLE]:   { label: "Bo'sh",        color: '#52c41a', bg: '#f6ffed', icon: <CheckCircleOutlined /> },
  [RoomStatus.OCCUPIED]:    { label: 'Band',          color: '#ff4d4f', bg: '#fff2f0', icon: <CloseCircleOutlined /> },
  [RoomStatus.CLEANING]:    { label: 'Tozalanmoqda',  color: '#faad14', bg: '#fffbe6', icon: <SyncOutlined spin />   },
  [RoomStatus.MAINTENANCE]: { label: "Ta'mirda",      color: '#8c8c8c', bg: '#fafafa', icon: <ToolOutlined />        },
}

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────────

/** Xona raqamidan qavatni aniqlash */
const getFloor = (room: Room): number => {
  if (room.floor) return room.floor
  const num = String(room.roomNumber)
  if (num.length >= 3) return parseInt(num.slice(0, -2)) || 1
  return 1
}

// ─── Asosiy komponent ─────────────────────────────────────────────────────────

export default function RoomList() {
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()

  // Tanlangan qavat (null = qavat ro'yxati ko'rinadi)
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  // Tanlangan xona detail (null = xona ro'yxati ko'rinadi)
  const [detailRoom,    setDetailRoom]    = useState<Room | null>(null)

  // Filterlar (xonalar ko'rinishida)
  const [filterType,   setFilterType]   = useState<RoomType   | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'ALL'>('ALL')

  // Modallar
  const [addModalOpen,    setAddModalOpen]    = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [statusRoom,      setStatusRoom]      = useState<Room | null>(null)
  const [form]       = Form.useForm()
  const [statusForm] = Form.useForm()

  // ── Barcha xonalarni yuklash ──────────────────────────────────────────────
  const { data } = useQuery({
    queryKey: ['rooms-all'],
    queryFn: () => roomsApi.getAll({ page: 1 }),
    retry: false,
    staleTime: 30000,
  })

  const allRooms: Room[] = data?.data ?? []

  // ── Xona qo'shish ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (d: CreateRoomDto) => roomsApi.create(d),
    onSuccess: () => {
      message.success("Xona qo'shildi")
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
      setAddModalOpen(false)
      form.resetFields()
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const msg = Object.values(e?.response?.data ?? {}).flat().join(' | ') || 'Xatolik yuz berdi'
      message.error(msg)
    },
  })

  // ── Holat o'zgartirish ───────────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: RoomStatus; reason?: string }) =>
      roomsApi.updateStatus(id, { status, reason }),
    onSuccess: () => {
      message.success('Xona holati yangilandi')
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
      setStatusModalOpen(false)
      statusForm.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  // ── Qavat bo'yicha guruhlash ─────────────────────────────────────────────
  const floorMap: Record<number, Room[]> = {}
  for (let f = 1; f <= TOTAL_FLOORS; f++) floorMap[f] = []
  allRooms.forEach((room) => {
    const f = getFloor(room)
    if (f >= 1 && f <= TOTAL_FLOORS) {
      floorMap[f].push(room)
    }
  })

  // ── Tanlangan qavatdagi xonalar ──────────────────────────────────────────
  const floorRooms = selectedFloor !== null
    ? (floorMap[selectedFloor] ?? []).filter((r) => {
        if (filterType   !== 'ALL' && r.type   !== filterType)   return false
        if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
        return true
      })
    : []

  // ── Umumiy statistika ────────────────────────────────────────────────────
  const totalRooms     = allRooms.length
  const availableCount = allRooms.filter((r) => r.status === RoomStatus.AVAILABLE).length
  const occupiedCount  = allRooms.filter((r) => r.status === RoomStatus.OCCUPIED).length
  const cleaningCount  = allRooms.filter((r) => r.status === RoomStatus.CLEANING).length
  const maintCount     = allRooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length

  // ── Xona detail ko'rinishi ───────────────────────────────────────────────
  if (detailRoom) {
    return (
      <RoomDetail
        room={detailRoom}
        onBack={() => setDetailRoom(null)}
      />
    )
  }

  // ── Qavat rangi (bandlik foiziga qarab) ──────────────────────────────────
  const floorColor = (floor: number): string => {
    const rooms = floorMap[floor] ?? []
    if (rooms.length === 0) return '#d9d9d9'
    const occ = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length
    const rate = occ / rooms.length
    if (rate >= 0.8) return '#ff4d4f'
    if (rate >= 0.5) return '#faad14'
    return '#52c41a'
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Qavat ro'yxati
  // ─────────────────────────────────────────────────────────────────────────
  if (selectedFloor === null) {
    return (
      <div>
        {/* Sarlavha */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <BuildOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Mehmonxona — Qavatlar
            </Title>
          </Col>
          <Col>
            {hasRole([StaffRole.ADMIN, StaffRole.MANAGER]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalOpen(true)}
              >
                Yangi xona qo'shish
              </Button>
            )}
          </Col>
        </Row>

        {/* Umumiy statistika */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderTop: '3px solid #1677ff' }}>
              <Statistic title="Jami xonalar" value={totalRooms} valueStyle={{ color: '#1677ff', fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderTop: '3px solid #52c41a' }}>
              <Statistic title="Bo'sh" value={availableCount} valueStyle={{ color: '#52c41a', fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderTop: '3px solid #ff4d4f' }}>
              <Statistic title="Band" value={occupiedCount} valueStyle={{ color: '#ff4d4f', fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderTop: '3px solid #faad14' }}>
              <Statistic
                title="Tozalanmoqda / Ta'mirda"
                value={cleaningCount + maintCount}
                valueStyle={{ color: '#faad14', fontSize: 22 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Qavatlar grid — yuqoridan pastga (10 → 1) */}
        <Row gutter={[16, 16]}>
          {Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i).map((floor) => {
            const rooms    = floorMap[floor] ?? []
            const total    = rooms.length
            const occupied = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length
            const avail    = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length
            const cleaning = rooms.filter((r) => r.status === RoomStatus.CLEANING).length
            const maint    = rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length
            const rate     = total > 0 ? Math.round((occupied / total) * 100) : 0
            const color    = floorColor(floor)

            return (
              <Col key={floor} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card
                  hoverable
                  onClick={() => setSelectedFloor(floor)}
                  style={{
                    borderTop: `4px solid ${color}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  styles={{ body: { padding: '16px' } }}
                >
                  {/* Qavat raqami */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: color, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text strong style={{ color: '#fff', fontSize: 16 }}>{floor}</Text>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>{floor}-qavat</Text>
                        <div style={{ fontSize: 12, color: '#999' }}>{total} ta xona</div>
                      </div>
                    </div>
                    <Tag color={color} style={{ margin: 0 }}>{rate}%</Tag>
                  </div>

                  {/* Bandlik progress */}
                  <Progress
                    percent={rate}
                    strokeColor={color}
                    trailColor="#f0f0f0"
                    showInfo={false}
                    size="small"
                    style={{ marginBottom: 10 }}
                  />

                  {/* Holat bo'yicha mini statistika */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {avail > 0 && (
                      <Tag color="success" style={{ margin: 0, fontSize: 11 }}>
                        Bo'sh: {avail}
                      </Tag>
                    )}
                    {occupied > 0 && (
                      <Tag color="error" style={{ margin: 0, fontSize: 11 }}>
                        Band: {occupied}
                      </Tag>
                    )}
                    {cleaning > 0 && (
                      <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>
                        Tozal: {cleaning}
                      </Tag>
                    )}
                    {maint > 0 && (
                      <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                        Ta'mir: {maint}
                      </Tag>
                    )}
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>

        {/* Yangi xona qo'shish modali */}
        <Modal
          title="Yangi xona qo'shish"
          open={addModalOpen}
          onCancel={() => { setAddModalOpen(false); form.resetFields() }}
          footer={null}
          width={480}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={(v) => createMutation.mutate(v)}
            style={{ marginTop: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="roomNumber" label="Xona raqami" rules={[{ required: true }]}>
                  <Input placeholder="101" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="floor" label="Qavat" rules={[{ required: true }]}>
                  <InputNumber min={1} max={20} style={{ width: '100%' }} placeholder="1" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="type" label="Xona turi" rules={[{ required: true }]}>
              <Select placeholder="Turni tanlang">
                {Object.values(RoomType).map((t) => (
                  <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="capacity" label="Sig'im (kishi)" rules={[{ required: true }]}>
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pricePerNight" label="Narx (so'm/kun)" rules={[{ required: true }]}>
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="description" label="Tavsif (ixtiyoriy)">
              <Input.TextArea rows={2} placeholder="Xona haqida qo'shimcha ma'lumot..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => { setAddModalOpen(false); form.resetFields() }}>
                  Bekor qilish
                </Button>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                  Qo'shish
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Tanlangan qavatdagi xonalar
  // ─────────────────────────────────────────────────────────────────────────
  const currentFloorRooms = floorMap[selectedFloor] ?? []

  return (
    <div>
      {/* Sarlavha */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                setSelectedFloor(null)
                setFilterType('ALL')
                setFilterStatus('ALL')
              }}
            >
              Qavatlar
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {selectedFloor}-qavat xonalari
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
                ({currentFloorRooms.length} ta xona)
              </Text>
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Select value={filterType} onChange={setFilterType} style={{ width: 130 }}>
              <Option value="ALL">Barcha turlar</Option>
              {Object.values(RoomType).map((t) => (
                <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
              <Option value="ALL">Barcha holatlar</Option>
              {Object.values(RoomStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
            {hasRole([StaffRole.ADMIN, StaffRole.MANAGER]) && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.setFieldValue('floor', selectedFloor)
                  setAddModalOpen(true)
                }}
              >
                Xona qo'shish
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Qavat statistikasi */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {Object.values(RoomStatus).map((s) => {
          const cnt = currentFloorRooms.filter((r) => r.status === s).length
          const cfg = statusConfig[s]
          return (
            <Col key={s}>
              <Tag
                color={cfg.color}
                style={{ padding: '4px 12px', fontSize: 13, cursor: 'pointer' }}
                onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}
              >
                {cfg.icon} {cfg.label}: {cnt}
              </Tag>
            </Col>
          )
        })}
      </Row>

      {/* Xonalar grid */}
      {floorRooms.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">Bu qavatda xona topilmadi</Text>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {floorRooms.map((room) => {
            const cfg = statusConfig[room.status]
            return (
              <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                <Card
                  hoverable
                  onClick={() => setDetailRoom(room)}
                  style={{
                    borderTop: `3px solid ${cfg.color}`,
                    background: cfg.bg,
                    cursor: 'pointer',
                  }}
                  styles={{ body: { padding: '14px' } }}
                  actions={
                    hasRole([StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.HOUSEKEEPER]) ? [
                      <Tooltip title="Holat o'zgartirish" key="status">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation()
                            setStatusRoom(room)
                            setStatusModalOpen(true)
                          }}
                        >
                          Holat
                        </Button>
                      </Tooltip>,
                    ] : undefined
                  }
                >
                  <div style={{ textAlign: 'center' }}>
                    <HomeOutlined style={{ fontSize: 28, color: cfg.color, marginBottom: 6 }} />
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                      {room.roomNumber}
                    </div>
                    <Tag color={roomTypeColors[room.type]} style={{ marginTop: 6 }}>
                      {roomTypeLabels[room.type]}
                    </Tag>
                    <div style={{ marginTop: 8 }}>
                      <Badge color={cfg.color} text={cfg.label} />
                    </div>
                    <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>
                      {room.capacity} kishi
                    </div>
                    <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 13 }}>
                      {room.pricePerNight.toLocaleString()} so'm/kun
                    </div>
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Qavat navigatsiyasi */}
      <div style={{
        marginTop: 24,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {Array.from({ length: TOTAL_FLOORS }, (_, i) => i + 1).map((f) => (
          <Button
            key={f}
            type={f === selectedFloor ? 'primary' : 'default'}
            size="small"
            style={{
              minWidth: 44,
              borderColor: floorColor(f),
              color: f === selectedFloor ? undefined : floorColor(f),
            }}
            onClick={() => {
              setSelectedFloor(f)
              setFilterType('ALL')
              setFilterStatus('ALL')
            }}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Yangi xona qo'shish modali */}
      <Modal
        title={`${selectedFloor}-qavatga xona qo'shish`}
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields() }}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => createMutation.mutate(v)}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomNumber" label="Xona raqami" rules={[{ required: true }]}>
                <Input placeholder={`${selectedFloor}07`} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="floor" label="Qavat" initialValue={selectedFloor} rules={[{ required: true }]}>
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="type" label="Xona turi" rules={[{ required: true }]}>
            <Select placeholder="Turni tanlang">
              {Object.values(RoomType).map((t) => (
                <Option key={t} value={t}>{roomTypeLabels[t]}</Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="capacity" label="Sig'im (kishi)" rules={[{ required: true }]}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pricePerNight" label="Narx (so'm/kun)" rules={[{ required: true }]}>
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="Tavsif (ixtiyoriy)">
            <Input.TextArea rows={2} placeholder="Xona haqida qo'shimcha ma'lumot..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setAddModalOpen(false); form.resetFields() }}>
                Bekor qilish
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Qo'shish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Holat o'zgartirish modali */}
      <Modal
        title={`Xona ${statusRoom?.roomNumber} — holat o'zgartirish`}
        open={statusModalOpen}
        onCancel={() => { setStatusModalOpen(false); statusForm.resetFields() }}
        footer={null}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={(v) => statusRoom && updateStatusMutation.mutate({ id: statusRoom.id, ...v })}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="status" label="Yangi holat" rules={[{ required: true }]}>
            <Select placeholder="Holatni tanlang">
              {Object.values(RoomStatus).map((s) => (
                <Option key={s} value={s}>{statusConfig[s].label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="Sabab (ixtiyoriy)">
            <Input.TextArea rows={3} placeholder="Holat o'zgarish sababi..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStatusModalOpen(false)}>Bekor qilish</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isPending}
              >
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
