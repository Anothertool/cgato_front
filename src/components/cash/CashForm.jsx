import { useState } from 'react'
import {
    Box,
    Button,
    CloseButton,
    Dialog,
    Flex,
    Portal,
    RadioGroup,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react'
import { cashApi } from '../../api/cash'
import { patientsApi } from '../../api/patients'
import useAuthMutate from '../../hooks/useAuthMutate'
import PatientSelect from '../patients/PatientSelect'
import SurgerySelect, { surgeryOptionLabel } from '../surgeries/SurgerySelect'
import PatientFields, { emptyPatient, patientPayload } from '../patients/PatientFields'
import FormField, { SelectInput } from '../ui/FormField'
import { ErrorNotice } from '../ui/Feedback'
import { invoiceStatusLabels, paymentMethodLabels, todayDate } from './utils'

export default function CashForm({ entry, surgery, onClose }) {
    const [selectedSurgery, setSelectedSurgery] = useState(() => {
        if (surgery) return surgery
        if (entry?.surgery && typeof entry.surgery === 'object') return entry.surgery
        const id = entry?.surgery_id || entry?.surgery
        return id ? { id } : null
    })
    const [association, setAssociation] = useState(
        surgery || entry?.surgery || entry?.surgery_id
            ? 'surgery'
            : entry?.patient
              ? 'patient'
              : '',
    )
    const [value, setValue] = useState(() => ({
        date: entry?.date || todayDate(),
        amount: entry?.amount ?? '',
        payment_method: entry?.payment_method || 'CASH',
        invoice_number: entry?.invoice_number || '',
        invoice_status: entry?.invoice_status || 'PENDING',
        notes: entry?.notes || '',
    }))
    const [selected, setSelected] = useState(entry?.patient || null)
    const [mode, setMode] = useState('existing')
    const [patient, setPatient] = useState(() => ({ ...emptyPatient }))
    const [patientError, setPatientError] = useState('')
    const mutation = useAuthMutate({
        mutationFn: (data) => (entry ? cashApi.update(entry.id, data) : cashApi.create(data)),
        invalidateKeys: [['cash'], ['surgeries']],
        successMessage: entry ? 'Cobro actualizado' : 'Cobro creado',
        onSuccess: onClose,
    })
    const createPatient = useAuthMutate({
        mutationFn: patientsApi.create,
        invalidateKeys: [['patients']],
        successMessage: 'Paciente creado',
        onSuccess: (created) => {
            setSelected(created)
            setMode('existing')
        },
    })
    const pending = mutation.isPending || createPatient.isPending
    const errors = mutation.error?.response?.data || {}
    const patientErrors = {
        ...createPatient.error?.response?.data,
        ...(patientError ? { first_name: patientError } : {}),
    }
    const change = (event) => {
        const { name, value: next } = event.target
        setValue((current) => ({ ...current, [name]: next }))
        if (mutation.error) mutation.reset()
    }
    const changeMode = (next) => {
        setMode(next)
        setPatientError('')
        mutation.reset()
        createPatient.reset()
    }
    const submit = async (event) => {
        event.preventDefault()
        if (pending) return
        let patientId = association === 'patient' ? selected?.id || null : null
        if (association === 'patient' && mode === 'new') {
            if (!patient.first_name.trim()) {
                setPatientError('Introduce el nombre del paciente.')
                return
            }
            try {
                const created = await createPatient.mutateAsync(patientPayload(patient))
                patientId = created.id
            } catch {
                return
            }
        }
        const surgeryId = association === 'surgery' ? selectedSurgery?.id || null : null
        mutation.mutate({
            ...value,
            amount: Number(value.amount).toFixed(2),
            invoice_number: value.invoice_number.trim(),
            notes: value.notes.trim(),
            ...(entry
                ? { patient_id: patientId, surgery_id: surgeryId }
                : surgeryId
                  ? { surgery_id: surgeryId }
                  : patientId
                    ? { patient_id: patientId }
                    : {}),
        })
    }
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
                    <Dialog.Content as="form" onSubmit={submit} bg="white" color="gray.800" mx="4">
                        <Dialog.Header borderBottomWidth="1px" py="6">
                            <Dialog.Title fontSize="xl">
                                {entry ? 'Editar cobro' : 'Nuevo cobro'}
                            </Dialog.Title>
                            <Dialog.Description mt="1">
                                Registra el importe, el método de pago y los datos de la factura.
                            </Dialog.Description>
                        </Dialog.Header>
                        <Dialog.Body py="6">
                            <Stack gap="6">
                                <ErrorNotice error={mutation.error || createPatient.error} />
                                <Box
                                    as="fieldset"
                                    disabled={pending}
                                    border="0"
                                    p="0"
                                    m="0"
                                    minW="0"
                                >
                                    <Stack gap="6">
                                        {surgery ? (
                                            <Box>
                                                <Text fontWeight="medium" fontSize="sm" mb="2">
                                                    Cirugía asociada
                                                </Text>
                                                <Text fontSize="sm">
                                                    {surgeryOptionLabel(surgery)}
                                                </Text>
                                                {errors.surgery_id && (
                                                    <Text
                                                        role="alert"
                                                        fontSize="sm"
                                                        color="red.600"
                                                        mt="2"
                                                    >
                                                        {String(errors.surgery_id)}
                                                    </Text>
                                                )}
                                            </Box>
                                        ) : (
                                            <FormField label="Asociar cobro (opcional)">
                                                <SelectInput
                                                    value={association}
                                                    onChange={(event) => {
                                                        setAssociation(event.target.value)
                                                        setSelected(null)
                                                        setSelectedSurgery(null)
                                                        setMode('existing')
                                                        setPatientError('')
                                                        mutation.reset()
                                                        createPatient.reset()
                                                    }}
                                                >
                                                    <option value="">Sin asociar</option>
                                                    <option value="patient">Paciente</option>
                                                    <option value="surgery">Cirugía</option>
                                                </SelectInput>
                                            </FormField>
                                        )}
                                        {!surgery && association === 'surgery' && (
                                            <FormField label="Cirugía" error={errors.surgery_id}>
                                                <SurgerySelect
                                                    value={selectedSurgery}
                                                    disabled={pending}
                                                    onChange={(next) => {
                                                        setSelectedSurgery(next)
                                                        mutation.reset()
                                                    }}
                                                />
                                            </FormField>
                                        )}
                                        {!surgery && association === 'patient' && (
                                            <Box>
                                                <Flex
                                                    justify="space-between"
                                                    align="center"
                                                    mb="2"
                                                    gap="3"
                                                >
                                                    <Text fontWeight="medium" fontSize="sm">
                                                        Paciente (opcional)
                                                    </Text>
                                                    {mode === 'existing' && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="plain"
                                                            color="blue.700"
                                                            onClick={() => changeMode('new')}
                                                        >
                                                            + Crear nuevo
                                                        </Button>
                                                    )}
                                                </Flex>
                                                {mode === 'existing' ? (
                                                    <PatientSelect
                                                        value={selected}
                                                        disabled={pending}
                                                        onChange={(next) => {
                                                            setSelected(next)
                                                            mutation.reset()
                                                        }}
                                                        onCreate={() => changeMode('new')}
                                                    />
                                                ) : (
                                                    <Stack gap="3">
                                                        <PatientFields
                                                            value={patient}
                                                            onChange={(next) => {
                                                                setPatient(next)
                                                                setPatientError('')
                                                                createPatient.reset()
                                                            }}
                                                            errors={patientErrors}
                                                            showClinicalReference={false}
                                                        />
                                                        <Button
                                                            type="button"
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
                                                    <Text
                                                        role="alert"
                                                        fontSize="sm"
                                                        color="red.600"
                                                        mt="2"
                                                    >
                                                        {String(errors.patient_id)}
                                                    </Text>
                                                )}
                                                <Text color="gray.500" fontSize="xs" mt="2">
                                                    Puedes asociar el cobro a un paciente o a una
                                                    cirugía, o dejarlo sin asociar.
                                                </Text>
                                            </Box>
                                        )}
                                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                                            <FormField
                                                label="Fecha"
                                                name="date"
                                                type="date"
                                                required
                                                value={value.date}
                                                onChange={change}
                                                error={errors.date}
                                            />
                                            <FormField
                                                label="Importe (€)"
                                                name="amount"
                                                type="number"
                                                required
                                                min="0.01"
                                                max="9999999999.99"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={value.amount}
                                                onChange={change}
                                                error={errors.amount}
                                            />
                                        </SimpleGrid>
                                        <FormField
                                            label="Método de pago"
                                            required
                                            error={errors.payment_method}
                                        >
                                            <Flex
                                                gap="2"
                                                wrap="wrap"
                                                role="group"
                                                aria-label="Método de pago"
                                            >
                                                {Object.entries(paymentMethodLabels).map(
                                                    ([key, label]) => (
                                                        <Button
                                                            key={key}
                                                            type="button"
                                                            size="sm"
                                                            colorPalette="blue"
                                                            variant={
                                                                value.payment_method === key
                                                                    ? 'solid'
                                                                    : 'outline'
                                                            }
                                                            aria-pressed={
                                                                value.payment_method === key
                                                            }
                                                            onClick={() =>
                                                                change({
                                                                    target: {
                                                                        name: 'payment_method',
                                                                        value: key,
                                                                    },
                                                                })
                                                            }
                                                        >
                                                            {label}
                                                        </Button>
                                                    ),
                                                )}
                                            </Flex>
                                        </FormField>
                                        <FormField
                                            label="Número de factura (opcional)"
                                            name="invoice_number"
                                            maxLength={100}
                                            placeholder="Ej. VG-2026-00125"
                                            value={value.invoice_number}
                                            onChange={change}
                                            error={errors.invoice_number}
                                        />
                                        <FormField
                                            label="Estado de la factura"
                                            required
                                            error={errors.invoice_status}
                                        >
                                            <RadioGroup.Root
                                                name="invoice_status"
                                                value={value.invoice_status}
                                                colorPalette="blue"
                                                disabled={pending}
                                                onValueChange={({ value: next }) =>
                                                    change({
                                                        target: {
                                                            name: 'invoice_status',
                                                            value: next,
                                                        },
                                                    })
                                                }
                                            >
                                                <Stack gap="3">
                                                    {Object.entries(invoiceStatusLabels).map(
                                                        ([key, label]) => (
                                                            <RadioGroup.Item key={key} value={key}>
                                                                <RadioGroup.ItemHiddenInput />
                                                                <RadioGroup.ItemIndicator />
                                                                <RadioGroup.ItemText>
                                                                    {label}
                                                                </RadioGroup.ItemText>
                                                            </RadioGroup.Item>
                                                        ),
                                                    )}
                                                </Stack>
                                            </RadioGroup.Root>
                                        </FormField>
                                        <FormField
                                            label="Observaciones (opcional)"
                                            error={errors.notes}
                                        >
                                            <Textarea
                                                name="notes"
                                                value={value.notes}
                                                onChange={change}
                                                rows={4}
                                                placeholder="Anotaciones del cobro…"
                                            />
                                        </FormField>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer borderTopWidth="1px">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={pending}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" bg="blue.900" color="white" loading={pending}>
                                Guardar cambios
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={pending} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
