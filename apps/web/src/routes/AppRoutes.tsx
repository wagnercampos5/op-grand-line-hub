import { Navigate, Route, Routes } from 'react-router-dom'
import { ContractsPage } from '../components/pages/ContractsPage'
import { FeedPage } from '../components/pages/FeedPage'
import { LoginPage } from '../components/pages/LoginPage'
import { RegisterPage } from '../components/pages/RegisterPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
