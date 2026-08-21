import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router-dom';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/en';

import { AuthProvider } from './context/AuthContext.jsx';

import App from './App.jsx';

import './index.css';

createRoot(document.getElementById('root')).render(
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en'>
        <AuthProvider>
            <App />
        </AuthProvider>
    </LocalizationProvider>
);