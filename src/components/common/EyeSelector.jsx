import { Flex, RadioGroup } from '@chakra-ui/react'
import FormField from '../ui/FormField'

const eyes = { RIGHT: 'OD', LEFT: 'OI', BOTH: 'Ambos' }

export default function EyeSelector({ value, onChange, required, disabled, error }) {
    const options = required ? eyes : { ...eyes, unspecified: 'Sin especificar' }

    return (
        <FormField label="Ojo" required={required} error={error}>
            <RadioGroup.Root
                aria-label="Ojo"
                name="eye"
                value={required ? value : value || 'unspecified'}
                colorPalette="blue"
                disabled={disabled}
                onValueChange={({ value: next }) => onChange(next === 'unspecified' ? '' : next)}
            >
                <Flex gap="5" align="center" minH="10" wrap="wrap">
                    {Object.entries(options).map(([key, label]) => (
                        <RadioGroup.Item key={key} value={key}>
                            <RadioGroup.ItemHiddenInput required={required} />
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>{label}</RadioGroup.ItemText>
                        </RadioGroup.Item>
                    ))}
                </Flex>
            </RadioGroup.Root>
        </FormField>
    )
}
