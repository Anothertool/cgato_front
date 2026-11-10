import { useState } from 'react'
import { Badge, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { CalendarDays, Eye, PackageCheck } from 'lucide-react'
import { formatDate, patientName } from '../../utils/format'
import LensOrderActionButton from './LensOrderActionButton'
import LensOrderForm from './LensOrderForm'

const eyeLabels = { RIGHT: 'OD', LEFT: 'OI', BOTH: 'Ambos' }
const deliveryLabels = {
    pickup: { label: 'Entregar', color: 'green', icon: PackageCheck },
    appointment: { label: 'Citar', color: 'purple', icon: CalendarDays },
}

export default function LensOrderCard({ order, disabled, onDelivered }) {
    const [editing, setEditing] = useState(false)
    const name = patientName(order.patient)
    const delivery = deliveryLabels[order.delivery_type]
    return (
        <>
            <Stack as="article" gap="2" p="3" bg="white" borderWidth="1px" borderColor="gray.200" rounded="lg">
                <Flex align="baseline" justify="space-between" gap="2">
                    <Heading as="h3" size="sm" minW="0" overflowWrap="anywhere">
                        {name}
                    </Heading>
                    <Button
                        type="button"
                        variant="plain"
                        flexShrink="0"
                        minW="0"
                        h="auto"
                        p="0"
                        fontSize="xs"
                        color="blue.700"
                        _hover={{ textDecoration: 'underline' }}
                        aria-label={`Editar pedido de ${name}`}
                        onClick={() => setEditing(true)}
                    >
                        Editar
                    </Button>
                </Flex>
                <Flex wrap="wrap" gap="1.5" align="center" fontSize="xs" color="gray.700" overflowWrap="anywhere">
                    {order.laboratory && <Text>{order.laboratory}</Text>}
                    <Flex align="center" gap="1">
                        <Eye size={14} aria-hidden="true" />
                        {eyeLabels[order.eye] || 'ONA'}
                    </Flex>
                    {order.format && <Text>{order.format_label || order.format}</Text>}
                </Flex>
                {order.lens_type && (
                    <Text fontSize="sm" overflowWrap="anywhere">
                        {order.lens_type_label || order.lens_type}
                    </Text>
                )}
                <Flex gap="2" wrap="wrap" align="center">
                    {delivery && (
                        <Badge colorPalette={delivery.color}>
                            <delivery.icon size={13} aria-hidden="true" />
                            {delivery.label}
                        </Badge>
                    )}
                    {order.appointment_date && (
                        <Flex align="center" gap="1" color="gray.700" fontSize="xs">
                            <CalendarDays size={14} aria-hidden="true" />
                            <Text>{formatDate(order.appointment_date, true)}</Text>
                        </Flex>
                    )}
                </Flex>
                <LensOrderActionButton order={order} disabled={disabled} onDelivered={onDelivered} />
            </Stack>
            {editing && <LensOrderForm order={order} onClose={() => setEditing(false)} />}
        </>
    )
}
