import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ObraList from './pages/obras/ObraList.jsx'
import ObraDetail from './pages/obras/ObraDetail.jsx'
import ObraForm from './pages/obras/ObraForm.jsx'
import CompraList from './pages/materiais/CompraList.jsx'
import UsuarioList from './pages/accounts/UsuarioList.jsx'

function Private({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path="obras" element={<ObraList />} />
        <Route path="obras/nova" element={<ObraForm />} />
        <Route path="obras/:id" element={<ObraDetail />} />
        <Route path="obras/:id/editar" element={<ObraForm />} />
        <Route path="compras" element={<CompraList />} />
        <Route path="usuarios" element={<UsuarioList />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
