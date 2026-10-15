import { Badge, Box, Flex, Table, Text } from '@chakra-ui/react'
import {
    checklist,
    eyeLabels,
    formatDate,
    patientName,
    statusColors,
    statusLabels,
} from '../../utils/format'
import RecordActions from '../ui/RecordActions'

export default function SurgeriesTable({ surgeries, onEdit, onDelete, onCancel }) {
    return (
        <Box overflowX="auto">
            <Table.Root size="sm">
                <Table.Header>
                    <Table.Row bg="gray.50">
                        {[
                            'Paciente',
                            'Fecha de cirugía',
                            'Hospital',
                            'Tipo de cirugía',
                            'Ojo',
                            'Aseguradora',
                            'Estado',
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
                        const completed = Object.keys(checklist).filter(
                            (key) => surgery[key],
                        ).length
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
                                <Table.Cell px="4">{surgery.hospital}</Table.Cell>
                                <Table.Cell px="4">{surgery.surgery_type}</Table.Cell>
                                <Table.Cell px="4" color="gray.600">
                                    {eyeLabels[surgery.eye] || surgery.eye}
                                </Table.Cell>
                                <Table.Cell px="4" color="gray.600">
                                    {surgery.insurer || '—'}
                                </Table.Cell>
                                <Table.Cell px="4">
                                    <Badge
                                        colorPalette={statusColors[surgery.status] || 'gray'}
                                        variant="subtle"
                                        rounded="full"
                                        px="2.5"
                                        py="1"
                                        whiteSpace="nowrap"
                                    >
                                        {statusLabels[surgery.status] || surgery.status}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell px="4">
                                    <Flex
                                        align="center"
                                        gap="2"
                                        aria-label={`${completed} de 4 comprobaciones completadas`}
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
                                            {completed}/4
                                        </Text>
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell px="4">
                                    <RecordActions
                                        label={patientName(surgery.patient)}
                                        onEdit={() => onEdit(surgery)}
                                        onDelete={() => onDelete(surgery)}
                                        onCancel={
                                            !['CANCELLED', 'COMPLETED'].includes(surgery.status)
                                                ? () => onCancel(surgery)
                                                : undefined
                                        }
                                    />
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table.Root>
        </Box>
    )
}
