import { useState } from 'react'
import { Box, Stack } from '@chakra-ui/react'
import Select from 'react-select'
import { patientsApi } from '../../api/patients'
import useAuthFetch from '../../hooks/useAuthFetch'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { patientName } from '../../utils/format'
import { ErrorNotice } from '../ui/Feedback'
import Pagination from '../ui/Pagination'

export default function PatientSelect({ value, onChange, onCreate, disabled }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [menuOpen, setMenuOpen] = useState(false)
    const term = useDebouncedValue(search.trim(), 3000)
    const ready = search.trim().length >= 3 && search.trim() === term
    const query = useAuthFetch(
        ['patients', 'select', { search: term, page }],
        ({ signal }) => patientsApi.getAll({ search: term, page }, signal),
        { enabled: ready },
    )
    const options =
        ready && query.isSuccess && !query.isFetching
            ? query.data.results.map((patient) => ({
                  value: patient.id,
                  label: patientName(patient),
                  patient,
              }))
            : []
    if (ready && query.isSuccess && !query.isFetching && !options.length && onCreate) {
        options.push({ value: 'create-patient', label: 'Crear paciente', create: true })
    }
    return (
        <Stack gap="2">
            <Box
                css={{
                    '& .patient-select__control': {
                        borderColor: 'var(--chakra-colors-border)',
                        borderRadius: 'var(--chakra-radii-md)',
                        minHeight: '40px',
                    },
                    '& .patient-select__menu': { zIndex: 2 },
                    '& .patient-select__option--is-focused': {
                        backgroundColor: 'var(--chakra-colors-blue-50)',
                        color: 'var(--chakra-colors-gray-800)',
                    },
                    '& .patient-select__option--is-selected': {
                        backgroundColor: 'var(--chakra-colors-blue-900)',
                        color: 'white',
                    },
                }}
            >
                <Select
                    inputId="surgery-patient"
                    aria-label="Paciente"
                    classNamePrefix="patient-select"
                    isClearable
                    isDisabled={disabled}
                    value={value ? { value: value.id, label: patientName(value) } : null}
                    inputValue={search}
                    onInputChange={(next, { action }) => {
                        if (action === 'input-change') {
                            setSearch(next)
                            setPage(1)
                            setMenuOpen(true)
                        }
                    }}
                    onChange={(option) => {
                        if (option?.create) onCreate(search.trim())
                        else onChange(option?.patient || null)
                        setSearch('')
                        setPage(1)
                    }}
                    options={options}
                    filterOption={null}
                    menuIsOpen={menuOpen && search.trim().length >= 3}
                    onMenuOpen={() => setMenuOpen(true)}
                    onMenuClose={() => setMenuOpen(false)}
                    isLoading={search.trim().length >= 3 && (!ready || query.isFetching)}
                    placeholder="Escribe al menos tres letras para buscar…"
                    loadingMessage={() => 'Buscando pacientes…'}
                    noOptionsMessage={() =>
                        query.isError
                            ? 'No se pudo buscar pacientes'
                            : !ready
                              ? 'Esperando para buscar…'
                              : 'No se encontraron pacientes'
                    }
                />
            </Box>
            {ready && <ErrorNotice error={query.error} />}
            {ready && query.data && (
                <Pagination
                    data={query.data}
                    page={page}
                    onChange={setPage}
                    loading={query.isFetching}
                />
            )}
        </Stack>
    )
}
