import { useId, useState } from 'react'
import { Box, Field, SimpleGrid } from '@chakra-ui/react'
import Select from 'react-select'
import FormField from '../ui/FormField'

const firstMinute = 8 * 60
const lastMinute = 20 * 60
const interval = 15
const timeOptions = Array.from({ length: (lastMinute - firstMinute) / interval + 1 }, (_, index) => {
    const minutes = firstMinute + index * interval
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
    const remainder = String(minutes % 60).padStart(2, '0')
    const time = `${hours}:${remainder}`
    return { value: time, label: time }
})

function nearestTime() {
    const now = new Date()
    const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
    const rounded = Math.round(minutes / interval) * interval
    const bounded = Math.min(lastMinute, Math.max(firstMinute, rounded))
    return timeOptions[(bounded - firstMinute) / interval].value
}

function filterTime({ value }, input) {
    const query = input.replace(/\D/g, '')
    const digits = value.replace(':', '')
    return digits.startsWith(query) || digits.replace(/^0/, '').startsWith(query)
}

export default function DateTimeSelectField({ value, onChange, error, required, disabled }) {
    const id = useId()
    const [defaultTime] = useState(nearestTime)
    const [menuContainer, setMenuContainer] = useState(null)
    const [date, time = defaultTime] = (value || '').split('T')
    const selected = { value: time, label: time }

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3" minW="0">
            <FormField
                label="Fecha programada"
                type="date"
                value={date}
                onChange={(event) => {
                    const nextDate = event.target.value
                    onChange(nextDate ? `${nextDate}T${time}` : '')
                }}
                error={error}
                required={required}
                disabled={disabled}
            />
            <Field.Root required={required} minW="0">
                <Field.Label htmlFor={id}>
                    Hora programada
                    <Field.RequiredIndicator />
                </Field.Label>
                <Box w="full">
                    <Select
                        inputId={id}
                        instanceId={id}
                        classNamePrefix="date-time-select"
                        options={timeOptions}
                        value={selected}
                        onChange={(option) => onChange(`${date}T${option.value}`)}
                        filterOption={filterTime}
                        isSearchable
                        isDisabled={disabled || !date}
                        noOptionsMessage={() => 'No se encontraron horas'}
                        maxMenuHeight={180}
                        menuPlacement="auto"
                        menuPortalTarget={menuContainer}
                        menuPosition="fixed"
                        menuShouldScrollIntoView={false}
                    />
                </Box>
                <Box
                    ref={setMenuContainer}
                    css={{ '& .date-time-select__menu-portal': { zIndex: 'tooltip', pointerEvents: 'auto' } }}
                />
            </Field.Root>
        </SimpleGrid>
    )
}
