import { SimpleGrid } from '@chakra-ui/react'
import FormField, { SelectInput } from '../ui/FormField'
import { patientSourceLabels } from '../../utils/format'

export const emptyPatient = {
    first_name: '',
    last_name: '',
    phone: '',
    patient_source: 'UNKNOWN',
    clinical_reference: '',
}
export const patientPayload = (patient) => ({
    first_name: patient.first_name.trim(),
    last_name: patient.last_name?.trim() || '',
    phone: patient.phone?.trim() || '',
    patient_source: patient.patient_source || 'UNKNOWN',
    clinical_reference: patient.clinical_reference?.trim() || null,
})

export default function PatientFields({
    value,
    onChange,
    errors = {},
    showClinicalReference = true,
}) {
    const change = (event) => onChange({ ...value, [event.target.name]: event.target.value })
    return (
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
            <FormField
                label="Nombre"
                name="first_name"
                required
                pattern=".*\S.*"
                maxLength={150}
                value={value.first_name}
                onChange={change}
                error={errors.first_name}
            />
            <FormField
                label="Apellidos"
                name="last_name"
                maxLength={150}
                value={value.last_name}
                onChange={change}
                error={errors.last_name}
            />
            <FormField
                label="Teléfono"
                name="phone"
                type="tel"
                maxLength={50}
                value={value.phone}
                onChange={change}
                error={errors.phone}
            />
            <FormField label="Procedencia del paciente" error={errors.patient_source}>
                <SelectInput
                    name="patient_source"
                    value={value.patient_source || 'UNKNOWN'}
                    onChange={change}
                >
                    {Object.entries(patientSourceLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </SelectInput>
            </FormField>
            {showClinicalReference && (
                <FormField
                    label="Referencia clínica"
                    name="clinical_reference"
                    maxLength={100}
                    value={value.clinical_reference}
                    onChange={change}
                    error={errors.clinical_reference}
                />
            )}
        </SimpleGrid>
    )
}
