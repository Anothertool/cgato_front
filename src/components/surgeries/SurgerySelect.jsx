import { useState } from 'react'
import { Box, Stack } from '@chakra-ui/react'
import Select from 'react-select'
import { surgeriesApi } from '../../api/surgeries'
import useAuthFetch from '../../hooks/useAuthFetch'
import useDebouncedValue from '../../hooks/useDebouncedValue'
import { formatDate, patientName } from '../../utils/format'
import { ErrorNotice } from '../ui/Feedback'

export function surgeryOptionLabel(surgery) {
    const name =
        surgery.patient_name || (surgery.patient ? patientName(surgery.patient) : surgery.id)
    return `${name} · ${surgery.scheduled_at ? formatDate(surgery.scheduled_at, true) : 'Sin fecha programada'}`
}

export default function SurgerySelect({ value, onChange, disabled }) {
    const [search, setSearch] = useState('')
    const term = useDebouncedValue(search.trim(), 300)
    const ready = term === search.trim()
    const params = { search: term, page_size: 10, ordering: '-created_at,-id' }
    const query = useAuthFetch(
        ['surgeries', 'options', params],
        ({ signal }) => surgeriesApi.getOptions(params, signal),
        { enabled: ready },
    )
    const options =
        ready && query.isSuccess && !query.isFetching
            ? query.data.results.slice(0, 10).map((surgery) => ({
                  value: surgery.id,
                  label: surgeryOptionLabel(surgery),
                  surgery,
              }))
            : []
    return (
        <Stack gap="2" w="full" minW="0">
            <Box
                w="full"
                minW="0"
                css={{
                    '& .surgery-select__control': {
                        borderColor: 'var(--chakra-colors-border)',
                        borderRadius: 'var(--chakra-radii-md)',
                        minHeight: '40px',
                    },
                    '& .surgery-select__menu': { zIndex: 2 },
                    '& .surgery-select__option--is-focused': {
                        backgroundColor: 'var(--chakra-colors-blue-50)',
                        color: 'var(--chakra-colors-gray-800)',
                    },
                    '& .surgery-select__option--is-selected': {
                        backgroundColor: 'var(--chakra-colors-blue-900)',
                        color: 'white',
                    },
                }}
            >
                <Select
                    inputId="cash-surgery"
                    aria-label="Cirugía"
                    classNamePrefix="surgery-select"
                    isClearable
                    isDisabled={disabled}
                    value={value ? { value: value.id, label: surgeryOptionLabel(value) } : null}
                    inputValue={search}
                    onInputChange={(next, { action }) => {
                        if (action === 'input-change') {
                            setSearch(next)
                        }
                    }}
                    onChange={(option) => {
                        onChange(option?.surgery || null)
                        setSearch('')
                    }}
                    options={options}
                    filterOption={null}
                    isLoading={!ready || query.isFetching}
                    placeholder="Selecciona una cirugía o busca por paciente…"
                    loadingMessage={() => 'Buscando cirugías…'}
                    noOptionsMessage={() =>
                        query.isError
                            ? 'No se pudieron buscar cirugías'
                            : !ready
                              ? 'Buscando cirugías…'
                              : 'No se encontraron cirugías'
                    }
                />
            </Box>
            <ErrorNotice error={query.error} onRetry={query.refetch} />
        </Stack>
    )
}
