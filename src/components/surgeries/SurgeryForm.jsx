import { useEffect, useState } from 'react'
import { LuChevronDown, LuChevronUp } from 'react-icons/lu'
import {
    Badge,
    Box,
    Button,
    Checkbox,
    CloseButton,
    Dialog,
    Flex,
    Heading,
    Portal,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Textarea,
} from '@chakra-ui/react'
import {
    budgetStatusLabels,
    checklist,
    eyeLabels,
    formatDate,
    insurerLabels,
    iolModelLabels,
    surgeryTypeLabels,
} from '../../utils/format'
import { useSurgeryForm } from './utils'
import FormField, { SelectInput } from '../ui/FormField'
import { ErrorNotice, ListFeedback } from '../ui/Feedback'
import { surgeriesApi } from '../../api/surgeries'
import useAuthFetch from '../../hooks/useAuthFetch'
import {
    formatMoney,
    invoiceStatusColors,
    invoiceStatusLabels,
    paymentMethodLabels,
} from '../cash/utils'
import PatientSelect from '../patients/PatientSelect'
import PatientFields from '../patients/PatientFields'

function Section({ number, title, action, children }) {
    return (
        <Box>
            <Flex justify="space-between" align="center" gap="3" mb="4">
                <Heading size="sm" display="flex" alignItems="center" gap="3">
                    <Text
                        as="span"
                        rounded="md"
                        bg="blue.50"
                        color="blue.800"
                        px="2"
                        py="1"
                        fontSize="xs"
                    >
                        {number}
                    </Text>
                    {title}
                </Heading>
                {action}
            </Flex>
            {children}
        </Box>
    )
}

export default function SurgeryForm({ surgery, onClose }) {
    const [pending, setPending] = useState(false)
    const detail = useAuthFetch(
        ['surgeries', 'detail', surgery?.id],
        ({ signal }) => surgeriesApi.getById(surgery.id, signal),
        {
            enabled: !!surgery?.id,
            refetchOnMount: 'always',
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    )

    const loading = surgery?.id && !detail.data
    return (
        <Dialog.Root
            open
            placement="center"
            size="xl"
            scrollBehavior="inside"
            onOpenChange={({ open }) => {
                if (!open && !pending) onClose()
            }}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content bg="white" color="gray.800" mx="4">
                        <Dialog.Header borderBottomWidth="1px" py="6">
                            <Dialog.Title fontSize="xl">
                                {surgery ? 'Editar cirugía' : 'Nueva cirugía'}
                            </Dialog.Title>
                            <Dialog.Description mt="1">
                                Planificación, lente intraocular y preparación quirúrgica.
                            </Dialog.Description>
                        </Dialog.Header>
                        {loading ? (
                            <Dialog.Body py="6">
                                <ListFeedback
                                    loading={detail.isFetching}
                                    error={detail.error}
                                    onRetry={detail.refetch}
                                />
                            </Dialog.Body>
                        ) : (
                            <SurgeryFormFields
                                key={surgery?.id || 'new'}
                                surgery={surgery?.id ? detail.data : null}
                                onClose={onClose}
                                onPendingChange={setPending}
                            />
                        )}
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={pending} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

function SurgeryFormFields({ surgery, onClose, onPendingChange }) {
    const [notesExpanded, setNotesExpanded] = useState(false)
    const [paymentsExpanded, setPaymentsExpanded] = useState(false)
    const payments = surgery?.payments || []
    const {
        value,
        mode,
        selected,
        patient,
        errors,
        mutation,
        change,
        selectPatient,
        changeMode,
        changePatient,
        changeChecklist,
        submit,
        surgeryState,
        amountDue,
        paymentBadge,
    } = useSurgeryForm(surgery, onClose)
    useEffect(() => {
        onPendingChange(mutation.isPending)
    }, [mutation.isPending, onPendingChange])
    const field = (name, label, props = {}) => (
        <FormField
            key={name}
            label={label}
            name={name}
            value={value[name]}
            onChange={change}
            error={errors[name]}
            {...props}
        />
    )
    const selectField = (name, label, options, optional = true) => (
        <FormField label={label} error={errors[name]}>
            <SelectInput name={name} value={value[name]} onChange={change}>
                {optional && <option value="">Sin seleccionar</option>}
                {Object.entries(options).map(([key, text]) => (
                    <option key={key} value={key}>
                        {text}
                    </option>
                ))}
            </SelectInput>
        </FormField>
    )
    return (
        <Box
            as="form"
            noValidate
            onSubmit={submit}
            display="flex"
            flexDirection="column"
            flex="1"
            minH="0"
        >
            <Dialog.Body py="6">
                <Stack gap="8">
                    <ErrorNotice error={mutation.error} />
                    <Section
                        number="01"
                        title="Paciente"
                        action={
                            !surgery &&
                            mode === 'existing' && (
                                <Button
                                    type="button"
                                    variant="plain"
                                    color="blue.700"
                                    size="sm"
                                    px="0"
                                    disabled={mutation.isPending}
                                    onClick={() => changeMode('new')}
                                >
                                    + Crear nuevo
                                </Button>
                            )
                        }
                    >
                        {mode === 'existing' ? (
                            <PatientSelect
                                value={selected}
                                disabled={mutation.isPending}
                                onChange={selectPatient}
                                onCreate={!surgery ? () => changeMode('new') : undefined}
                            />
                        ) : (
                            <Stack gap="3">
                                <PatientFields
                                    value={patient}
                                    onChange={changePatient}
                                    errors={errors.patient}
                                    showClinicalReference={false}
                                />
                                <Button
                                    alignSelf="start"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => changeMode('existing')}
                                >
                                    Buscar paciente existente
                                </Button>
                            </Stack>
                        )}
                        {errors.patient_id && (
                            <Text color="red.600" mt="2" fontSize="sm" role="alert">
                                {String(errors.patient_id)}
                            </Text>
                        )}
                    </Section>
                    <Section number="02" title="Estado">
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5" alignItems="center">
                            {selectField(
                                'budget_status',
                                'Estado del presupuesto',
                                budgetStatusLabels,
                                false,
                            )}
                            <Box>
                                <Text fontSize="sm" mb="2">
                                    Estado de cirugía
                                </Text>
                                <Badge colorPalette={surgeryState.color}>
                                    {surgeryState.label}
                                </Badge>
                            </Box>
                        </SimpleGrid>
                    </Section>
                    <Section number="03" title="Datos de la cirugía">
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                            {selectField('surgery_type', 'Tipo de cirugía', surgeryTypeLabels)}
                            {selectField('eye', 'Ojo', eyeLabels)}
                            {field('scheduled_at', 'Fecha y hora programada', {
                                type: 'datetime-local',
                            })}
                            {selectField('insurer', 'Aseguradora', insurerLabels)}
                            {field('anesthesia', 'Anestesia', { maxLength: 255 })}
                        </SimpleGrid>
                    </Section>
                    <Section number="04" title="Lente intraocular">
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                            {selectField('iol_model', 'Modelo', iolModelLabels)}
                            {field('iol_power', 'Potencia (D)', {
                                type: 'number',
                                min: '-99999.99',
                                max: '99999.99',
                                step: '0.01',
                            })}
                        </SimpleGrid>
                    </Section>
                    <Section
                        number="05"
                        title="Observaciones"
                        action={
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                aria-expanded={notesExpanded}
                                aria-controls="surgery-notes"
                                onClick={() => setNotesExpanded((current) => !current)}
                            >
                                {notesExpanded ? 'Contraer' : 'Ampliar'}
                                {notesExpanded ? <LuChevronUp /> : <LuChevronDown />}
                            </Button>
                        }
                    >
                        <FormField label="Notas" error={errors.notes}>
                            <Textarea
                                id="surgery-notes"
                                name="notes"
                                value={value.notes}
                                onChange={change}
                                rows={notesExpanded ? 8 : 2}
                                minH={notesExpanded ? '200px' : '72px'}
                                resize={notesExpanded ? 'vertical' : 'none'}
                                placeholder="Añade observaciones relevantes para la cirugía…"
                            />
                        </FormField>
                    </Section>
                    <Section number="06" title="Checklist de preparación">
                        <Stack gap="4">
                            {Object.entries(checklist).map(([key, label]) => (
                                <Box key={key}>
                                    <Checkbox.Root
                                        colorPalette="blue"
                                        checked={value[key]}
                                        onCheckedChange={({ checked }) =>
                                            changeChecklist(key, checked)
                                        }
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control />
                                        <Checkbox.Label fontSize="sm">{label}</Checkbox.Label>
                                    </Checkbox.Root>
                                    {errors[key] && (
                                        <Text color="red.600" fontSize="xs">
                                            {String(errors[key])}
                                        </Text>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Section>
                    <Section number="07" title="Economía">
                        <Stack gap="5">
                            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                                {field('amount', 'Importe de cirugía (€)', {
                                    type: 'number',
                                    min: '0',
                                    max: '9999999999.99',
                                    step: '0.01',
                                })}
                                {field('operating_room_cost', 'Coste de quirófano (€)', {
                                    type: 'number',
                                    min: '0',
                                    max: '9999999999.99',
                                    step: '0.01',
                                })}
                            </SimpleGrid>
                            <Box borderWidth="1px" rounded="lg" overflow="hidden">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    w="full"
                                    h="auto"
                                    p="4"
                                    rounded="none"
                                    whiteSpace="normal"
                                    justifyContent="space-between"
                                    aria-expanded={paymentsExpanded}
                                    aria-controls="surgery-payments"
                                    onClick={() => setPaymentsExpanded((current) => !current)}
                                >
                                    <Flex
                                        flex="1"
                                        align="center"
                                        justify="space-between"
                                        gap="3"
                                        wrap="wrap"
                                    >
                                        <Flex align="center" gap="2">
                                            <Text as="span" fontSize="sm">
                                                Estado de pago
                                            </Text>
                                            <Badge colorPalette={paymentBadge.color}>
                                                {paymentBadge.label}
                                            </Badge>
                                        </Flex>
                                        <Text as="span" fontSize="sm" fontWeight="normal">
                                            Pendiente de cobro: {formatMoney(amountDue)}
                                        </Text>
                                    </Flex>
                                    {paymentsExpanded ? <LuChevronUp /> : <LuChevronDown />}
                                </Button>
                                <Box
                                    id="surgery-payments"
                                    hidden={!paymentsExpanded}
                                    borderTopWidth="1px"
                                    p="4"
                                >
                                    <Text fontSize="sm" fontWeight="semibold" mb="3">
                                        Histórico de pagos ({payments.length})
                                    </Text>
                                    {payments.length ? (
                                        <Box overflowX="auto">
                                            <Table.Root size="sm">
                                                <Table.Header>
                                                    <Table.Row>
                                                        {[
                                                            'Fecha',
                                                            'Método',
                                                            'Importe',
                                                            'Factura',
                                                            'Notas',
                                                        ].map((label) => (
                                                            <Table.ColumnHeader
                                                                key={label}
                                                                whiteSpace="nowrap"
                                                            >
                                                                {label}
                                                            </Table.ColumnHeader>
                                                        ))}
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {payments.map((payment) => (
                                                        <Table.Row key={payment.id}>
                                                            <Table.Cell whiteSpace="nowrap">
                                                                {formatDate(
                                                                    `${payment.date}T00:00:00`,
                                                                )}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {payment.payment_method_label ||
                                                                    paymentMethodLabels[
                                                                        payment.payment_method
                                                                    ] ||
                                                                    payment.payment_method ||
                                                                    '—'}
                                                            </Table.Cell>
                                                            <Table.Cell
                                                                whiteSpace="nowrap"
                                                                fontWeight="medium"
                                                            >
                                                                {formatMoney(payment.amount)}
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                <Stack gap="1" align="start">
                                                                    <Text>
                                                                        {payment.invoice_number ||
                                                                            '—'}
                                                                    </Text>
                                                                    <Badge
                                                                        colorPalette={
                                                                            invoiceStatusColors[
                                                                                payment
                                                                                    .invoice_status
                                                                            ] || 'gray'
                                                                        }
                                                                    >
                                                                        {payment.invoice_status_label ||
                                                                            invoiceStatusLabels[
                                                                                payment
                                                                                    .invoice_status
                                                                            ] ||
                                                                            payment.invoice_status ||
                                                                            '—'}
                                                                    </Badge>
                                                                </Stack>
                                                            </Table.Cell>
                                                            <Table.Cell
                                                                minW="140px"
                                                                whiteSpace="pre-wrap"
                                                                overflowWrap="anywhere"
                                                            >
                                                                {payment.notes || '—'}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </Box>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500">
                                            No hay pagos registrados para esta cirugía.
                                        </Text>
                                    )}
                                </Box>
                            </Box>
                        </Stack>
                    </Section>
                </Stack>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px">
                <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" bg="blue.900" color="white" loading={mutation.isPending}>
                    Guardar cambios
                </Button>
            </Dialog.Footer>
        </Box>
    )
}
