import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'


export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth()
    const location = useLocation()


    if (loading) return null // or a spinner


    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }


    return children
}

