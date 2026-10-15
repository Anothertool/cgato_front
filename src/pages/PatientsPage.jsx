import { useState } from 'react'
import { Box, Button, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { Plus, Search, Users } from 'lucide-react'
import { patientsApi } from '../api/patients'
import useAuthFetch from '../hooks/useAuthFetch'
import useAuthDelete from '../hooks/useAuthDelete'
import useDebouncedValue from '../hooks/useDebouncedValue'
import PatientsTable from '../components/patients/PatientsTable'
import PatientForm from '../components/patients/PatientForm'
import Pagination from '../components/ui/Pagination'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { ListFeedback } from '../components/ui/Feedback'
import { patientName } from '../utils/format'

export default function PatientsPage() {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [form, setForm] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const term = useDebouncedValue(search)
    const query = useAuthFetch(['patients', { search: term, page }], ({ signal }) =>
        patientsApi.getAll({ search: term, page }, signal),
    )
    const remove = useAuthDelete({
        mutationFn: patientsApi.remove,
        invalidateKeys: [['patients']],
        successMessage: 'Paciente eliminado',
        onSuccess: () => {
            setDeleting(null)
            setPage(1)
        },
    })
    const requestDelete = (patient) => {
        remove.reset()
        setDeleting(patient)
    }
    return (
        <Stack gap="7">
            <Flex
                justify="space-between"
                align={{ base: 'start', sm: 'center' }}
                gap="4"
                wrap="wrap"
            >
                <Box>
                    <Text
                        color="blue.700"
                        fontSize="xs"
                        fontWeight="semibold"
                        mb="2"
                        letterSpacing="1px"
                    >
                        DIRECTORIO CLÍNICO
                    </Text>
                    <Heading size="3xl" letterSpacing="-1px">
                        Pacientes
                    </Heading>
                    <Text mt="2" color="gray.500" fontSize="sm">
                        Toda la información de tus pacientes, en un solo lugar.
                    </Text>
                </Box>
                <Button bg="blue.950" color="white" px="5" onClick={() => setForm({})}>
                    <Plus size={17} />
                    Nuevo paciente
                </Button>
            </Flex>
            <Box bg="white" rounded="xl" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                <Flex px="5" py="5" align="center" justify="space-between" gap="4" wrap="wrap">
                    <Flex gap="2" align="center">
                        <Users size={18} />
                        <Text fontWeight="semibold" fontSize="sm">
                            Directorio de pacientes
                        </Text>
                    </Flex>
                    <Flex align="center" gap="2" w={{ base: 'full', sm: '320px' }}>
                        <Box color="gray.400">
                            <Search size={17} />
                        </Box>
                        <Input
                            aria-label="Buscar pacientes"
                            placeholder="Buscar por nombre o referencia…"
                            size="sm"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value)
                                setPage(1)
                            }}
                        />
                    </Flex>
                </Flex>
                <ListFeedback
                    loading={query.isPending}
                    error={query.error}
                    empty={!query.data?.results?.length}
                    onRetry={query.refetch}
                    label="pacientes"
                />
                {!query.error && !!query.data?.results?.length && (
                    <PatientsTable
                        patients={query.data.results}
                        onEdit={setForm}
                        onDelete={requestDelete}
                    />
                )}
                <Pagination
                    data={query.data}
                    page={page}
                    onChange={setPage}
                    loading={query.isFetching}
                />
            </Box>
            {form && <PatientForm patient={form.id ? form : null} onClose={() => setForm(null)} />}
            {deleting && (
                <ConfirmDialog
                    title="Eliminar paciente"
                    description={`Se eliminará a ${patientName(deleting)}. Esta acción no se puede deshacer. Los pacientes con cirugías asociadas están protegidos por el servidor.`}
                    pending={remove.isPending}
                    error={remove.error}
                    onClose={() => setDeleting(null)}
                    onConfirm={() => remove.mutate(deleting.id)}
                />
            )}
        </Stack>
    )
}
