import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import Select, { components } from 'react-select'
import { patientsApi } from '../../api/patients'
import useAuthFetch from '../../hooks/useAuthFetch'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { patientName } from '../../utils/format'
import { ErrorNotice } from '../ui/Feedback'
import Pagination from '../ui/Pagination'

function PatientMenu({ children, ...props }) {
    return (
        <components.Menu {...props}>
            {children}
            {props.selectProps.pagination && <Pagination {...props.selectProps.pagination} />}
        </components.Menu>
    )
}

export default function PatientSelect({ value, onChange, onCreate, disabled, required }) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [menuOpen, setMenuOpen] = useState(false)
    const trimmedSearch = search.trim()
    const debouncedSearch = useDebouncedValue(trimmedSearch, 300)
    const term = trimmedSearch ? debouncedSearch : ''
    const ready = !trimmedSearch || (trimmedSearch.length >= 3 && trimmedSearch === term)
    const params = { search: term, page, page_size: 10, ordering: '-created_at,-id' }
    const query = useAuthFetch(['patients', 'select', params], ({ signal }) => patientsApi.getAll(params, signal), {
        enabled: menuOpen && ready && !disabled,
    })
    const options =
        ready && query.isSuccess && !query.isFetching
            ? query.data.results.map((patient) => ({
                  value: patient.id,
                  label: patientName(patient),
                  patient,
              }))
            : []
    if (ready && term && query.isSuccess && !query.isFetching && !options.length && onCreate) {
        options.push({ value: 'create-patient', label: 'Crear paciente', create: true })
    }
    return (
        <Box
            css={{
                '& .patient-select__control': {
                    borderColor: 'var(--chakra-colors-border)',
                    borderRadius: 'var(--chakra-radii-md)',
                    minHeight: '40px',
                },
                '& .patient-select__menu-portal': { zIndex: 'tooltip', pointerEvents: 'auto' },
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
                aria-required={required}
                classNamePrefix="patient-select"
                components={{ Menu: PatientMenu }}
                pagination={
                    ready && query.data
                        ? { data: query.data, page, onChange: setPage, loading: query.isFetching }
                        : null
                }
                menuPosition="fixed"
                menuPlacement="auto"
                menuShouldScrollIntoView={false}
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
                menuIsOpen={menuOpen}
                onMenuOpen={() => {
                    setPage(1)
                    setMenuOpen(true)
                }}
                onMenuClose={() => setMenuOpen(false)}
                isLoading={menuOpen && (!trimmedSearch || trimmedSearch.length >= 3) && (!ready || query.isFetching)}
                placeholder="Selecciona un paciente o escribe al menos tres letras…"
                loadingMessage={() => 'Buscando pacientes…'}
                noOptionsMessage={() =>
                    trimmedSearch && trimmedSearch.length < 3 ? (
                        'Escribe al menos tres letras para buscar…'
                    ) : query.isError ? (
                        <ErrorNotice error={query.error} />
                    ) : !ready ? (
                        'Esperando para buscar…'
                    ) : (
                        'No se encontraron pacientes'
                    )
                }
            />
        </Box>
    )
}
