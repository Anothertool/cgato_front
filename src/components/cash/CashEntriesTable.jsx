import { Badge, Box, Stack, Table, Text } from '@chakra-ui/react'
import { formatDate, patientName } from '../../utils/format'
import RecordActions from '../ui/RecordActions'
import { formatMoney, invoiceStatusColors, invoiceStatusLabels, paymentMethodLabels } from './utils'

export default function CashEntriesTable({ entries, onEdit, onDelete }) {
    return (
        <Box overflowX="auto">
            <Table.Root size="md">
                <Table.Header>
                    <Table.Row bg="gray.50">
                        {['Fecha', 'Paciente', 'Método', 'Factura', 'Importe', 'Acciones'].map(
                            (label) => (
                                <Table.ColumnHeader
                                    key={label}
                                    px="5"
                                    py="4"
                                    color="gray.500"
                                    fontSize="xs"
                                    whiteSpace="nowrap"
                                    textAlign={label === 'Importe' ? 'end' : 'start'}
                                >
                                    {label}
                                </Table.ColumnHeader>
                            ),
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {entries.map((entry) => (
                        <Table.Row key={entry.id} _hover={{ bg: 'gray.50' }}>
                            <Table.Cell px="5" py="5" whiteSpace="nowrap" color="gray.600">
                                {formatDate(`${entry.date}T00:00:00`)}
                            </Table.Cell>
                            <Table.Cell px="5" fontWeight="medium" whiteSpace="nowrap">
                                {entry.patient ? patientName(entry.patient) : 'Sin paciente'}
                            </Table.Cell>
                            <Table.Cell px="5" color="gray.600">
                                {paymentMethodLabels[entry.payment_method] || entry.payment_method}
                            </Table.Cell>
                            <Table.Cell px="5">
                                <Stack gap="1" align="start">
                                    <Text fontSize="sm">{entry.invoice_number || '—'}</Text>
                                    <Badge
                                        colorPalette={
                                            invoiceStatusColors[entry.invoice_status] || 'gray'
                                        }
                                    >
                                        {invoiceStatusLabels[entry.invoice_status] ||
                                            entry.invoice_status}
                                    </Badge>
                                </Stack>
                            </Table.Cell>
                            <Table.Cell
                                px="5"
                                textAlign="end"
                                fontWeight="semibold"
                                whiteSpace="nowrap"
                            >
                                {formatMoney(entry.amount)}
                            </Table.Cell>
                            <Table.Cell px="5">
                                <RecordActions
                                    label={`cobro del ${entry.date} de ${formatMoney(entry.amount)}`}
                                    onEdit={() => onEdit(entry)}
                                    onDelete={() => onDelete(entry)}
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}
