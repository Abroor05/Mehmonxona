import { Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { useAuthStore } from '../../store/authStore'
import { StaffRole } from '../../types/enums'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: StaffRole[]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { hasRole, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole(allowedRoles)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Kechirasiz, bu sahifaga kirish huquqingiz yo'q."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Orqaga qaytish
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}
