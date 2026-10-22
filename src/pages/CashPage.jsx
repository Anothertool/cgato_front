import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { Box, Button, Flex, Input, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react'
import { Banknote, CalendarDays, Plus, Search, Wallet } from 'lucide-react'
import { cashApi } from '../api/cash'
import useAuthFetch from '../hooks/useAuthFetch'
import useAuthDelete from '../hooks/useAuthDelete'
import useDebouncedValue from '../hooks/useDebouncedValue'
import CashForm from '../components/cash/CashForm'
import CashEntriesTable from '../components/cash/CashEntriesTable'
import SurgeryForm from '../components/surgeries/SurgeryForm'
import { formatMoney, todayDate } from '../components/cash/utils'
import { ErrorNotice, ListFeedback } from '../components/ui/Feedback'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { formatDate } from '../utils/format'

export default function CashPage() {
    const { headerActions } = useOutletContext()
    const today = todayDate()
    const [date, setDate] = useState(todayDate)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [form, setForm] = useState(null)
    const [surgery, setSurgery] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const term = useDebouncedValue(search.trim())
    const params = { page, ...(date ? { date } : {}), ...(term ? { search: term } : {}) }
    const query = useAuthFetch(['cash', 'entries', params], ({ signal }) =>
        cashApi.getAll(params, signal),
    )
    const summaryDate = date || today
    const summaryDateLabel = formatDate(`${summaryDate}T00:00:00`)
    const summary = useAuthFetch(['cash', 'summary', { date: summaryDate }], ({ signal }) =>
        cashApi.getSummary({ date: summaryDate }, signal),
    )
    const remove = useAuthDelete({
        mutationFn: cashApi.remove,
        invalidateKeys: [['cash'], ['surgeries']],
        successMessage: 'Cobro eliminado',
        onSuccess: () => {
            setDeleting(null)
            setPage(1)
        },
    })
    const changeDate = (next) => {
        setDate(next)
        setPage(1)
    }
    return (
        <Stack gap="7">
            {headerActions &&
                createPortal(
                    <Button
                        bg="blue.950"
                        color="white"
                        size={{ base: 'sm', sm: 'md' }}
                        px={{ base: '3', sm: '5' }}
                        onClick={() => setForm({})}
                    >
                        <Plus size={17} />
                        Nuevo cobro
                    </Button>,
                    headerActions,
                )}
            <Text color="gray.500" fontSize="sm">
                Registro de cobros
            </Text>
            <ErrorNotice error={summary.error} onRetry={summary.refetch} />
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap="5">
                {[
                    [
                        'total_today',
                        summaryDate === today ? 'Total hoy' : 'Total del día',
                        Wallet,
                        `Cobros del ${summaryDateLabel}`,
                    ],
                    [
                        'total_week',
                        'Total semana',
                        CalendarDays,
                        `Semana del ${summaryDateLabel} · De lunes a domingo`,
                    ],
                    [
                        'cash_today',
                        summaryDate === today ? 'Efectivo hoy' : 'Efectivo del día',
                        Banknote,
                        `Cobros en efectivo del ${summaryDateLabel}`,
                    ],
                ].map(([key, label, Icon, description]) => (
                    <Box
                        key={key}
                        bg="white"
                        borderWidth="1px"
                        borderColor="gray.200"
                        rounded="xl"
                        p="5"
                    >
                        <Flex justify="space-between" align="center" gap="3" mb="4">
                            <Text color="gray.500" fontSize="sm" fontWeight="medium">
                                {label}
                            </Text>
                            <Box bg="blue.50" color="blue.800" rounded="lg" p="2">
                                <Icon size={19} />
                            </Box>
                        </Flex>
                        <Skeleton loading={summary.isPending} minH="9">
                            <Text
                                fontSize="2xl"
                                color="blue.950"
                                fontWeight="bold"
                                aria-live="polite"
                            >
                                {formatMoney(summary.isError ? null : summary.data?.[key])}
                            </Text>
                        </Skeleton>
                        <Text color="gray.400" fontSize="xs" mt="2">
                            {description}
                        </Text>
                    </Box>
                ))}
            </SimpleGrid>
            <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                <Flex px="5" py="5" align="center" justify="space-between" gap="4" wrap="wrap">
                    <Text fontWeight="semibold" fontSize="sm">
                        Movimientos
                    </Text>
                    <Flex align="center" gap="2" wrap="wrap">
                        <Flex align="center" gap="2" w={{ base: 'full', sm: '280px' }}>
                            <Box color="gray.400">
                                <Search size={17} />
                            </Box>
                            <Input
                                type="search"
                                aria-label="Buscar cobros"
                                placeholder="Buscar cobros…"
                                size="sm"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value)
                                    setPage(1)
                                }}
                            />
                        </Flex>
                        <Button
                            size="sm"
                            variant={date === today ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => changeDate(today)}
                        >
                            Hoy
                        </Button>
                        <Button
                            size="sm"
                            variant={!date ? 'solid' : 'outline'}
                            colorPalette="blue"
                            onClick={() => changeDate('')}
                        >
                            Todos
                        </Button>
                        <Input
                            type="date"
                            aria-label="Fecha de los movimientos"
                            value={date}
                            onChange={(event) => changeDate(event.target.value)}
                            size="sm"
                            width="auto"
                        />
                    </Flex>
                </Flex>
                <ListFeedback
                    loading={query.isPending}
                    error={query.error}
                    empty={!query.data?.results?.length}
                    onRetry={query.refetch}
                    label="cobros"
                />
                {!query.error && !!query.data?.results?.length && (
                    <CashEntriesTable
                        entries={query.data.results}
                        onOpenSurgery={setSurgery}
                        onEdit={setForm}
                        onDelete={(entry) => {
                            remove.reset()
                            setDeleting(entry)
                        }}
                    />
                )}
                <Pagination
                    data={query.data}
                    page={page}
                    onChange={setPage}
                    loading={query.isFetching}
                />
            </Box>
            {form && <CashForm entry={form.id ? form : null} onClose={() => setForm(null)} />}
            {surgery && (
                <SurgeryForm key={surgery.id} surgery={surgery} onClose={() => setSurgery(null)} />
            )}
            {deleting && (
                <ConfirmDialog
                    title="Eliminar cobro"
                    description={`Se eliminará el cobro de ${formatMoney(deleting.amount)}. Esta acción no se puede deshacer.`}
                    pending={remove.isPending}
                    error={remove.error}
                    onClose={() => setDeleting(null)}
                    onConfirm={() => remove.mutate(deleting.id)}
                />
            )}
        </Stack>
    )
}
