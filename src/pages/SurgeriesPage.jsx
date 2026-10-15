import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { Box, Button, Flex, Input, Popover, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { CalendarDays, ListFilter, Plus, Search, X } from 'lucide-react'
import { surgeriesApi } from '../api/surgeries'
import useAuthFetch from '../hooks/useAuthFetch'
import useAuthMutate from '../hooks/useAuthMutate'
import useAuthDelete from '../hooks/useAuthDelete'
import { budgetStatusLabels, insurerLabels, patientName, surgeryTypeLabels } from '../utils/format'
import SurgeriesTable from '../components/surgeries/SurgeriesTable'
import SurgeryForm from '../components/surgeries/SurgeryForm'
import PatientPicker from '../components/patients/PatientPicker'
import FormField, { SelectInput } from '../components/ui/FormField'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ListFeedback } from '../components/ui/Feedback'

const emptyFilters = { budget_status: '', surgery_type: '', insurer: '', date: '' }

export default function SurgeriesPage() {
    const { headerActions } = useOutletContext()
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState(emptyFilters)
    const [patient, setPatient] = useState(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [form, setForm] = useState(null)
    const [action, setAction] = useState(null)
    const params = {
        page,
        ...(filters.budget_status ? { budget_status: filters.budget_status } : {}),
        ...(filters.surgery_type ? { surgery_type: filters.surgery_type } : {}),
        ...(filters.insurer ? { insurer: filters.insurer } : {}),
        ...(patient ? { patient_id: patient.id } : {}),
        ...(filters.date
            ? {
                  scheduled_at__gte: new Date(`${filters.date}T00:00:00`).toISOString(),
                  scheduled_at__lte: new Date(`${filters.date}T23:59:59.999`).toISOString(),
              }
            : {}),
    }
    const query = useAuthFetch(['surgeries', params], ({ signal }) =>
        surgeriesApi.getAll(params, signal),
    )
    const done = () => {
        setAction(null)
        setPage(1)
    }
    const remove = useAuthDelete({
        mutationFn: surgeriesApi.remove,
        invalidateKeys: [['surgeries'], ['patients']],
        successMessage: 'Cirugía eliminada',
        onSuccess: done,
    })
    const cancel = useAuthMutate({
        mutationFn: surgeriesApi.cancel,
        invalidateKeys: [['surgeries']],
        successMessage: 'Cirugía cancelada',
        onSuccess: done,
    })
    const complete = useAuthMutate({
        mutationFn: surgeriesApi.complete,
        invalidateKeys: [['surgeries']],
        successMessage: 'Cirugía marcada como realizada',
        onSuccess: done,
    })
    const reopen = useAuthMutate({
        mutationFn: surgeriesApi.reopen,
        invalidateKeys: [['surgeries']],
        successMessage: 'Cirugía reabierta',
        onSuccess: done,
    })
    const updateFilter = (event) => {
        setFilters((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
        setPage(1)
    }
    const requestAction = (surgery, type) => {
        remove.reset()
        cancel.reset()
        complete.reset()
        setAction({ surgery, type })
    }
    const activeMutation =
        action?.type === 'cancel' ? cancel : action?.type === 'complete' ? complete : remove
    const pending = remove.isPending || cancel.isPending || complete.isPending || reopen.isPending
    const hasFilters = patient || Object.values(filters).some(Boolean)
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
                        Nueva cirugía
                    </Button>,
                    headerActions,
                )}
            <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                <Flex px="5" py="5" align="center" justify="space-between" gap="4" wrap="wrap">
                    <Flex gap="2" align="center">
                        <CalendarDays size={18} />
                        <Text fontWeight="semibold" fontSize="sm">
                            Registro de cirugías
                        </Text>
                        <Text fontSize="xs" color="gray.400" ml="2">
                            Por fecha ascendente
                        </Text>
                    </Flex>
                    <Popover.Root
                        open={pickerOpen}
                        onOpenChange={({ open }) => setPickerOpen(open)}
                    >
                        <Popover.Trigger asChild>
                            <Button variant="outline" size="sm" maxW="full">
                                <Search size={15} />
                                <Text truncate>
                                    {patient ? patientName(patient) : 'Buscar paciente'}
                                </Text>
                            </Button>
                        </Popover.Trigger>
                        <Popover.Positioner>
                            <Popover.Content width={{ base: '300px', sm: '400px' }}>
                                <Popover.Arrow />
                                <Popover.Body>
                                    <PatientPicker
                                        value={patient}
                                        onChange={(value) => {
                                            setPatient(value)
                                            setPage(1)
                                            if (value) setPickerOpen(false)
                                        }}
                                    />
                                </Popover.Body>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Popover.Root>
                </Flex>
                <Box px="5" pb="5">
                    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4" alignItems="end">
                        {[
                            ['budget_status', 'Estado del presupuesto', budgetStatusLabels],
                            ['surgery_type', 'Tipo de cirugía', surgeryTypeLabels],
                            ['insurer', 'Aseguradora', insurerLabels],
                        ].map(([name, label, options]) => (
                            <FormField key={name} label={label}>
                                <SelectInput
                                    name={name}
                                    value={filters[name]}
                                    onChange={updateFilter}
                                >
                                    <option value="">Todos</option>
                                    {Object.entries(options).map(([key, text]) => (
                                        <option key={key} value={key}>
                                            {text}
                                        </option>
                                    ))}
                                </SelectInput>
                            </FormField>
                        ))}
                        <FormField label="Fecha de cirugía">
                            <Input
                                type="date"
                                name="date"
                                value={filters.date}
                                onChange={updateFilter}
                                size="sm"
                            />
                        </FormField>
                        <Button
                            variant="ghost"
                            color="gray.500"
                            size="sm"
                            disabled={!hasFilters}
                            onClick={() => {
                                setFilters(emptyFilters)
                                setPatient(null)
                                setPage(1)
                            }}
                        >
                            {hasFilters ? <X size={15} /> : <ListFilter size={15} />}Limpiar filtros
                        </Button>
                    </SimpleGrid>
                </Box>
                <ListFeedback
                    loading={query.isPending}
                    error={query.error}
                    empty={!query.data?.results?.length}
                    onRetry={query.refetch}
                    label="cirugías"
                />
                {!query.error && !!query.data?.results?.length && (
                    <SurgeriesTable
                        surgeries={query.data.results}
                        onEdit={setForm}
                        onDelete={(surgery) => requestAction(surgery, 'delete')}
                        onCancel={(surgery) => requestAction(surgery, 'cancel')}
                        onComplete={(surgery) => requestAction(surgery, 'complete')}
                        onReopen={(surgery) => reopen.mutate(surgery.id)}
                        pending={pending}
                    />
                )}
                <Pagination
                    data={query.data}
                    page={page}
                    onChange={setPage}
                    loading={query.isFetching}
                />
            </Box>
            {form && <SurgeryForm surgery={form.id ? form : null} onClose={() => setForm(null)} />}
            {action && (
                <ConfirmDialog
                    title={
                        action.type === 'complete'
                            ? 'Marcar como realizada'
                            : action.type === 'cancel'
                              ? 'Cancelar cirugía'
                              : 'Eliminar cirugía'
                    }
                    description={
                        action.type === 'complete'
                            ? `La cirugía de ${patientName(action.surgery.patient)} pasará a estado «Realizada».`
                            : action.type === 'cancel'
                              ? `La cirugía de ${patientName(action.surgery.patient)} pasará a estado «Cancelada» y seguirá en el registro.`
                              : `La cirugía de ${patientName(action.surgery.patient)} se retirará del listado. El servidor conserva su trazabilidad mediante borrado lógico.`
                    }
                    confirmLabel={
                        action.type === 'complete'
                            ? 'Marcar como realizada'
                            : action.type === 'cancel'
                              ? 'Cancelar cirugía'
                              : 'Eliminar cirugía'
                    }
                    pending={activeMutation.isPending}
                    error={activeMutation.error}
                    onClose={() => setAction(null)}
                    onConfirm={() => activeMutation.mutate(action.surgery.id)}
                />
            )}
        </Stack>
    )
}
