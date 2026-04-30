import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, App as AntApp } from 'antd'
import uzUZ from 'antd/locale/uz_UZ'
import dayjs from 'dayjs'
import 'dayjs/locale/uz'
import App from './App'
import './index.css'

dayjs.locale('uz')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={uzUZ} theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}>
        <AntApp>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
