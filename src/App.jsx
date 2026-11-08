import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'

const pageTitles = { '/cash': 'Caja', '/patients': 'Pacientes', '/orders': 'Pedidos' }

export default function App() {
    const { pathname } = useLocation()
    const [headerActions, setHeaderActions] = useState(null)
    const isOrders = pathname === '/orders'
    return (
        <Box
            minH={isOrders ? '0' : '100vh'}
            h={isOrders ? '100dvh' : undefined}
            display={isOrders ? 'grid' : undefined}
            gridTemplateRows={isOrders ? { base: 'auto minmax(0, 1fr)', md: 'minmax(0, 1fr)' } : undefined}
            bg="gray.50"
            color="gray.800"
        >
            <Sidebar />
            <Box
                ml={{ base: '0', md: '232px' }}
                minW="0"
                display={isOrders ? 'grid' : undefined}
                gridTemplateRows={isOrders ? 'auto minmax(0, 1fr)' : undefined}
            >
                {pathname !== '/calendar' && (
                    <Header actionRef={setHeaderActions} title={pageTitles[pathname] || 'Cirugías'} />
                )}
                <Box as="main" px={{ base: '5', lg: '10' }} py="6" w="full" minW="0" minH="0" maxW="1800px" mx="auto">
                    <Outlet context={{ headerActions }} />
                </Box>
            </Box>
        </Box>
    )
}
