import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

export default function App() {
    const { pathname } = useLocation()
    const [headerActions, setHeaderActions] = useState(null)
    return (
        <Box minH="100vh" bg="gray.50" color="gray.800">
            <Sidebar />
            <Box ml={{ base: '0', md: '232px' }}>
                {pathname !== '/calendar' && (
                    <Header
                        actionRef={setHeaderActions}
                        showBreadcrumbs={pathname === '/patients' || pathname === '/cash'}
                        title={
                            pathname === '/cash'
                                ? 'Caja'
                                : pathname === '/patients'
                                  ? 'Pacientes'
                                  : 'Cirugías'
                        }
                    />
                )}
                <Box as="main" px={{ base: '5', lg: '10' }} py="6" maxW="1800px" mx="auto">
                    <Outlet context={{ headerActions }} />
                </Box>
            </Box>
        </Box>
    )
}
