import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Row, Col, Card, Tag, Button, Typography, Space, Descriptions,
  Image, Upload, Modal, Form, Input, InputNumber, Select,
  message, Spin, Badge, Tooltip, Popconfirm, Divider,
} from 'antd'
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  StarOutlined, StarFilled, HomeOutlined, UploadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, SyncOutlined,
  WifiOutlined, CarOutlined, CoffeeOutlined, ThunderboltOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { roomsApi } from '../../api/rooms'
import { Room, RoomImage } from '../../types'
import { RoomType, RoomStatus } from '../../types/enums'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

// ─── Konstantalar ────────────────────────────────────────────────────────────

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

const statusConfig: Record<RoomStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [RoomStatus.AVAILABLE]:   { label: "Bo'sh",       color: '#52c41a', icon: <CheckCircleOutlined /> },
  [RoomStatus.OCCUPIED]:    { label: 'Band',         color: '#ff4d4f', icon: <CloseCircleOutlined /> },
  [RoomStatus.CLEANING]:    { label: 'Tozalanmoqda', color: '#faad14', icon: <SyncOutlined spin />   },
  [RoomStatus.MAINTENANCE]: { label: "Ta'mirda",     color: '#8c8c8c', icon: <ToolOutlined />        },
}

// Qulaylik ikonkalari
const amenityIcons: Record<string, React.ReactNode> = {
  'wifi':          <WifiOutlined />,
  'wi-fi':         <WifiOutlined />,
  'internet':      <WifiOutlined />,
  'parking':       <CarOutlined />,
  'avtomobil':     <CarOutlined />,
  'breakfast':     <CoffeeOutlined />,
  'nonushta':      <CoffeeOutlined />,
  'konditsioner':  <ThunderboltOutlined />,
  'ac':            <ThunderboltOutlined />,
}

const getAmenityIcon = (name: string) => {
  const key = name.toLowerCase()
  for (const [k, icon] of Object.entries(amenityIcons)) {
    if (key.includes(k)) return icon
  }
  return <CheckCircleOutlined />
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoomDetailProps {
  room: Room
  onBack: () => void
}

// ─── Komponent ────────────────────────────────────────────────────────────────

export default function RoomDetail({ room: initialRoom, onBack }: RoomDetailProps) {
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const canEdit = hasRole([StaffRole.ADMIN, StaffRole.MANAGER])

  const [editModalOpen,   setEditModalOpen]   = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [fileList,        setFileList]        = useState<UploadFile[]>([])
  const [previewOpen,     setPreviewOpen]     = useState(false)
  const [previewImage,    setPreviewImage]    = useState('')
  const [editForm]   = Form.useForm()
  const [statusForm] = Form.useForm()

  // ── Real-time xona ma'lumotlari ──────────────────────────────────────────
  const { data: room = initialRoom, isLoading } = useQuery({
    queryKey: ['room-detail', initialRoom.id],
    queryFn:  () => roomsApi.getById(initialRoom.id),
    initialData: initialRoom,
    staleTime: 10000,
  })

  const images: RoomImage[] = room.images ?? []

  // ── Xonani tahrirlash ────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => roomsApi.update(room.id, {
      roomNumber:    values.roomNumber as string,
      type:          values.type as RoomType,
      capacity:      values.capacity as number,
      pricePerNight: values.pricePerNight as number,
      description:   values.description as string,
      amenities:     (values.amenities as string[] | undefined) ?? [],
      floor:         values.floor as number,
    }),
    onSuccess: () => {
      message.success("Xona ma'lumotlari yangilandi")
      queryClient.invalidateQueries({ queryKey: ['room-detail', room.id] })
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
      setEditModalOpen(false)
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const msg = Object.values(e?.response?.data ?? {}).flat().join(' | ') || 'Xatolik yuz berdi'
      message.error(msg)
    },
  })

  // ── Holat o'zgartirish ───────────────────────────────────────────────────
  const statusMutation = useMutation({
    mutationFn: (values: { status: RoomStatus; reason?: string }) =>
      roomsApi.updateStatus(room.id, values),
    onSuccess: () => {
      message.success('Xona holati yangilandi')
      queryClient.invalidateQueries({ queryKey: ['room-detail', room.id] })
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
      setStatusModalOpen(false)
      statusForm.resetFields()
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  // ── Rasm yuklash ─────────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => roomsApi.uploadImages(room.id, files),
    onSuccess: (newImages) => {
      message.success(`${newImages.length} ta rasm yuklandi`)
      queryClient.invalidateQueries({ queryKey: ['room-detail', room.id] })
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
      setUploadModalOpen(false)
      setFileList([])
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } }
      message.error(e?.response?.data?.error || 'Rasm yuklashda xatolik')
    },
  })

  // ── Rasm o'chirish ───────────────────────────────────────────────────────
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => roomsApi.deleteImage(room.id, imageId),
    onSuccess: () => {
      message.success("Rasm o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['room-detail', room.id] })
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
    },
    onError: () => message.error("Rasmni o'chirishda xatolik"),
  })

  // ── Asosiy rasm o'rnatish ────────────────────────────────────────────────
  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: string) => roomsApi.setPrimaryImage(room.id, imageId),
    onSuccess: () => {
      message.success('Asosiy rasm o\'rnatildi')
      queryClient.invalidateQueries({ queryKey: ['room-detail', room.id] })
      queryClient.invalidateQueries({ queryKey: ['rooms-all'] })
    },
    onError: () => message.error('Xatolik yuz berdi'),
  })

  const handleUpload = () => {
    const files = fileList
      .filter((f) => f.originFileObj)
      .map((f) => f.originFileObj as File)
    if (files.length === 0) {
      message.warning('Kamida bitta rasm tanlang')
      return
    }
    uploadMutation.mutate(files)
  }

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewOpen(true)
  }

  const cfg = statusConfig[room.status]

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    )
  }

  return (
    <div>
      {/* ── Sarlavha ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Orqaga
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              <HomeOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Xona {room.roomNumber}
              <Tag color={roomTypeColors[room.type]} style={{ marginLeft: 8 }}>
                {roomTypeLabels[room.type]}
              </Tag>
            </Title>
          </Space>
        </Col>
        {canEdit && (
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined />}
                onClick={() => { statusForm.resetFields(); setStatusModalOpen(true) }}
              >
                Holat o'zgartirish
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  editForm.setFieldsValue({
                    roomNumber:    room.roomNumber,
                    type:          room.type,
                    capacity:      room.capacity,
                    pricePerNight: room.pricePerNight,
                    description:   room.description,
                    amenities:     room.amenities ?? [],
                    floor:         room.floor,
                  })
                  setEditModalOpen(true)
                }}
              >
                Tahrirlash
              </Button>
            </Space>
          </Col>
        )}
      </Row>

      <Row gutter={[20, 20]}>
        {/* ── Chap ustun: Rasmlar ── */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <span>Rasmlar</span>
                <Tag>{images.length} ta</Tag>
              </Space>
            }
            extra={
              canEdit && (
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalOpen(true)}
                  disabled={images.length >= 10}
                >
                  Rasm qo'shish
                </Button>
              )
            }
          >
            {images.length === 0 ? (
              <div
                style={{
                  height: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa',
                  border: '2px dashed #d9d9d9',
                  borderRadius: 8,
                  cursor: canEdit ? 'pointer' : 'default',
                  color: '#999',
                }}
                onClick={() => canEdit && setUploadModalOpen(true)}
              >
                <UploadOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                <Text type="secondary">
                  {canEdit ? "Rasm qo'shish uchun bosing" : "Rasmlar yo'q"}
                </Text>
              </div>
            ) : (
              <>
                {/* Asosiy rasm */}
                {(() => {
                  const primary = images.find((i) => i.isPrimary) ?? images[0]
                  return (
                    <div style={{ marginBottom: 12, position: 'relative' }}>
                      <Image
                        src={primary.imageUrl}
                        alt={`Xona ${room.roomNumber}`}
                        style={{
                          width: '100%',
                          height: 280,
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                        preview={false}
                        onClick={() => handlePreview(primary.imageUrl)}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                      <Tag
                        color="gold"
                        style={{ position: 'absolute', top: 8, left: 8 }}
                        icon={<StarFilled />}
                      >
                        Asosiy
                      </Tag>
                    </div>
                  )
                })()}

                {/* Qolgan rasmlar */}
                {images.length > 1 && (
                  <Row gutter={[8, 8]}>
                    {images.map((img) => (
                      <Col key={img.id} span={8}>
                        <div style={{ position: 'relative', group: 'true' } as React.CSSProperties}>
                          <Image
                            src={img.imageUrl}
                            alt={img.caption || `Xona ${room.roomNumber}`}
                            style={{
                              width: '100%',
                              height: 90,
                              objectFit: 'cover',
                              borderRadius: 6,
                              cursor: 'pointer',
                              border: img.isPrimary ? '2px solid #faad14' : '2px solid transparent',
                            }}
                            preview={false}
                            onClick={() => handlePreview(img.imageUrl)}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                          />
                          {canEdit && (
                            <div style={{
                              position: 'absolute', top: 2, right: 2,
                              display: 'flex', gap: 2,
                            }}>
                              {!img.isPrimary && (
                                <Tooltip title="Asosiy qilish">
                                  <Button
                                    size="small"
                                    icon={<StarOutlined />}
                                    style={{ padding: '0 4px', height: 22, fontSize: 11 }}
                                    onClick={() => setPrimaryMutation.mutate(img.id)}
                                  />
                                </Tooltip>
                              )}
                              <Popconfirm
                                title="Rasmni o'chirish"
                                description="Haqiqatan ham o'chirmoqchimisiz?"
                                okText="Ha"
                                cancelText="Yo'q"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => deleteImageMutation.mutate(img.id)}
                              >
                                <Button
                                  size="small"
                                  danger
                                  icon={<DeleteOutlined />}
                                  style={{ padding: '0 4px', height: 22, fontSize: 11 }}
                                />
                              </Popconfirm>
                            </div>
                          )}
                          {img.caption && (
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(0,0,0,0.5)', color: '#fff',
                              fontSize: 10, padding: '2px 4px', borderRadius: '0 0 6px 6px',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {img.caption}
                            </div>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* ── O'ng ustun: Ma'lumotlar ── */}
        <Col xs={24} lg={10}>
          {/* Holat kartochkasi */}
          <Card
            style={{ marginBottom: 16, borderTop: `4px solid ${cfg.color}` }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Holat</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Badge color={cfg.color} />
                  <Text strong style={{ fontSize: 16, color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </Text>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Narx</Text>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1677ff' }}>
                  {room.pricePerNight.toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#666' }}> so'm/kun</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Asosiy ma'lumotlar */}
          <Card title="Xona ma'lumotlari" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" labelStyle={{ color: '#666', width: 120 }}>
              <Descriptions.Item label="Xona raqami">
                <Text strong style={{ fontSize: 16 }}>{room.roomNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Qavat">
                {room.floor}-qavat
              </Descriptions.Item>
              <Descriptions.Item label="Tur">
                <Tag color={roomTypeColors[room.type]}>{roomTypeLabels[room.type]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sig'im">
                {room.capacity} kishi
              </Descriptions.Item>
              <Descriptions.Item label="Narx">
                <Text strong style={{ color: '#1677ff' }}>
                  {room.pricePerNight.toLocaleString()} so'm/kun
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {room.description && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>Tavsif</Text>
                <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                  {room.description}
                </Paragraph>
              </>
            )}
          </Card>

          {/* Qulayliklar */}
          <Card title="Qulayliklar">
            {(room.amenities ?? []).length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(room.amenities ?? []).map((a, i) => (
                  <Tag
                    key={i}
                    icon={getAmenityIcon(a)}
                    color="blue"
                    style={{ padding: '4px 10px', fontSize: 13 }}
                  >
                    {a}
                  </Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary">Qulayliklar kiritilmagan</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Rasm yuklash modali ── */}
      <Modal
        title={`Xona ${room.roomNumber} — rasm qo'shish`}
        open={uploadModalOpen}
        onCancel={() => { setUploadModalOpen(false); setFileList([]) }}
        footer={null}
        width={520}
      >
        <div style={{ marginTop: 16 }}>
          <Upload.Dragger
            multiple
            accept="image/*"
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: fl }) => setFileList(fl)}
            listType="picture"
            maxCount={10 - images.length}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 40, color: '#1677ff' }} />
            </p>
            <p className="ant-upload-text">Rasmlarni bu yerga tashlang yoki bosing</p>
            <p className="ant-upload-hint">
              JPG, PNG, WEBP • Maksimal {10 - images.length} ta rasm •
              Birinchi rasm asosiy bo'ladi
            </p>
          </Upload.Dragger>

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => { setUploadModalOpen(false); setFileList([]) }}>
                Bekor qilish
              </Button>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={uploadMutation.isPending}
                onClick={handleUpload}
                disabled={fileList.length === 0}
              >
                Yuklash ({fileList.length} ta)
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* ── Tahrirlash modali ── */}
      <Modal
        title={`Xona ${room.roomNumber} — tahrirlash`}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(v) => updateMutation.mutate(v)}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomNumber" label="Xona raqami" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="floor" label="Qavat" rules={[{ required: true }]}>
                <InputNumber min={1} max={20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="type" label="Xona turi" rules={[{ required: true }]}>
            <Select>
              <Option value="standard">Standard</Option>
              <Option value="deluxe">Deluxe</Option>
              <Option value="vip">VIP</Option>
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
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea rows={3} placeholder="Xona haqida ma'lumot..." />
          </Form.Item>
          <Form.Item
            name="amenities"
            label="Qulayliklar"
            help="Vergul bilan ajrating: WiFi, TV, Konditsioner, Minibar"
          >
            <Select
              mode="tags"
              placeholder="Qulaylik qo'shing..."
              tokenSeparators={[',']}
              options={[
                { value: 'WiFi',         label: 'WiFi'         },
                { value: 'TV',           label: 'TV'           },
                { value: 'Konditsioner', label: 'Konditsioner' },
                { value: 'Minibar',      label: 'Minibar'      },
                { value: 'Seyf',         label: 'Seyf'         },
                { value: 'Vannaxona',    label: 'Vannaxona'    },
                { value: 'Balkon',       label: 'Balkon'       },
                { value: 'Nonushta',     label: 'Nonushta'     },
                { value: 'Parking',      label: 'Parking'      },
                { value: 'Jacuzzi',      label: 'Jacuzzi'      },
              ]}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalOpen(false)}>Bekor qilish</Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Holat o'zgartirish modali ── */}
      <Modal
        title={`Xona ${room.roomNumber} — holat o'zgartirish`}
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        footer={null}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={(v) => statusMutation.mutate(v)}
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
              <Button type="primary" htmlType="submit" loading={statusMutation.isPending}>
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Rasm preview ── */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (v) => setPreviewOpen(v),
        }}
      />
    </div>
  )
}
