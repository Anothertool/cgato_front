import { useState } from 'react'
import { Box, Button, Checkbox, Heading, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { surgeriesApi } from '../../api/surgeries'
import useAuthMutate from '../../hooks/useAuthMutate'
import { checklist, eyeLabels, statusLabels, toDateTimeInput } from '../../utils/format'
import FormDrawer from '../ui/FormDrawer'
import FormField, { SelectInput } from '../ui/FormField'
import { ErrorNotice } from '../ui/Feedback'
import PatientFields, { emptyPatient, patientPayload } from '../patients/PatientFields'
import PatientPicker from '../patients/PatientPicker'

const defaults = {
    hospital: '',
    surgery_type: '',
    eye: '',
    scheduled_at: '',
    insurer: '',
    anesthesia: '',
    amount: '',
    iol_model: '',
    iol_power: '',
    status: 'PENDING',
    lens_ordered: false,
    lens_received: false,
    lens_verified: false,
    documentation_ready: false,
    notes: '',
}

function Section({ number, title, children }) {
    return (
        <Box>
            <Heading size="sm" mb="4" display="flex" alignItems="center" gap="3">
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
            {children}
        </Box>
    )
}

export default function SurgeryForm({ surgery, onClose }) {
    const [value, setValue] = useState(() => ({
        ...defaults,
        ...Object.fromEntries(
            Object.keys(defaults).map((key) => [key, surgery?.[key] ?? defaults[key]]),
        ),
        scheduled_at: toDateTimeInput(surgery?.scheduled_at),
    }))
    const [mode, setMode] = useState('existing')
    const [selected, setSelected] = useState(surgery?.patient || null)
    const [patient, setPatient] = useState(emptyPatient)
    const [patientError, setPatientError] = useState('')
    const mutation = useAuthMutate({
        mutationFn: (data) =>
            surgery ? surgeriesApi.update(surgery.id, data) : surgeriesApi.create(data),
        invalidateKeys: [['surgeries'], ['patients']],
        successMessage: surgery ? 'Cirugía actualizada' : 'Cirugía creada',
        onSuccess: onClose,
    })
    const errors = mutation.error?.response?.data || {}
    const change = (event) =>
        setValue((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
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
    const submit = (event) => {
        event.preventDefault()
        if (mutation.isPending) return
        if (mode === 'existing' && !selected) {
            setPatientError('Selecciona un paciente antes de guardar.')
            return
        }
        if (mode === 'new' && !patient.first_name.trim()) return
        if (!value.hospital.trim() || !value.surgery_type.trim()) return
        setPatientError('')
        const data = {
            ...value,
            hospital: value.hospital.trim(),
            surgery_type: value.surgery_type.trim(),
            scheduled_at:
                surgery && value.scheduled_at === toDateTimeInput(surgery.scheduled_at)
                    ? surgery.scheduled_at
                    : new Date(value.scheduled_at).toISOString(),
            amount: value.amount === '' ? null : value.amount,
            iol_power: value.iol_power === '' ? null : value.iol_power,
        }
        if (mode === 'new' && !surgery) data.patient = patientPayload(patient)
        else data.patient_id = selected.id
        mutation.mutate(data)
    }
    return (
        <FormDrawer
            title={surgery ? 'Editar cirugía' : 'Nueva cirugía'}
            description="Planificación, lente intraocular y preparación quirúrgica."
            wide
            onClose={onClose}
            onSubmit={submit}
            pending={mutation.isPending}
        >
            <Stack gap="8">
                <ErrorNotice error={mutation.error} />
                <Section number="01" title="Paciente">
                    {!surgery && (
                        <Box display="flex" gap="2" mb="4">
                            <Button
                                size="sm"
                                variant={mode === 'existing' ? 'solid' : 'outline'}
                                colorPalette="blue"
                                onClick={() => {
                                    setMode('existing')
                                    setPatientError('')
                                }}
                            >
                                Paciente existente
                            </Button>
                            <Button
                                size="sm"
                                variant={mode === 'new' ? 'solid' : 'outline'}
                                colorPalette="blue"
                                onClick={() => {
                                    setMode('new')
                                    setPatientError('')
                                }}
                            >
                                Crear paciente
                            </Button>
                        </Box>
                    )}
                    {mode === 'existing' ? (
                        <PatientPicker
                            value={selected}
                            onChange={(next) => {
                                setSelected(next)
                                setPatientError('')
                            }}
                        />
                    ) : (
                        <PatientFields
                            value={patient}
                            onChange={setPatient}
                            errors={errors.patient}
                        />
                    )}
                    {(patientError || errors.patient_id) && (
                        <Text color="red.600" mt="2" fontSize="sm" role="alert">
                            {patientError || String(errors.patient_id)}
                        </Text>
                    )}
                </Section>
                <Section number="02" title="Datos de la cirugía">
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                        {field('hospital', 'Hospital', {
                            required: true,
                            pattern: '.*\\S.*',
                            maxLength: 255,
                        })}
                        {field('surgery_type', 'Tipo de cirugía', {
                            required: true,
                            pattern: '.*\\S.*',
                            maxLength: 255,
                        })}
                        <FormField label="Ojo" required error={errors.eye}>
                            <SelectInput name="eye" required value={value.eye} onChange={change}>
                                <option value="">Selecciona un ojo</option>
                                {Object.entries(eyeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FormField>
                        {field('scheduled_at', 'Fecha y hora programada', {
                            required: true,
                            type: 'datetime-local',
                        })}
                        {field('insurer', 'Aseguradora', { maxLength: 255 })}
                        {field('anesthesia', 'Anestesia', { maxLength: 255 })}
                        {field('amount', 'Importe (€)', {
                            type: 'number',
                            min: '0',
                            max: '9999999999.99',
                            step: '0.01',
                        })}
                    </SimpleGrid>
                    <Text mt="3" fontSize="xs" color="gray.500">
                        Fecha y hora en la zona horaria de este dispositivo; se envían con su
                        equivalencia UTC.
                    </Text>
                </Section>
                <Section number="03" title="Lente intraocular">
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
                        {field('iol_model', 'Modelo', { maxLength: 255 })}
                        {field('iol_power', 'Potencia (D)', {
                            type: 'number',
                            min: '-99999.99',
                            max: '99999.99',
                            step: '0.01',
                        })}
                    </SimpleGrid>
                </Section>
                <Section number="04" title="Estado y preparación">
                    <Stack gap="5">
                        <FormField label="Estado" error={errors.status}>
                            <SelectInput name="status" value={value.status} onChange={change}>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FormField>
                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                            {Object.entries(checklist).map(([key, label]) => (
                                <Box key={key}>
                                    <Checkbox.Root
                                        colorPalette="blue"
                                        checked={value[key]}
                                        disabled={key === 'lens_verified' && !value.lens_received}
                                        onCheckedChange={({ checked }) =>
                                            setValue((current) => ({
                                                ...current,
                                                [key]: checked === true,
                                                ...(key === 'lens_received' && !checked
                                                    ? { lens_verified: false }
                                                    : {}),
                                            }))
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
                        </SimpleGrid>
                        <Text color="gray.500" fontSize="xs">
                            La lente debe estar recibida para poder verificarla.
                        </Text>
                    </Stack>
                </Section>
                <Section number="05" title="Observaciones">
                    <FormField label="Notas" error={errors.notes}>
                        <Textarea
                            name="notes"
                            value={value.notes}
                            onChange={change}
                            rows={4}
                            placeholder="Añade observaciones relevantes para la cirugía…"
                        />
                    </FormField>
                </Section>
            </Stack>
        </FormDrawer>
    )
}
