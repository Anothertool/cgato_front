import { Box, Flex, Table, Text } from '@chakra-ui/react'
import { formatDate, patientName } from '../../utils/format'
import RecordActions from '../ui/RecordActions'

export default function PatientsTable({ patients, onEdit, onDelete }) {
    return (
        <Box overflowX="auto">
            <Table.Root size="md">
                <Table.Header>
                    <Table.Row bg="gray.50">
                        {[
                            'Nombre completo',
                            'Teléfono',
                            'Referencia clínica',
                            'Fecha de creación',
                            'Acciones',
                        ].map((label) => (
                            <Table.ColumnHeader
                                key={label}
                                py="4"
                                px="5"
                                color="gray.500"
                                fontSize="xs"
                                whiteSpace="nowrap"
                            >
                                {label}
                            </Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {patients.map((patient) => (
                        <Table.Row key={patient.id} _hover={{ bg: 'gray.50' }}>
                            <Table.Cell px="5" py="5">
                                <Flex align="center" gap="3">
                                    <Flex
                                        rounded="full"
                                        boxSize="36px"
                                        flexShrink="0"
                                        bg="blue.50"
                                        color="blue.800"
                                        align="center"
                                        justify="center"
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {[patient.first_name, patient.last_name]
                                            .filter(Boolean)
                                            .map((part) => part[0])
                                            .join('')
                                            .slice(0, 2)}
                                    </Flex>
                                    <Text fontWeight="medium" whiteSpace="nowrap">
                                        {patientName(patient)}
                                    </Text>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell px="5" color="gray.600">
                                {patient.phone || '—'}
                            </Table.Cell>
                            <Table.Cell px="5" color="gray.600">
                                {patient.clinical_reference || '—'}
                            </Table.Cell>
                            <Table.Cell px="5" color="gray.600" whiteSpace="nowrap">
                                {formatDate(patient.created_at)}
                            </Table.Cell>
                            <Table.Cell px="5">
                                <RecordActions
                                    label={patientName(patient)}
                                    onEdit={() => onEdit(patient)}
                                    onDelete={() => onDelete(patient)}
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}
