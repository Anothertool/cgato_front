import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import PatientsPage from '../pages/PatientsPage'
import SurgeriesPage from '../pages/SurgeriesPage'
import CalendarPage from '../pages/CalendarPage'

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            { path: '/', element: <Navigate to="/surgeries" replace /> },
            { path: '/surgeries', element: <SurgeriesPage /> },
            { path: '/patients', element: <PatientsPage /> },
            { path: '/calendar', element: <CalendarPage /> },
            { path: '*', element: <Navigate to="/surgeries" replace /> },
        ],
    },
])
