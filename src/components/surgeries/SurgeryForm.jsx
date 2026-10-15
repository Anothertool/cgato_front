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
    Text,
    Textarea,
} from '@chakra-ui/react'
import {
    budgetStatusLabels,
    checklist,
    eyeLabels,
    insurerLabels,
    iolModelLabels,
    surgeryTypeLabels,
} from '../../utils/format'
import { useSurgeryForm } from './utils'
import FormField, { SelectInput } from '../ui/FormField'
import { ErrorNotice } from '../ui/Feedback'
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
        paymentKnown,
        amountCents,
        paidCents,
        paymentBadge,
    } = useSurgeryForm(surgery, onClose)
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
        <Dialog.Root
            open
            placement="center"
            size="xl"
            scrollBehavior="inside"
            onOpenChange={({ open }) => {
                if (!open && !mutation.isPending) onClose()
            }}
            closeOnEscape={!mutation.isPending}
            closeOnInteractOutside={!mutation.isPending}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        as="form"
                        noValidate
                        onSubmit={submit}
                        bg="white"
                        color="gray.800"
                        mx="4"
                    >
                        <Dialog.Header borderBottomWidth="1px" py="6">
                            <Dialog.Title fontSize="xl">
                                {surgery ? 'Editar cirugía' : 'Nueva cirugía'}
                            </Dialog.Title>
                            <Dialog.Description mt="1">
                                Planificación, lente intraocular y preparación quirúrgica.
                            </Dialog.Description>
                        </Dialog.Header>
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
                                            onCreate={
                                                !surgery ? () => changeMode('new') : undefined
                                            }
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
                                    <SimpleGrid
                                        columns={{ base: 1, sm: 2 }}
                                        gap="5"
                                        alignItems="center"
                                    >
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
                                        {selectField(
                                            'surgery_type',
                                            'Tipo de cirugía',
                                            surgeryTypeLabels,
                                        )}
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
                                <Section number="05" title="Observaciones">
                                    <FormField label="Notas" error={errors.notes}>
                                        <Textarea
                                            name="notes"
                                            value={value.notes}
                                            onChange={change}
                                            rows={value.notes ? 8 : 5}
                                            minH={value.notes ? '200px' : '140px'}
                                            autoresize
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
                                                    <Checkbox.Label fontSize="sm">
                                                        {label}
                                                    </Checkbox.Label>
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
                                        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="5">
                                            {field('amount', 'Importe de cirugía (€)', {
                                                type: 'number',
                                                min: '0',
                                                max: '9999999999.99',
                                                step: '0.01',
                                            })}
                                            {field(
                                                'operating_room_cost',
                                                'Coste de quirófano (€)',
                                                {
                                                    type: 'number',
                                                    min: '0',
                                                    max: '9999999999.99',
                                                    step: '0.01',
                                                },
                                            )}
                                            {field('amount_paid', 'Importe cobrado (€)', {
                                                type: 'number',
                                                min: '0',
                                                max:
                                                    value.amount === ''
                                                        ? '9999999999.99'
                                                        : value.amount,
                                                step: '0.01',
                                            })}
                                        </SimpleGrid>
                                        <Box aria-live="polite">
                                            <Text fontSize="sm" mb="2">
                                                Estado de pago
                                            </Text>
                                            <Badge colorPalette={paymentBadge.color}>
                                                {paymentBadge.label}
                                            </Badge>
                                            <Text fontSize="sm" mt="3">
                                                Importe pendiente de cobro:{' '}
                                                {paymentKnown
                                                    ? new Intl.NumberFormat('es-ES', {
                                                          style: 'currency',
                                                          currency: 'EUR',
                                                      }).format((amountCents - paidCents) / 100)
                                                    : '—'}
                                            </Text>
                                        </Box>
                                    </Stack>
                                </Section>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer borderTopWidth="1px">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={mutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                bg="blue.900"
                                color="white"
                                loading={mutation.isPending}
                            >
                                Guardar cambios
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={mutation.isPending} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
