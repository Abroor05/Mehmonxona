import { Component, ErrorInfo, ReactNode } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Xatolik yuz berdi"
          subTitle={this.state.error?.message || 'Kutilmagan xatolik'}
          extra={
            <Button type="primary" onClick={() => this.setState({ hasError: false })}>
              Qayta urinish
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}
