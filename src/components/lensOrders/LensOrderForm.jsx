import { useState } from 'react'
import { Button, CloseButton, Dialog, Flex, Grid, Input, Portal, SimpleGrid, Stack, Textarea } from '@chakra-ui/react'
import { CalendarDays, PackageCheck } from 'lucide-react'
import { lensOrderOptionsQueryKey, lensOrdersApi, lensOrdersQueryKey } from '../../api/lensOrders'
import { patientsApi } from '../../api/patients'
import useAuthMutate from '../../hooks/useAuthMutate'
import { toDateTimeInput } from '../../utils/format'
import EyeSelector from '../common/EyeSelector'
import PatientField from '../common/PatientField'
import { emptyPatient, patientPayload } from '../patients/PatientFields'
import { ErrorNotice } from '../ui/Feedback'
import FormField, { SelectInput } from '../ui/FormField'

const laboratories = {
    TIEDRA: 'TIEDRA (4177)',
    MENICOM: 'MENICON (103586)',
    MARKENOVI: 'Markennovy (50197)',
}
const lensTypes = { ortho_k: 'Orto-K', rgp: 'RPG', soft: 'Blanda' }
const formats = { blister: 'Blíster', box: 'Caja' }
const deliveryOptions = [
    { value: 'appointment', label: 'Citar', icon: CalendarDays },
    { value: 'pickup', label: 'Recoger', icon: PackageCheck },
]
const orderFields = ['lens_type', 'laboratory', 'format', 'right_eye_parameters', 'left_eye_parameters', 'notes']

function OrderSelect({ label, name, value = '', options }) {
    return (
        <FormField label={label}>
            <SelectInput name={name} aria-label={label} defaultValue={value}>
                <option value="">Sin especificar</option>
                {value && !Object.hasOwn(options, value) && <option value={value}>{value}</option>}
                {Object.entries(options).map(([key, text]) => (
                    <option key={key} value={key}>
                        {text}
                    </option>
                ))}
            </SelectInput>
        </FormField>
    )
}

export default function LensOrderForm({ order, onClose }) {
    const [selected, setSelected] = useState(order?.patient ?? null)
    const [mode, setMode] = useState('existing')
    const [patient, setPatient] = useState(emptyPatient)
    const [eye, setEye] = useState(order?.eye ?? '')
    const [deliveryType, setDeliveryType] = useState(order?.delivery_type ?? '')
    const showAppointment =
        deliveryType === 'appointment' && (order?.appointment_date || ['notified', 'delivered'].includes(order?.status))
    const mutation = useAuthMutate({
        mutationFn: (values) => (order ? lensOrdersApi.update(order.id, values) : lensOrdersApi.create(values)),
        invalidateKeys: [lensOrdersQueryKey(order?.status ?? 'pending'), lensOrderOptionsQueryKey],
        successMessage: order ? 'Pedido actualizado' : 'Pedido creado',
        onSuccess: onClose,
    })
    const createPatient = useAuthMutate({
        mutationFn: patientsApi.create,
        invalidateKeys: [['patients']],
        successMessage: 'Paciente creado',
        onSuccess: (created) => {
            setSelected(created)
            setMode('existing')
            setPatient(emptyPatient)
        },
    })
    const pending = mutation.isPending || createPatient.isPending
    const canSubmit = Boolean((order || deliveryType) && (mode === 'new' ? patient.first_name.trim() : selected))

    const submit = async (event) => {
        event.preventDefault()
        if (!canSubmit || pending) return
        const form = new FormData(event.currentTarget)
        const fields = Object.fromEntries(orderFields.map((name) => [name, form.get(name)]))
        if (order) {
            const updates = { ...fields, eye, delivery_type: deliveryType, patient_id: selected.id }
            const date = form.get('appointment_date')
            if (showAppointment && date !== toDateTimeInput(order.appointment_date)) {
                updates.appointment_date = date ? new Date(date).toISOString() : null
            } else if (deliveryType === 'pickup' && order.delivery_type !== 'pickup' && order.appointment_date) {
                updates.appointment_date = null
            }
            const changes = Object.fromEntries(
                Object.entries(updates).filter(
                    ([name, value]) => value !== (name === 'patient_id' ? order.patient?.id : (order[name] ?? '')),
                ),
            )
            if (Object.keys(changes).length) mutation.mutate(changes)
            else onClose()
            return
        }
        let orderPatient = selected
        if (mode === 'new') {
            try {
                orderPatient = await createPatient.mutateAsync(patientPayload(patient))
            } catch {
                return
            }
        }
        mutation.mutate({ ...fields, eye, delivery_type: deliveryType, patient_id: orderPatient.id })
    }

    return (
        <Dialog.Root
            open
            placement="center"
            scrollBehavior="inside"
            size="xl"
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
                            <Dialog.Title fontSize="xl">{order ? 'Editar pedido' : 'Nuevo pedido'}</Dialog.Title>
                            <Dialog.Description mt="1">
                                {order
                                    ? 'Actualiza los datos del pedido.'
                                    : 'Selecciona o crea un paciente y añade los datos de las lentes.'}
                            </Dialog.Description>
                        </Dialog.Header>
                        <Dialog.Body py="6">
                            <Stack gap="4">
                                <ErrorNotice error={mutation.error || createPatient.error} />
                                <Grid templateColumns={{ base: '1fr', sm: 'minmax(0, 3fr) minmax(0, 2fr)' }} gap="4">
                                    <PatientField
                                        required
                                        selected={selected}
                                        onSelect={setSelected}
                                        mode={mode}
                                        onModeChange={
                                            order
                                                ? undefined
                                                : (next) => {
                                                      createPatient.reset()
                                                      setMode(next)
                                                  }
                                        }
                                        patient={patient}
                                        onPatientChange={setPatient}
                                        disabled={pending}
                                        errors={{
                                            patient: createPatient.error?.response?.data,
                                            patient_id: mutation.error?.response?.data?.patient_id,
                                        }}
                                    />
                                    <OrderSelect
                                        label="Laboratorio"
                                        name="laboratory"
                                        value={order?.laboratory ?? ''}
                                        options={laboratories}
                                    />
                                </Grid>
                                <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4" alignItems="start">
                                    <FormField label="Tipo de entrega" required={!order}>
                                        <Flex w="full" gap="2" role="group" aria-label="Tipo de entrega">
                                            {deliveryOptions.map(({ value, label, icon: Icon }) => (
                                                <Button
                                                    key={value}
                                                    type="button"
                                                    flex="1"
                                                    flexDirection="column"
                                                    h="auto"
                                                    py="2"
                                                    gap="1"
                                                    borderWidth="1px"
                                                    borderColor="blue.900"
                                                    color={deliveryType === value ? 'white' : 'blue.900'}
                                                    bg={deliveryType === value ? 'blue.900' : 'white'}
                                                    _hover={{ bg: deliveryType === value ? 'blue.800' : 'blue.50' }}
                                                    aria-pressed={deliveryType === value}
                                                    disabled={pending}
                                                    onClick={() => setDeliveryType(value)}
                                                >
                                                    <Icon size={18} aria-hidden="true" />
                                                    {label}
                                                </Button>
                                            ))}
                                        </Flex>
                                    </FormField>
                                    <EyeSelector value={eye} onChange={setEye} disabled={pending} />
                                    <OrderSelect
                                        label="Tipo de lente"
                                        name="lens_type"
                                        value={order?.lens_type ?? ''}
                                        options={lensTypes}
                                    />
                                    <OrderSelect
                                        label="Formato"
                                        name="format"
                                        value={order?.format ?? ''}
                                        options={formats}
                                    />
                                    <FormField label="Parámetros OD">
                                        <Textarea
                                            name="right_eye_parameters"
                                            aria-label="Parámetros OD"
                                            defaultValue={order?.right_eye_parameters}
                                        />
                                    </FormField>
                                    <FormField label="Parámetros OI">
                                        <Textarea
                                            name="left_eye_parameters"
                                            aria-label="Parámetros OI"
                                            defaultValue={order?.left_eye_parameters}
                                        />
                                    </FormField>
                                </SimpleGrid>
                                {showAppointment && (
                                    <FormField label="Fecha y hora de la cita">
                                        <Input
                                            name="appointment_date"
                                            type="datetime-local"
                                            defaultValue={toDateTimeInput(order.appointment_date)}
                                        />
                                    </FormField>
                                )}
                                <FormField label="Notas">
                                    <Textarea name="notes" aria-label="Notas" defaultValue={order?.notes} />
                                </FormField>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer borderTopWidth="1px">
                            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" bg="blue.900" color="white" loading={pending} disabled={!canSubmit}>
                                Guardar pedido
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
