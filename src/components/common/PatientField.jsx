import { Box, Button, Field, Flex, Stack } from '@chakra-ui/react'
import PatientFields from '../patients/PatientFields'
import PatientSelect from '../patients/PatientSelect'

export default function PatientField({
    selected,
    onSelect,
    mode,
    onModeChange,
    patient,
    onPatientChange,
    disabled,
    required,
    errors = {},
}) {
    const creating = mode === 'new'
    const startCreating = onModeChange && (() => onModeChange('new'))

    return (
        <Field.Root required={required} invalid={!!errors.patient_id}>
            <Flex w="full" justify="space-between" align="center" gap="3">
                <Field.Label as={creating ? 'span' : 'label'} htmlFor={creating ? undefined : 'surgery-patient'}>
                    Paciente
                    <Field.RequiredIndicator />
                </Field.Label>
                {!creating && startCreating && (
                    <Button
                        type="button"
                        variant="plain"
                        color="blue.700"
                        size="sm"
                        p="0"
                        h="auto"
                        minH="0"
                        disabled={disabled}
                        onClick={startCreating}
                    >
                        + Crear nuevo
                    </Button>
                )}
            </Flex>
            {creating ? (
                <Stack gap="3" w="full">
                    <PatientFields
                        value={patient}
                        onChange={onPatientChange}
                        errors={errors.patient}
                        showClinicalReference={false}
                    />
                    <Button
                        type="button"
                        alignSelf="start"
                        size="sm"
                        variant="outline"
                        disabled={disabled}
                        onClick={() => onModeChange('existing')}
                    >
                        Buscar paciente existente
                    </Button>
                </Stack>
            ) : (
                <Box w="full">
                    <PatientSelect
                        value={selected}
                        onChange={onSelect}
                        onCreate={startCreating}
                        disabled={disabled}
                        required={required}
                    />
                </Box>
            )}
            {errors.patient_id && <Field.ErrorText role="alert">{String(errors.patient_id)}</Field.ErrorText>}
        </Field.Root>
    )
}
