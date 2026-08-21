import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';

import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules.jsx';
import Tasks from './pages/Tasks.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Calendar from './pages/Calendar.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {

    return (
        <>
            <Router>
                <Routes>
                    <Route exact path = "/" element = {<Login />} />
                    <Route exact path = "/signup" element = {<Signup />} />

                    <Route element={<ProtectedRoute />}>
                        <Route exact path = "/dashboard" element = {<Dashboard />} />
                        <Route exact path = "/modules" element = {<Modules />} />
                        <Route exact path = "/tasks" element = {<Tasks />} />
                        <Route exact path = "/calendar" element = {<Calendar />} /> 
                        <Route exact path = "/profile" element = {<Profile />} />
                    </Route>

                </Routes>
            </Router>
        </>
    )
}