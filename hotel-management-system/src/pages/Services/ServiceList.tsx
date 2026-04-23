import { Row, Col, Card, Typography, Tag, Button, Space } from 'antd'
import {
  HomeOutlined, ShoppingOutlined, CarOutlined,
  HeartOutlined, TrophyOutlined, TeamOutlined, PlusOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ServiceType } from '../../types/enums'

const { Title, Text } = Typography

const serviceConfig: Record<ServiceType, {
  label: string
  icon: React.ReactNode
  color: string
  price: number
  description: string
}> = {
  [ServiceType.ROOM_CLEANING]: {
    label: 'Xona tozalash',
    icon: <HomeOutlined style={{ fontSize: 32 }} />,
    color: '#1677ff',
    price: 50000,
    description: 'Kunlik xona tozalash va tartibga keltirish xizmati',
  },
  [ServiceType.LAUNDRY]: {
    label: 'Kir yuvish',
    icon: <ShoppingOutlined style={{ fontSize: 32 }} />,
    color: '#52c41a',
    price: 80000,
    description: 'Kiyimlarni yuvish va dazmollash xizmati',
  },
  [ServiceType.TRANSPORT]: {
    label: 'Transport',
    icon: <CarOutlined style={{ fontSize: 32 }} />,
    color: '#faad14',
    price: 150000,
    description: 'Aeroport va shahar bo\'ylab transport xizmati',
  },
  [ServiceType.SPA]: {
    label: 'SPA',
    icon: <HeartOutlined style={{ fontSize: 32 }} />,
    color: '#eb2f96',
    price: 300000,
    description: 'Massaj, aromaterapiya va dam olish xizmatlari',
  },
  [ServiceType.GYM]: {
    label: 'Sport zali',
    icon: <TrophyOutlined style={{ fontSize: 32 }} />,
    color: '#722ed1',
    price: 100000,
    description: 'Zamonaviy sport jihozlari bilan jihozlangan zal',
  },
  [ServiceType.CONFERENCE_HALL]: {
    label: 'Konferensiya zali',
    icon: <TeamOutlined style={{ fontSize: 32 }} />,
    color: '#13c2c2',
    price: 500000,
    description: 'Yig\'ilish va tadbirlar uchun zamonaviy zal',
  },
}

export default function ServiceList() {
  const navigate = useNavigate()

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Xizmatlar</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/services/orders')}
          >
            Buyurtma berish
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {Object.entries(serviceConfig).map(([type, config]) => (
          <Col key={type} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{ borderTop: `4px solid ${config.color}` }}
              actions={[
                <Button
                  key="order"
                  type="primary"
                  ghost
                  onClick={() => navigate('/services/orders')}
                >
                  Buyurtma berish
                </Button>,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', color: config.color }}>
                  {config.icon}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Title level={5} style={{ margin: 0 }}>{config.label}</Title>
                </div>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 13 }}>
                  {config.description}
                </Text>
                <div style={{ textAlign: 'center' }}>
                  <Tag color={config.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {config.price.toLocaleString()} so'm
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
