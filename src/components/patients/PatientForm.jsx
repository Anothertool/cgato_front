import { useState } from 'react'
import { Stack } from '@chakra-ui/react'
import { patientsApi } from '../../api/patients'
import useAuthMutate from '../../hooks/useAuthMutate'
import FormDrawer from '../ui/FormDrawer'
import { ErrorNotice } from '../ui/Feedback'
import PatientFields, { emptyPatient, patientPayload } from './PatientFields'

export default function PatientForm({ patient, onClose }) {
    const [value, setValue] = useState(patient ? { ...emptyPatient, ...patient } : emptyPatient)
    const mutation = useAuthMutate({
        mutationFn: (data) =>
            patient ? patientsApi.update(patient.id, data) : patientsApi.create(data),
        invalidateKeys: [['patients'], ['surgeries']],
        successMessage: patient ? 'Paciente actualizado' : 'Paciente creado',
        onSuccess: onClose,
    })
    const submit = (event) => {
        event.preventDefault()
        if (mutation.isPending) return
        if (value.first_name.trim()) mutation.mutate(patientPayload(value))
    }
    return (
        <FormDrawer
            title={patient ? 'Editar paciente' : 'Nuevo paciente'}
            description="Información de contacto y referencia clínica."
            onClose={onClose}
            onSubmit={submit}
            pending={mutation.isPending}
        >
            <Stack gap="6">
                <ErrorNotice error={mutation.error} />
                <PatientFields
                    value={value}
                    onChange={setValue}
                    errors={mutation.error?.response?.data}
                />
            </Stack>
        </FormDrawer>
    )
}
