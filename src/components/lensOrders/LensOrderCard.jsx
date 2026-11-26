import { useEffect, useState } from 'react'
import { Badge, Flex, Heading, IconButton, Portal, Stack, Text, Tooltip } from '@chakra-ui/react'
import { CalendarDays, Eye, Info, PackageCheck, Pencil, TriangleAlert } from 'lucide-react'
import { lensOrdersApi } from '../../api/lensOrders'
import useAuthMutate from '../../hooks/useAuthMutate'
import { formatDate, patientName } from '../../utils/format'
import PopoverDelete from '../common/PopoverDelete'
import LensOrderActionButton from './LensOrderActionButton'
import LensOrderForm from './LensOrderForm'

const eyeLabels = { RIGHT: 'OD', LEFT: 'OI', BOTH: 'Ambos' }
const deliveryLabels = {
    pickup: { label: 'Entregar', color: 'green', icon: PackageCheck },
    appointment: { label: 'Citar', color: 'purple', icon: CalendarDays },
}
const relativeTime = new Intl.RelativeTimeFormat('es', { numeric: 'always' })

export default function LensOrderCard({ order, disabled, onDelivered }) {
    const [editing, setEditing] = useState(false)
    const name = patientName(order.patient)
    const delivery = deliveryLabels[order.delivery_type]
    const stageDate =
        order.status === 'ordered' ? order.ordered_at : order.status === 'received' ? order.received_at : null
    const [now, setNow] = useState(Date.now)
    useEffect(() => {
        if (!stageDate) return
        setNow(Date.now())
        const interval = setInterval(() => setNow(Date.now()), 60000)
        return () => clearInterval(interval)
    }, [stageDate])
    const elapsedMinutes = stageDate ? Math.max(0, (now - new Date(stageDate).getTime()) / 60000) : NaN
    const elapsedDays = elapsedMinutes / 1440
    const elapsedLabel = !Number.isFinite(elapsedMinutes)
        ? ''
        : elapsedMinutes < 1
          ? 'hace unos instantes'
          : elapsedMinutes < 60
            ? relativeTime.format(-Math.floor(elapsedMinutes), 'minute')
            : elapsedMinutes < 1440
              ? relativeTime.format(-Math.floor(elapsedMinutes / 60), 'hour')
              : relativeTime.format(-Math.floor(elapsedDays), 'day')
    const deleteMutation = useAuthMutate({
        mutationFn: () => lensOrdersApi.remove(order.id),
        invalidateKeys: [['lens-orders']],
        successMessage: 'Pedido eliminado',
    })
    return (
        <>
            <Stack
                as="article"
                gap="2"
                p="3"
                bg={order.is_surgery ? 'blue.50/50' : 'yellow.50/50'}
                borderWidth="1px"
                borderColor={order.is_surgery ? 'blue.200/60' : 'yellow.200/60'}
                rounded="lg"
            >
                <Flex align="baseline" justify="space-between" gap="2">
                    <Heading as="h3" size="sm" minW="0" overflowWrap="anywhere">
                        {name}
                    </Heading>
                    <Flex align="center" gap="2" flexShrink="0">
                        <IconButton
                            type="button"
                            size="xs"
                            variant="ghost"
                            colorPalette="blue"
                            aria-label={`Editar pedido de ${name}`}
                            onClick={() => setEditing(true)}
                            disabled={deleteMutation.isPending}
                        >
                            <Pencil size={15} aria-hidden="true" />
                        </IconButton>
                        <PopoverDelete
                            label={`Eliminar pedido de ${name}`}
                            title="Eliminar pedido"
                            description={`¿Seguro que quieres eliminar el pedido de ${name}?`}
                            disabled={disabled}
                            pending={deleteMutation.isPending}
                            error={deleteMutation.error}
                            onConfirm={() => deleteMutation.mutateAsync()}
                        />
                    </Flex>
                </Flex>
                {Number.isFinite(elapsedMinutes) && (
                    <Flex
                        align="center"
                        gap="1"
                        fontSize="xs"
                        color={elapsedDays > 14 ? 'red.700' : elapsedDays > 7 ? 'orange.700' : 'gray.700'}
                    >
                        {elapsedDays > 7 && <TriangleAlert size={14} aria-label="Pedido con demora" />}
                        <Text>
                            {order.status === 'ordered' ? 'Pedida' : 'Recibida'} {elapsedLabel}
                        </Text>
                        <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                                <IconButton
                                    type="button"
                                    aria-label="Ver fecha exacta del pedido"
                                    variant="ghost"
                                    size="2xs"
                                    color="inherit"
                                >
                                    <Info size={14} aria-hidden="true" />
                                </IconButton>
                            </Tooltip.Trigger>
                            <Portal>
                                <Tooltip.Positioner>
                                    <Tooltip.Content>
                                        <Tooltip.Arrow />
                                        <Text>Pedida: {formatDate(order.ordered_at, true)}</Text>
                                        {order.status === 'received' && (
                                            <Text>Recibida: {formatDate(stageDate, true)}</Text>
                                        )}
                                    </Tooltip.Content>
                                </Tooltip.Positioner>
                            </Portal>
                        </Tooltip.Root>
                    </Flex>
                )}
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
                <LensOrderActionButton
                    order={order}
                    disabled={disabled || deleteMutation.isPending}
                    onDelivered={onDelivered}
                />
            </Stack>
            {editing && <LensOrderForm order={order} onClose={() => setEditing(false)} />}
        </>
    )
}
