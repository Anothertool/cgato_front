import { Button, Flex, Stack, Text } from '@chakra-ui/react'
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
        <Stack gap="2">
            <Flex justify="space-between" align="center" gap="3">
                <Text fontWeight="medium" fontSize="sm">
                    Paciente
                    {required && (
                        <Text as="span" color="red.600" ml="1" aria-hidden="true">
                            *
                        </Text>
                    )}
                </Text>
                {!creating && startCreating && (
                    <Button
                        type="button"
                        variant="plain"
                        color="blue.700"
                        size="sm"
                        px="0"
                        disabled={disabled}
                        onClick={startCreating}
                    >
                        + Crear nuevo
                    </Button>
                )}
            </Flex>
            {creating ? (
                <Stack gap="3">
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
                <PatientSelect
                    value={selected}
                    onChange={onSelect}
                    onCreate={startCreating}
                    disabled={disabled}
                    required={required}
                />
            )}
            {errors.patient_id && (
                <Text color="red.600" fontSize="sm" role="alert">
                    {String(errors.patient_id)}
                </Text>
            )}
        </Stack>
    )
}
