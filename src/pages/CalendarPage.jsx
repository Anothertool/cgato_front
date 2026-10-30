import { useCallback, useMemo, useState } from 'react'
import { Box, Button, Flex, Popover, Portal, Spinner, Stack, Text } from '@chakra-ui/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { surgeriesApi } from '../api/surgeries'
import useAuthFetch from '../hooks/useAuthFetch'
import SurgeryForm from '../components/surgeries/SurgeryForm'
import { ErrorNotice } from '../components/ui/Feedback'
import { eyeLabels, surgeryTypeLabels } from '../utils/format'
import { surgeryDayLabel, surgeryDayRange, surgeryDayRows } from '../utils/surgeryDayReport'
import { showPdfPreview } from '../utils/pdfPreview'
import { toaster } from '../components/ui/toaster'

const plugins = [dayGridPlugin, interactionPlugin]
const headerToolbar = { left: 'prev,next today', center: 'title', right: '' }
const eventTimeFormat = { hour: '2-digit', minute: '2-digit', hour12: false }

function renderEvent({ event, timeText }) {
    const surgery = event.extendedProps.surgery
    const details = [
        surgery.surgery_type &&
            (surgery.surgery_type_label ||
                surgeryTypeLabels[surgery.surgery_type] ||
                surgery.surgery_type),
        surgery.eye && (surgery.eye_label || eyeLabels[surgery.eye] || surgery.eye),
    ]
        .filter(Boolean)
        .join(' · ')
    return (
        <Box
            px="1"
            py="0.5"
            minW="0"
            title={[timeText, event.title, details].filter(Boolean).join(' · ')}
        >
            <Text fontSize="xs" fontWeight="semibold" whiteSpace="normal" overflowWrap="anywhere">
                {timeText && `${timeText} `}
                {event.title}
            </Text>
            {details && (
                <Text fontSize="xs" whiteSpace="normal">
                    {details}
                </Text>
            )}
        </Box>
    )
}

export default function CalendarPage() {
    const [range, setRange] = useState(null)
    const [surgery, setSurgery] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [reportDay, setReportDay] = useState(null)
    const day = selectedDay?.day
    const queryDay = reportDay || day
    const dayRange = useMemo(() => (queryDay ? surgeryDayRange(queryDay) : null), [queryDay])
    const dayQuery = useAuthFetch(
        ['surgeries', 'day-report', queryDay],
        ({ signal }) => surgeriesApi.getDay(dayRange, signal),
        { enabled: false, gcTime: 0 },
    )
    const query = useAuthFetch(
        ['surgeries', 'calendar', range],
        ({ signal }) => surgeriesApi.getCalendar(range, signal),
        { enabled: !!range },
    )
    const datesSet = useCallback(({ start, end }) => {
        setSelectedDay(null)
        const next = { start: start.toISOString(), end: end.toISOString() }
        setRange((current) =>
            current?.start === next.start && current?.end === next.end ? current : next,
        )
    }, [])
    const events = useMemo(
        () =>
            (query.data || [])
                .filter(
                    (item) =>
                        item.scheduled_at &&
                        !item.cancelled_at &&
                        item.budget_status !== 'LOST' &&
                        !['CANCELLED', 'LOST'].includes(item.display_status),
                )
                .map((item) => ({
                    id: item.id,
                    start: item.scheduled_at,
                    title: item.patient_name,
                    classNames: [
                        item.has_payment === true ? 'surgery-with-payment' : 'surgery-without-payment',
                    ],
                    extendedProps: { surgery: item },
                })),
        [query.data],
    )
    const eventClick = useCallback(({ event }) => {
        setSelectedDay(null)
        setSurgery(event.extendedProps.surgery)
    }, [])
    const dateClick = ({ dateStr, dayEl }) => {
        if (!generating) setSelectedDay({ day: dateStr, element: dayEl })
    }
    const generateReport = async () => {
        if (generating || !day) return
        const preview = window.open('about:blank', '_blank')
        if (!preview) {
            toaster.create({
                title: 'Permite las ventanas emergentes para abrir el PDF y vuelve a intentarlo.',
                type: 'error',
            })
            return
        }
        preview.opener = null
        preview.document.title = `Listado de cirugías — ${surgeryDayLabel(day)}`
        preview.document.body.textContent = 'Generando listado de cirugías…'
        setReportDay(day)
        setGenerating(true)
        try {
            const result = await dayQuery.refetch()
            if (result.error) throw result.error
            const rows = surgeryDayRows(result.data, day)
            console.log('[PDF cirugías] Fechas recibidas y horas del informe', {
                day,
                timeZone: 'Europe/Madrid',
                surgeries: result.data.map((surgery) => ({
                    id: surgery.id,
                    scheduled_at: surgery.scheduled_at,
                    updated_at: surgery.updated_at,
                    pdf_time: rows.find((row) => row.id === surgery.id)?.time ?? null,
                })),
            })
            if (!rows.length) {
                preview.close()
                toaster.create({ title: 'No hay cirugías para el día seleccionado.', type: 'info' })
                return
            }
            const [{ pdf }, { default: SurgeryDayReport }] = await Promise.all([
                import('@react-pdf/renderer'),
                import('../components/pdf/SurgeryDayReport'),
            ])
            if (preview.closed) return
            const blob = await pdf(
                <SurgeryDayReport date={surgeryDayLabel(day)} rows={rows} />,
            ).toBlob()
            showPdfPreview(preview, blob)
            setSelectedDay(null)
        } catch (error) {
            preview.close()
            toaster.create({
                title: 'No se pudo generar el listado de cirugías.',
                description: error.userMessage || 'Vuelve a intentarlo.',
                type: 'error',
            })
        } finally {
            setGenerating(false)
            setReportDay(null)
        }
    }

    return (
        <Stack gap="7">
            <ErrorNotice error={query.error} onRetry={query.refetch} />
            {query.isFetching && (
                <Flex align="center" gap="3" role="status">
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">
                        Cargando cirugías…
                    </Text>
                </Flex>
            )}
            <Box
                bg="white"
                rounded="xl"
                borderWidth="1px"
                borderColor="gray.200"
                p={{ base: '3', lg: '5' }}
                overflowX="auto"
                aria-label="Calendario de cirugías"
                aria-busy={query.isFetching}
                css={{
                    '--fc-border-color': '{colors.gray.200}',
                    '--fc-today-bg-color': '{colors.blue.50}',
                    '--fc-button-bg-color': '{colors.blue.950}',
                    '--fc-button-border-color': '{colors.blue.950}',
                    '--fc-button-hover-bg-color': '{colors.blue.800}',
                    '--fc-button-hover-border-color': '{colors.blue.800}',
                    '--fc-button-active-bg-color': '{colors.blue.900}',
                    '--fc-button-active-border-color': '{colors.blue.900}',
                    '& .fc': { fontFamily: 'inherit', fontSize: 'sm' },
                    '& .fc .fc-toolbar': {
                        flexWrap: 'wrap',
                        gap: '3',
                    },
                    '& .fc .fc-toolbar-title': {
                        fontSize: { base: 'lg', md: 'xl' },
                        fontWeight: 'semibold',
                    },
                    '& .fc .fc-button': { borderRadius: 'md', fontSize: 'sm' },
                    '& .fc .fc-col-header-cell': {
                        bg: 'gray.50',
                        color: 'gray.500',
                        fontSize: 'xs',
                    },
                    '& .fc .fc-event': { cursor: 'pointer', borderRadius: 'md' },
                    '& .fc .surgery-with-payment': {
                        '--fc-event-bg-color': '{colors.green.100}',
                        '--fc-event-border-color': '{colors.green.200}',
                        '--fc-event-text-color': '{colors.green.950}',
                    },
                    '& .fc .surgery-without-payment': {
                        '--fc-event-bg-color': '{colors.orange.100}',
                        '--fc-event-border-color': '{colors.orange.200}',
                        '--fc-event-text-color': '{colors.orange.950}',
                    },
                    '& .fc .fc-daygrid-day': {
                        cursor: 'pointer',
                        _hover: { bg: 'blue.100' },
                    },
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
                    editable={false}
                    eventDisplay="block"
                    eventInteractive
                    eventTimeFormat={eventTimeFormat}
                    datesSet={datesSet}
                    events={events}
                    eventContent={renderEvent}
                    eventClick={eventClick}
                    dateClick={dateClick}
                />
            </Box>
            <Popover.Root
                open={!!selectedDay}
                onOpenChange={({ open }) => {
                    if (!open) setSelectedDay(null)
                }}
                positioning={{
                    placement: 'bottom-start',
                    getAnchorRect: () => selectedDay?.element.getBoundingClientRect() ?? null,
                }}
            >
                <Portal>
                    <Popover.Positioner>
                        <Popover.Content width="300px">
                            <Popover.Arrow />
                            <Popover.Body>
                                <Stack gap="3">
                                    <Popover.Title fontWeight="semibold">
                                        {day ? surgeryDayLabel(day) : ''}
                                    </Popover.Title>
                                    <Button
                                        size="sm"
                                        bg="blue.900"
                                        color="white"
                                        loading={generating}
                                        loadingText="Generando listado…"
                                        onClick={generateReport}
                                    >
                                        Generar listado de cirugías
                                    </Button>
                                </Stack>
                            </Popover.Body>
                        </Popover.Content>
                    </Popover.Positioner>
                </Portal>
            </Popover.Root>
            {surgery && (
                <SurgeryForm key={surgery.id} surgery={surgery} onClose={() => setSurgery(null)} />
            )}
        </Stack>
    )
}
