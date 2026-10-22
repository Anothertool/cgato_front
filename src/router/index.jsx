import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import PatientsPage from '../pages/PatientsPage'
import SurgeriesPage from '../pages/SurgeriesPage'
import CalendarPage from '../pages/CalendarPage'
import CashPage from '../pages/CashPage'
import SurgeryQuotePage from '../pages/SurgeryQuotePage'

export const router = createBrowserRouter([
    { path: '/presupuesto/:id', element: <SurgeryQuotePage /> },
    {
        element: <App />,
        children: [
            { path: '/', element: <Navigate to="/surgeries" replace /> },
            { path: '/cash', element: <CashPage /> },
            { path: '/surgeries', element: <SurgeriesPage /> },
            { path: '/patients', element: <PatientsPage /> },
            { path: '/calendar', element: <CalendarPage /> },
            { path: '*', element: <Navigate to="/surgeries" replace /> },
        ],
    },
])
