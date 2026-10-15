import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

export default function App() {
    const { pathname } = useLocation()
    return (
        <Box minH="100vh" bg="gray.50" color="gray.800">
            <Sidebar />
            <Box ml={{ base: '0', md: '232px' }}>
                <Header title={pathname === '/patients' ? 'Pacientes' : 'Cirugías'} />
                <Box as="main" p={{ base: '5', lg: '10' }} maxW="1800px" mx="auto">
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}
