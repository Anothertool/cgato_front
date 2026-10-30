import { Badge, Box, Flex, IconButton, Table, Text } from '@chakra-ui/react'
import { LuBanknote } from 'react-icons/lu'
import {
    budgetStatusLabels,
    checklist,
    insurerLabels,
    surgeryTypeLabels,
    eyeLabels,
    formatDate,
    patientName,
    statusColors,
    statusLabels,
} from '../../utils/format'
import RecordActions from '../ui/RecordActions'
import CommonTable from '../common/tables/CommonTable'

const paymentStatuses = {
    PAID: { label: 'Pagado', color: 'green' },
    PARTIAL: { label: 'Pago parcial', color: 'orange' },
    PENDING: { label: 'Sin pagar', color: 'red' },
    UNKNOWN: { label: 'Desconocido', color: 'gray' },
}
const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
})

export default function SurgeriesTable({
    surgeries,
    onEdit,
    onCharge,
    onDelete,
    onCancel,
    onComplete,
    onReopen,
    onApproveAndSchedule,
    pending,
    pagination,
}) {
    return (
        <CommonTable size="sm" label="cirugías" pagination={pagination}>
            <Table.Header>
                <Table.Row bg="gray.50">
                    {[
                        'Paciente',
                        'Fecha programada',
                        'Tipo de cirugía',
                        'Ojo',
                        'Aseguradora',
                        'Estado del presupuesto',
                        'Estado de cirugía',
                        'Pago',
                        'Preparación',
                        'Acciones',
                    ].map((label) => (
                        <Table.ColumnHeader
                            key={label}
                            px="4"
                            py="4"
                            fontSize="xs"
                            color="gray.500"
                            whiteSpace="nowrap"
                        >
                            {label}
                        </Table.ColumnHeader>
                    ))}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {surgeries.map((surgery) => {
                    const paymentStatus = paymentStatuses[surgery.payment_status] || paymentStatuses.UNKNOWN
                    const completed = Object.keys(checklist).filter((key) => surgery[key]).length
                    return (
                        <Table.Row key={surgery.id} _hover={{ bg: 'gray.50' }}>
                            <Table.Cell px="4" py="5">
                                <Text fontWeight="semibold" whiteSpace="nowrap">
                                    {patientName(surgery.patient)}
                                </Text>
                                <Text fontSize="xs" color="gray.400" mt="1">
                                    {surgery.patient?.clinical_reference || 'Sin referencia'}
                                </Text>
                            </Table.Cell>
                            <Table.Cell px="4" whiteSpace="nowrap" color="gray.600">
                                {formatDate(surgery.scheduled_at, true)}
                            </Table.Cell>
                            <Table.Cell px="4">
                                {surgeryTypeLabels[surgery.surgery_type] || surgery.surgery_type || '—'}
                            </Table.Cell>
                            <Table.Cell px="4" color="gray.600">
                                {eyeLabels[surgery.eye] || surgery.eye || '—'}
                            </Table.Cell>
                            <Table.Cell px="4" color="gray.600">
                                {insurerLabels[surgery.insurer] || surgery.insurer || '—'}
                            </Table.Cell>
                            <Table.Cell px="4">
                                <Badge
                                    colorPalette={statusColors[surgery.budget_status] || 'gray'}
                                    variant="subtle"
                                    rounded="full"
                                    px="2.5"
                                    py="1"
                                    whiteSpace="nowrap"
                                >
                                    {budgetStatusLabels[surgery.budget_status] || surgery.budget_status || '—'}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell px="4">
                                <Badge
                                    colorPalette={statusColors[surgery.display_status] || 'gray'}
                                    variant="subtle"
                                    rounded="full"
                                    px="2.5"
                                    py="1"
                                    whiteSpace="nowrap"
                                >
                                    {statusLabels[surgery.display_status] || surgery.display_status || '—'}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell px="4">
                                <Badge
                                    colorPalette={paymentStatus.color}
                                    variant="subtle"
                                    rounded="full"
                                    px="2.5"
                                    py="1"
                                    whiteSpace="nowrap"
                                >
                                    {paymentStatus.label}
                                </Badge>
                                {['PARTIAL', 'PENDING'].includes(surgery.payment_status) && (
                                    <Text fontSize="xs" color="gray.500" mt="1" whiteSpace="nowrap">
                                        Pendiente: {currencyFormatter.format(Number(surgery.amount_due))}
                                        {surgery.payment_status === 'PARTIAL' && (
                                            <>
                                                {' · Cobrado: '}
                                                {Number(surgery.payment_percentage).toLocaleString('es-ES')} %
                                            </>
                                        )}
                                    </Text>
                                )}
                            </Table.Cell>
                            <Table.Cell px="4">
                                <Flex
                                    align="center"
                                    gap="2"
                                    aria-label={`${completed} de ${Object.keys(checklist).length} comprobaciones completadas`}
                                >
                                    <Flex gap="1">
                                        {Object.keys(checklist).map((key) => (
                                            <Box
                                                key={key}
                                                w="10px"
                                                h="5px"
                                                rounded="full"
                                                bg={surgery[key] ? 'teal.500' : 'gray.200'}
                                            />
                                        ))}
                                    </Flex>
                                    <Text fontSize="xs" color="gray.500">
                                        {completed}/{Object.keys(checklist).length}
                                    </Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell px="4">
                                <Flex align="center" gap="1">
                                    <IconButton
                                        aria-label={`Registrar cobro de ${patientName(surgery.patient)}`}
                                        title="Registrar cobro"
                                        size="sm"
                                        variant="ghost"
                                        colorPalette="green"
                                        disabled={pending}
                                        onClick={() => onCharge(surgery)}
                                    >
                                        <LuBanknote size={18} />
                                    </IconButton>
                                    <RecordActions
                                        label={patientName(surgery.patient)}
                                        quoteHref={`/presupuesto/${encodeURIComponent(surgery.id)}`}
                                        disabled={pending}
                                        onApproveAndSchedule={
                                            surgery.budget_status === 'QUOTED' &&
                                            !surgery.cancelled_at &&
                                            !['CANCELLED', 'COMPLETED'].includes(surgery.display_status) &&
                                            onApproveAndSchedule
                                                ? () => onApproveAndSchedule(surgery)
                                                : undefined
                                        }
                                        onComplete={
                                            [
                                                'QUOTED',
                                                'ACCEPTED',
                                                'LOST',
                                                'SCHEDULED',
                                                'AWAITING_CONFIRMATION',
                                            ].includes(surgery.display_status)
                                                ? () => onComplete(surgery)
                                                : undefined
                                        }
                                        onReopen={
                                            ['CANCELLED', 'COMPLETED'].includes(surgery.display_status)
                                                ? () => onReopen(surgery)
                                                : undefined
                                        }
                                        onEdit={() => onEdit(surgery)}
                                        onDelete={() => onDelete(surgery)}
                                        onCancel={
                                            [
                                                'QUOTED',
                                                'ACCEPTED',
                                                'LOST',
                                                'SCHEDULED',
                                                'AWAITING_CONFIRMATION',
                                            ].includes(surgery.display_status)
                                                ? () => onCancel(surgery)
                                                : undefined
                                        }
                                    />
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </CommonTable>
    )
}
