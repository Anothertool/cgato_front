import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { Box, Button, Grid } from '@chakra-ui/react'
import { BellRing, CheckCheck, ClipboardList, Package, PackageCheck, Plus } from 'lucide-react'
import { lensOrdersQueryKey } from '../api/lensOrders'
import LensOrderForm from '../components/lensOrders/LensOrderForm'
import LensOrderList from '../components/lensOrders/LensOrderList'
import OrdersTopBarFilter from '../components/lensOrders/OrdersTopBarFilter'
import useDebouncedValue from '../hooks/useDebouncedValue'

const stages = [
    { status: 'pending', label: 'Pendientes', color: 'gray.600', icon: ClipboardList },
    { status: 'ordered', label: 'Pedidas', color: 'blue.600', icon: Package },
    { status: 'received', label: 'Recibidas', color: 'orange.700', icon: PackageCheck },
    { status: 'notified', label: 'Avisados / Citados', color: 'purple.600', icon: BellRing },
    { status: 'delivered', label: 'Entregadas', color: 'green.700', icon: CheckCheck },
]

export default function LensOrdersPage() {
    const { headerActions } = useOutletContext()
    const [formOpen, setFormOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const laboratory = searchParams.get('laboratory') ?? ''
    const search = searchParams.get('search') ?? ''
    const searchTerm = useDebouncedValue(search.trim())
    const filters = {
        ...(laboratory && { laboratory }),
        ...(search.trim() && searchTerm && { search: searchTerm }),
    }
    const updateFilters = (values, replace = false) => {
        const params = new URLSearchParams(searchParams)
        Object.entries(values).forEach(([name, value]) => {
            if (value) params.set(name, value)
            else params.delete(name)
        })
        setSearchParams(params, { replace })
    }

    return (
        <Grid h="full" templateRows="auto minmax(0, 1fr)" minW="0">
            {headerActions &&
                createPortal(
                    <Button
                        bg="blue.950"
                        color="white"
                        size={{ base: 'sm', sm: 'md' }}
                        px={{ base: '3', sm: '5' }}
                        onClick={() => setFormOpen(true)}
                    >
                        <Plus size={17} />
                        Nuevo pedido
                    </Button>,
                    headerActions,
                )}
            <OrdersTopBarFilter
                laboratory={laboratory}
                onLaboratoryChange={(value) => updateFilters({ laboratory: value })}
                search={search}
                onSearchChange={(value) => updateFilters({ search: value }, true)}
                onClear={() => updateFilters({ laboratory: '', search: '' })}
            />
            <Box overflowX="auto" overflowY="hidden" role="region" aria-label="Tablero de pedidos" tabIndex={0}>
                <Grid h="full" templateRows="minmax(0, 1fr)" templateColumns="repeat(5, minmax(220px, 1fr))" gap="3">
                    {stages.map((stage) => (
                        <LensOrderList
                            key={stage.status}
                            stage={stage}
                            queryKey={lensOrdersQueryKey(stage.status, filters)}
                        />
                    ))}
                </Grid>
            </Box>
            {formOpen && <LensOrderForm onClose={() => setFormOpen(false)} />}
        </Grid>
    )
}
