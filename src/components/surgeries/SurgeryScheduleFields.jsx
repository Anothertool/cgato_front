import { useCallback, useEffect, useState } from 'react'
import { Badge, Box, Button, Dialog, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import Select from 'react-select'
import { surgeriesApi } from '../../api/surgeries'
import useAuthFetch from '../../hooks/useAuthFetch'
import useAuthMutate from '../../hooks/useAuthMutate'
import { patientName } from '../../utils/format'
import { surgeryDayLabel, surgeryDayRange, surgeryDayRows } from '../../utils/surgeryDayReport'
import FormField from '../ui/FormField'
import { ErrorNotice, ListFeedback } from '../ui/Feedback'

const plugins = [dayGridPlugin]
const headerToolbar = { left: 'prev,next', center: 'title', right: 'today' }
const availabilityStatuses = {
    AVAILABLE: { color: 'green.500', label: 'Disponible' },
    LIMITED: { color: 'orange.400', label: 'Limitado' },
    FULL: { color: 'red.500', label: 'Completo' },
    UNKNOWN: { color: 'gray.400', label: 'Sin información' },
}
const timeOptions = Array.from({ length: (20 - 8) * 4 + 1 }, (_, index) => {
    const minutes = 8 * 60 + index * 15
    const label = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    return { value: minutes, label }
})
const dateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function SurgeryScheduleFields({ surgery, onClose, onPendingChange }) {
    const [range, setRange] = useState(null)
    const [day, setDay] = useState('')
    const [time, setTime] = useState(timeOptions[0])
    const [timeMenuContainer, setTimeMenuContainer] = useState(null)
    const availability = useAuthFetch(
        ['surgeries', 'availability', range],
        ({ signal }) => surgeriesApi.getAvailability(range, signal),
        { enabled: !!range, refetchOnMount: 'always' },
    )
    const dayQuery = useAuthFetch(
        ['surgeries', 'schedule-day', day],
        ({ signal }) => surgeriesApi.getDay(surgeryDayRange(day), signal),
        { enabled: !!day, refetchOnMount: 'always' },
    )
    const mutation = useAuthMutate({
        mutationFn: (data) => surgeriesApi.update(surgery.id, data),
        invalidateKeys: [['surgeries'], ['patients']],
        successMessage: 'Presupuesto aceptado y cirugía citada',
        onSuccess: onClose,
    })
    useEffect(() => {
        onPendingChange(mutation.isPending)
    }, [mutation.isPending, onPendingChange])
    const datesSet = useCallback(({ view }) => {
        const next = { start: dateKey(view.currentStart), end: dateKey(view.currentEnd) }
        setRange((current) => (current?.start === next.start && current?.end === next.end ? current : next))
    }, [])
    const statuses = Object.fromEntries(
        (availability.data?.days || []).map((item) => [item.date, item.status?.toUpperCase()]),
    )
    const rows = day && dayQuery.data ? surgeryDayRows(dayQuery.data, day) : []
    const paidSurgeryIds = new Set(
        (dayQuery.data || []).filter((item) => item.has_payment === true).map((item) => item.id),
    )
    const confirmedCount = rows.filter((row) => paidSurgeryIds.has(row.id)).length
    const pendingCount = rows.length - confirmedCount
    const submit = (event) => {
        event.preventDefault()
        if (!day || !time || mutation.isPending) return
        // Las horas 08:00–20:00 usan el mismo desfase de Madrid que la siguiente medianoche,
        // incluso en los días del cambio de hora.
        const { end } = surgeryDayRange(day)
        const scheduledAt = new Date(Date.parse(end) - (24 * 60 - time.value) * 60000).toISOString()
        mutation.mutate({ budget_status: 'ACCEPTED', scheduled_at: scheduledAt })
    }

    return (
        <Box as="form" onSubmit={submit} aria-busy={mutation.isPending}>
            <Dialog.Body py="6">
                <Stack gap="5">
                    <Text fontWeight="semibold">{patientName(surgery.patient)}</Text>
                    <ErrorNotice error={mutation.error} />
                    <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6" alignItems="start">
                        <Stack gap="3" minW="0">
                            <Text fontWeight="medium">Fecha de la cirugía</Text>
                            <ErrorNotice error={availability.error} onRetry={availability.refetch} />
                            {availability.isFetching && (
                                <Text fontSize="sm" color="gray.500" role="status">
                                    Cargando disponibilidad…
                                </Text>
                            )}
                            <Box
                                aria-label="Calendario de disponibilidad"
                                css={{
                                    '--fc-border-color': '{colors.gray.200}',
                                    '--fc-today-bg-color': '{colors.blue.50}',
                                    '--fc-button-bg-color': '{colors.blue.950}',
                                    '--fc-button-border-color': '{colors.blue.950}',
                                    '--fc-button-hover-bg-color': '{colors.blue.800}',
                                    '--fc-button-hover-border-color': '{colors.blue.800}',
                                    '& .fc': { fontFamily: 'inherit', fontSize: 'sm' },
                                    '& .fc .fc-toolbar': { flexWrap: 'wrap', gap: '2' },
                                    '& .fc .fc-toolbar-title': { fontSize: 'md', fontWeight: 'semibold' },
                                    '& .fc .fc-button': { borderRadius: 'md', fontSize: 'xs' },
                                    '& .fc .fc-daygrid-day-frame': { position: 'relative', minHeight: '72px' },
                                    '& .fc .fc-daygrid-day-top': { display: 'block' },
                                    '& .fc .fc-daygrid-day-number': { position: 'static', width: 'full', p: '0' },
                                    '& .fc .fc-daygrid-day-events': { display: 'none' },
                                }}
                            >
                                <FullCalendar
                                    plugins={plugins}
                                    initialView="dayGridMonth"
                                    headerToolbar={headerToolbar}
                                    locale={esLocale}
                                    firstDay={1}
                                    height="auto"
                                    fixedWeekCount={false}
                                    showNonCurrentDates={false}
                                    datesSet={datesSet}
                                    dayCellContent={({ date, dayNumberText }) => {
                                        const key = dateKey(date)
                                        const status =
                                            availabilityStatuses[statuses[key]] || availabilityStatuses.UNKNOWN
                                        return (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                position="absolute"
                                                inset="0"
                                                w="full"
                                                h="full"
                                                minH="0"
                                                p="0"
                                                rounded="0"
                                                bg={day === key ? 'blue.100' : undefined}
                                                _hover={{ bg: 'blue.100' }}
                                                aria-label={`${surgeryDayLabel(key)}: ${status.label}`}
                                                aria-pressed={day === key}
                                                disabled={mutation.isPending}
                                                onClick={() => {
                                                    setDay(key)
                                                    mutation.reset()
                                                }}
                                            >
                                                <Text as="span" fontSize="sm">
                                                    {dayNumberText}
                                                </Text>
                                                <Box
                                                    as="span"
                                                    position="absolute"
                                                    bottom="0"
                                                    insetX="0"
                                                    h="4px"
                                                    bg={status.color}
                                                />
                                            </Button>
                                        )
                                    }}
                                />
                            </Box>
                            <Flex gap="3" wrap="wrap">
                                {Object.entries(availabilityStatuses).map(([key, status]) => (
                                    <Flex key={key} align="center" gap="1.5">
                                        <Box boxSize="7px" rounded="full" bg={status.color} />
                                        <Text fontSize="xs" color="gray.600">
                                            {status.label}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>
                        </Stack>
                        <Stack gap="4" minW="0">
                            <Stack gap="2">
                                <Text fontWeight="medium">
                                    {day ? `Cirugías del ${surgeryDayLabel(day)}` : 'Selecciona un día del calendario'}
                                    {day && dayQuery.isSuccess && !dayQuery.isFetching && ` (${rows.length})`}
                                </Text>
                                {day && dayQuery.isSuccess && !dayQuery.isFetching && (
                                    <Flex gap="2" wrap="wrap">
                                        <Badge colorPalette="green">{confirmedCount} confirmadas</Badge>
                                        <Badge colorPalette="orange">{pendingCount} pendientes</Badge>
                                    </Flex>
                                )}
                            </Stack>
                            {day && (
                                <>
                                    <ListFeedback
                                        loading={dayQuery.isFetching}
                                        error={dayQuery.error}
                                        onRetry={dayQuery.refetch}
                                    />
                                    {!dayQuery.isFetching && !dayQuery.isError && (
                                        <Stack gap="2" maxH="400px" overflowY="auto">
                                            {rows.length ? (
                                                rows.map((row) => (
                                                    <Flex
                                                        key={row.id}
                                                        gap="3"
                                                        p="3"
                                                        bg={paidSurgeryIds.has(row.id) ? 'green.100' : 'orange.100'}
                                                        color={paidSurgeryIds.has(row.id) ? 'green.950' : 'orange.950'}
                                                        borderWidth="1px"
                                                        borderColor={
                                                            paidSurgeryIds.has(row.id) ? 'green.200' : 'orange.200'
                                                        }
                                                        rounded="md"
                                                    >
                                                        <Text fontWeight="semibold" whiteSpace="nowrap">
                                                            {row.time}
                                                        </Text>
                                                        <Text fontSize="sm">{row.name}</Text>
                                                    </Flex>
                                                ))
                                            ) : (
                                                <Text fontSize="sm" color="gray.500">
                                                    No hay cirugías para este día.
                                                </Text>
                                            )}
                                        </Stack>
                                    )}
                                    <FormField
                                        label="Seleccionar hora"
                                        required
                                        error={mutation.error?.response?.data?.scheduled_at}
                                    >
                                        <Box w="full">
                                            <Select
                                                inputId="surgery-schedule-time"
                                                aria-label="Hora de la cirugía"
                                                classNamePrefix="schedule-time"
                                                options={timeOptions}
                                                value={time}
                                                onChange={(option) => {
                                                    setTime(option)
                                                    mutation.reset()
                                                }}
                                                isSearchable
                                                isDisabled={mutation.isPending}
                                                placeholder="Selecciona o busca una hora…"
                                                noOptionsMessage={() => 'No se encontraron horas'}
                                                maxMenuHeight={180}
                                                menuPlacement="auto"
                                                menuPortalTarget={timeMenuContainer}
                                                menuPosition="fixed"
                                                menuShouldScrollIntoView={false}
                                            />
                                        </Box>
                                    </FormField>
                                    <Text fontSize="xs" color="gray.500">
                                        Horario de Madrid · 08:00–20:00
                                    </Text>
                                </>
                            )}
                        </Stack>
                    </SimpleGrid>
                </Stack>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px">
                <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                    Cancelar
                </Button>
                <Button type="submit" bg="blue.900" color="white" disabled={!day || !time} loading={mutation.isPending}>
                    Aprobar y citar
                </Button>
            </Dialog.Footer>
            <Box
                ref={setTimeMenuContainer}
                css={{ '& .schedule-time__menu-portal': { zIndex: 'tooltip', pointerEvents: 'auto' } }}
            />
        </Box>
    )
}
