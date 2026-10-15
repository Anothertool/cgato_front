import { Field, Input, NativeSelect } from '@chakra-ui/react'

export default function FormField({
    label,
    name,
    value,
    onChange,
    error,
    required,
    children,
    ...props
}) {
    return (
        <Field.Root required={required} invalid={!!error}>
            <Field.Label>
                {label}
                <Field.RequiredIndicator />
            </Field.Label>
            {children || (
                <Input
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    required={required}
                    {...props}
                />
            )}
            {error && (
                <Field.ErrorText>
                    {Array.isArray(error) ? error.join(' ') : String(error)}
                </Field.ErrorText>
            )}
        </Field.Root>
    )
}

export function SelectInput({ children, ...props }) {
    return (
        <NativeSelect.Root>
            <NativeSelect.Field {...props}>{children}</NativeSelect.Field>
            <NativeSelect.Indicator />
        </NativeSelect.Root>
    )
}
