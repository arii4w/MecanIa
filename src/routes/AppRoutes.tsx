import { Routes, Route, Navigate } from 'react-router-dom'
import { Login, Register } from '../features/auth'
import { Chatbot } from '../features/chatbot'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chatbot" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}
