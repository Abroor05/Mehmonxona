import { Spin } from 'antd'

interface LoadingSpinnerProps {
  tip?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ tip = 'Yuklanmoqda...', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'rgba(255,255,255,0.8)',
      }}>
        <Spin size="large" tip={tip} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spin size="large" tip={tip} />
    </div>
  )
}
