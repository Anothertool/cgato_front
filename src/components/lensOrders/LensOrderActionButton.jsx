import { useState } from 'react'
import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { lensOrdersApi, lensOrdersQueryKey } from '../../api/lensOrders'
import useAuthMutate from '../../hooks/useAuthMutate'
import { toDateTimeInput } from '../../utils/format'
import { ErrorNotice } from '../ui/Feedback'
import FormField from '../ui/FormField'

const actions = {
    pending: { status: 'ordered', label: 'Pedida' },
    ordered: { status: 'received', label: 'Recibida' },
    received: { status: 'notified', label: 'Avisado' },
    notified: { status: 'delivered', label: 'Entregada' },
}

export default function LensOrderActionButton({ order, disabled }) {
    const [open, setOpen] = useState(false)
    const [appointmentDate, setAppointmentDate] = useState('')
    const action = actions[order.status]
    const needsAppointment = order.status === 'received' && order.delivery_type === 'appointment'
    const mutation = useAuthMutate({
        mutationFn: (values) => lensOrdersApi.update(order.id, values),
        invalidateKeys: action ? [lensOrdersQueryKey(order.status), lensOrdersQueryKey(action.status)] : [],
        successMessage: 'Pedido actualizado',
        onSuccess: () => setOpen(false),
    })

    if (!action) return null

    const handleClick = () => {
        if (!needsAppointment) {
            mutation.mutate({ status: action.status })
            return
        }

        setAppointmentDate(toDateTimeInput(order.appointment_date))
        mutation.reset()
        setOpen(true)
    }

    return (
        <>
            <Button
                w="full"
                size="sm"
                variant="outline"
                colorPalette="blue"
                disabled={disabled}
                loading={mutation.isPending}
                onClick={handleClick}
            >
                <Check size={16} aria-hidden="true" />
                {needsAppointment ? 'Citado' : action.label}
            </Button>
            {open && (
                <Dialog.Root
                    open
                    placement="center"
                    onOpenChange={({ open }) => {
                        if (!open && !mutation.isPending) setOpen(false)
                    }}
                    closeOnEscape={!mutation.isPending}
                    closeOnInteractOutside={!mutation.isPending}
                >
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content
                                as="form"
                                mx="4"
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    if (!appointmentDate || mutation.isPending) return
                                    mutation.mutate({
                                        status: action.status,
                                        appointment_date: new Date(appointmentDate).toISOString(),
                                    })
                                }}
                            >
                                <Dialog.Header>
                                    <Dialog.Title>Citar paciente</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                    <Stack gap="4">
                                        <ErrorNotice error={mutation.error} />
                                        <FormField
                                            label="Fecha y hora de la cita"
                                            type="datetime-local"
                                            value={appointmentDate}
                                            onChange={(event) => setAppointmentDate(event.target.value)}
                                            required
                                        />
                                    </Stack>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={mutation.isPending}
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" bg="blue.900" color="white" loading={mutation.isPending}>
                                        Guardar cita
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" disabled={mutation.isPending} />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}
        </>
    )
}
