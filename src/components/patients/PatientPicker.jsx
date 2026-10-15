import { useState } from 'react'
import { Box, Button, Flex, Input, Stack, Text } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import useAuthFetch from '../../hooks/useAuthFetch'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { patientsApi } from '../../api/patients'
import { patientName } from '../../utils/format'
import Pagination from '../ui/Pagination'
import { ListFeedback } from '../ui/Feedback'

export default function PatientPicker({ value, onChange }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const term = useDebouncedValue(search)
    const query = useAuthFetch(
        ['patients', 'picker', { search: term, page }],
        ({ signal }) => patientsApi.getAll({ search: term, page }, signal),
        { enabled: !value },
    )
    if (value)
        return (
            <Flex align="center" justify="space-between" p="3" bg="blue.50" rounded="lg">
                <Box>
                    <Text fontWeight="medium">{patientName(value)}</Text>
                    <Text fontSize="xs" color="gray.500">
                        {value.clinical_reference || 'Sin referencia clínica'}
                    </Text>
                </Box>
                <Button
                    aria-label="Cambiar paciente"
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(null)}
                >
                    <X size={16} />
                </Button>
            </Flex>
        )
    return (
        <Stack gap="2">
            <Flex gap="2" align="center">
                <Search size={17} />
                <Input
                    aria-label="Buscar paciente por nombre o referencia"
                    placeholder="Buscar por nombre o referencia…"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                    }}
                />
            </Flex>
            <Box borderWidth="1px" rounded="lg" overflow="hidden">
                <ListFeedback
                    loading={query.isPending}
                    error={query.error}
                    empty={!query.data?.results?.length}
                    onRetry={query.refetch}
                    label="pacientes disponibles"
                />
                {!query.error && (
                    <Stack gap="0" maxH="220px" overflowY="auto">
                        {query.data?.results?.map((patient) => (
                            <Button
                                key={patient.id}
                                variant="ghost"
                                justifyContent="space-between"
                                rounded="0"
                                height="auto"
                                py="3"
                                onClick={() => onChange(patient)}
                            >
                                <Text truncate>{patientName(patient)}</Text>
                                <Text color="gray.500" fontSize="xs">
                                    {patient.clinical_reference || '—'}
                                </Text>
                            </Button>
                        ))}
                    </Stack>
                )}
                {query.data && (
                    <Pagination
                        data={query.data}
                        page={page}
                        onChange={setPage}
                        loading={query.isFetching}
                    />
                )}
            </Box>
        </Stack>
    )
}
