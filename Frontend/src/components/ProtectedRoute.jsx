import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
    const { token, login, logout, isLoading } = useAuth();

    if (isLoading) {
        return (<p>Loading, please wait...</p>)
    }

    if (token) {
        return <Outlet />;
    } else {
        return <Navigate to="/" replace />;
    }
}