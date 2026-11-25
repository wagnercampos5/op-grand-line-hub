import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../components/pages/LoginPage'
import { RegisterPage } from '../components/pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
