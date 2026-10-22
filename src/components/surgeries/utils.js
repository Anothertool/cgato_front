import { useState } from 'react'
import * as yup from 'yup'
import { surgeriesApi } from '../../api/surgeries'
import useAuthMutate from '../../hooks/useAuthMutate'
import {
    budgetStatusLabels,
    checklist,
    eyeLabels,
    insurerLabels,
    iolModelLabels,
    patientSourceLabels,
    statusColors,
    statusLabels,
    surgeryTypeLabels,
    toDateTimeInput,
} from '../../utils/format'
import { emptyPatient, patientPayload } from '../patients/PatientFields'

export const initialValues = {
    surgery_type: '',
    eye: '',
    scheduled_at: '',
    insurer: '',
    anesthesia: '',
    amount: '',
    operating_room_cost: '',
    amount_paid: '0.00',
    iol_model: '',
    iol_power: '',
    budget_status: 'QUOTED',
    ...Object.fromEntries(Object.keys(checklist).map((key) => [key, false])),
    notes: '',
}

const optionalChoice = (labels) =>
    yup.string().oneOf(['', ...Object.keys(labels)], 'Selecciona una opción válida.')
const decimal = (min, max) =>
    yup
        .number()
        .transform((value, original) => (original === '' || original == null ? null : value))
        .nullable()
        .typeError('Introduce un número válido.')
        .min(min, `El valor mínimo es ${min}.`)
        .max(max, `El valor máximo es ${max}.`)
        .test('decimals', 'Introduce como máximo dos decimales.', (value) =>
            value == null
                ? true
                : Math.abs(value * 100 - Math.round(value * 100)) <=
                  Math.max(0.0000001, Number.EPSILON * Math.abs(value * 100) * 2),
        )

export const surgerySchema = yup.object({
    surgery_type: optionalChoice(surgeryTypeLabels),
    eye: optionalChoice(eyeLabels),
    insurer: optionalChoice(insurerLabels),
    iol_model: optionalChoice(iolModelLabels),
    budget_status: yup
        .string()
        .oneOf(Object.keys(budgetStatusLabels), 'Selecciona un estado válido.')
        .required('Selecciona un estado.'),
    scheduled_at: yup
        .string()
        .test('date', 'Introduce una fecha y hora válidas.', (value) =>
            !value ? true : Number.isFinite(new Date(value).getTime()),
        ),
    anesthesia: yup.string().max(255, 'La anestesia no puede superar los 255 caracteres.'),
    amount: decimal(0, 9999999999.99),
    operating_room_cost: decimal(0, 9999999999.99),
    iol_power: decimal(-99999.99, 99999.99),
    notes: yup.string(),
    ...Object.fromEntries(Object.keys(checklist).map((key) => [key, yup.boolean().required()])),
})

const formSchema = yup.object({
    value: surgerySchema,
    mode: yup.string().oneOf(['existing', 'new']).required(),
    selected: yup
        .mixed()
        .nullable()
        .when('mode', {
            is: 'existing',
            then: (schema) => schema.required('Selecciona un paciente antes de guardar.'),
        }),
    patient: yup.object().when('$mode', {
        is: 'new',
        then: (schema) =>
            schema.shape({
                first_name: yup
                    .string()
                    .trim()
                    .required('Introduce el nombre del paciente.')
                    .max(150, 'El nombre no puede superar los 150 caracteres.'),
                last_name: yup
                    .string()
                    .max(150, 'Los apellidos no pueden superar los 150 caracteres.'),
                phone: yup.string().max(50, 'El teléfono no puede superar los 50 caracteres.'),
                patient_source: yup
                    .string()
                    .oneOf(Object.keys(patientSourceLabels), 'Selecciona una procedencia válida.')
                    .required('Selecciona una procedencia.'),
            }),
    }),
})

export function getInitialValues(surgery) {
    return {
        ...Object.fromEntries(
            Object.entries(initialValues).map(([key, value]) => [key, surgery?.[key] ?? value]),
        ),
        scheduled_at: toDateTimeInput(surgery?.scheduled_at),
    }
}

export function getPaymentState(value, surgery) {
    // Compare integer cents to avoid decimal rounding errors.
    const amountCents = Math.round(Number(value.amount) * 100)
    const paidCents = Math.round(Number(value.amount_paid) * 100)
    const paymentKnown =
        value.amount !== '' &&
        value.amount_paid !== '' &&
        Number.isFinite(amountCents) &&
        Number.isFinite(paidCents) &&
        amountCents >= 0 &&
        paidCents >= 0 &&
        paidCents <= amountCents
    const calculatedStatus = !paymentKnown
        ? 'UNKNOWN'
        : paidCents === amountCents
          ? 'PAID'
          : paidCents === 0
            ? 'PENDING'
            : 'PARTIAL'
    const badges = {
        UNKNOWN: { label: 'Desconocido', color: 'gray' },
        PENDING: { label: 'Pendiente', color: 'orange' },
        PARTIAL: { label: 'Pago parcial', color: 'blue' },
        PAID: { label: 'Pagado', color: 'green' },
    }
    const amountUnchanged = surgery && value.amount === (surgery.amount ?? '')
    const paymentBadge =
        (amountUnchanged && badges[surgery.payment_status]) || badges[calculatedStatus]
    const amountDue =
        amountUnchanged && surgery.amount_due != null
            ? surgery.amount_due
            : paymentKnown
              ? (amountCents - paidCents) / 100
              : null
    return { paymentKnown, amountCents, paidCents, paymentBadge, amountDue }
}

export function surgeryPayload(value, surgery, mode, selected, patient) {
    const { amount_paid, ...editableValues } = value
    const data = {
        ...editableValues,
        ...Object.fromEntries(
            [
                'surgery_type',
                'eye',
                'insurer',
                'iol_model',
                'amount',
                'operating_room_cost',
                'iol_power',
            ].map((key) => [key, value[key] === '' ? null : value[key]]),
        ),
        scheduled_at: !value.scheduled_at
            ? null
            : surgery && value.scheduled_at === toDateTimeInput(surgery.scheduled_at)
              ? surgery.scheduled_at
              : new Date(value.scheduled_at).toISOString(),
    }
    if (mode === 'new' && !surgery) data.patient = patientPayload(patient)
    else data.patient_id = selected.id
    return data
}

export function useSurgeryForm(surgery, onClose) {
    const [value, setValue] = useState(() => getInitialValues(surgery))
    const [mode, setMode] = useState('existing')
    const [selected, setSelected] = useState(surgery?.patient || null)
    const [patient, setPatient] = useState(() => ({ ...emptyPatient }))
    const [validationErrors, setValidationErrors] = useState({})
    const mutation = useAuthMutate({
        mutationFn: (data) =>
            surgery ? surgeriesApi.update(surgery.id, data) : surgeriesApi.create(data),
        invalidateKeys: [['surgeries'], ['patients']],
        successMessage: surgery ? 'Cirugía actualizada' : 'Cirugía creada',
        onSuccess: onClose,
    })
    const errors = { ...mutation.error?.response?.data, ...validationErrors }
    const clearError = (name) => {
        setValidationErrors((current) => {
            const next = { ...current }
            delete next[name]
            return next
        })
        if (mutation.error) mutation.reset()
    }
    const change = (event) => {
        const { name, value: next } = event.target
        setValue((current) => ({ ...current, [name]: next }))
        clearError(name)
    }
    const selectPatient = (next) => {
        setSelected(next)
        clearError('patient_id')
    }
    const changeMode = (next) => {
        setMode(next)
        clearError('patient_id')
        clearError('patient')
    }
    const changePatient = (next) => {
        setPatient(next)
        clearError('patient')
    }
    const changeChecklist = (name, checked) => {
        setValue((current) => ({ ...current, [name]: checked === true }))
        clearError(name)
    }
    const submit = (event) => {
        event.preventDefault()
        if (mutation.isPending) return
        try {
            formSchema.validateSync(
                { value, mode, selected, patient },
                { abortEarly: false, context: { mode } },
            )
        } catch (error) {
            if (!(error instanceof yup.ValidationError)) throw error
            const next = {}
            error.inner.forEach(({ path, message }) => {
                if (path === 'selected') next.patient_id = message
                else if (path.startsWith('patient.')) {
                    next.patient = { ...next.patient, [path.slice('patient.'.length)]: message }
                } else {
                    const name = path.replace(/^value\./, '')
                    if (!next[name]) next[name] = message
                }
            })
            setValidationErrors(next)
            return
        }
        setValidationErrors({})
        mutation.mutate(surgeryPayload(value, surgery, mode, selected, patient))
    }
    const status = surgery?.display_status || value.budget_status
    return {
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
        surgeryState: {
            label: statusLabels[status] || status,
            color: statusColors[status] || 'gray',
        },
        ...getPaymentState(value, surgery),
    }
}
