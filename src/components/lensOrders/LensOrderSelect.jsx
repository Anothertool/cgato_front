import { Stack } from '@chakra-ui/react'
import Select, { createFilter } from 'react-select'
import { lensOrderOptionsQueryKey, lensOrdersApi } from '../../api/lensOrders'
import useAuthFetch from '../../hooks/useAuthFetch'
import { patientName } from '../../utils/format'
import { ErrorNotice } from '../ui/Feedback'

const filterByPatient = createFilter({ stringify: ({ data }) => data.patientName })
const eyes = { LEFT: 'OI', RIGHT: 'OD', BOTH: 'Ambos' }
const orderDateFormat = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

function toOption(order) {
    const name = patientName(order.patient)
    const date = new Date(order.created_at)
    const dateLabel = order.created_at && !Number.isNaN(date.getTime()) ? orderDateFormat.format(date) : ''
    return {
        value: order.id,
        patientName: name,
        label: [name, eyes[order.eye], order.laboratory, order.lens_type_label || order.lens_type, dateLabel]
            .filter(Boolean)
            .join(' · '),
    }
}

export default function LensOrderSelect({ value, onChange, disabled }) {
    const query = useAuthFetch(lensOrderOptionsQueryKey, ({ signal }) => lensOrdersApi.getPage({ page: 1 }, signal))
    const options = (query.data?.results ?? []).map(toOption)
    const listed = options.find((option) => option.value === value)
    const detail = useAuthFetch(
        [...lensOrderOptionsQueryKey, value],
        ({ signal }) => lensOrdersApi.getById(value, signal),
        { enabled: Boolean(value && !listed && !query.isPending) },
    )
    const selected = value && (listed || (detail.data ? toOption(detail.data) : { value, label: `Pedido · ${value}` }))

    return (
        <Stack
            w="full"
            minW="0"
            gap="2"
            css={{
                '& .order-select__control': {
                    borderColor: 'var(--chakra-colors-border)',
                    borderRadius: 'var(--chakra-radii-md)',
                    minHeight: '40px',
                },
                '& .order-select__menu': { zIndex: 2 },
            }}
        >
            <Select
                aria-label="Pedido"
                aria-required="true"
                classNamePrefix="order-select"
                isClearable
                isDisabled={disabled}
                isLoading={query.isPending}
                value={selected || null}
                onChange={(option) => onChange(option?.value ?? null)}
                options={options}
                filterOption={filterByPatient}
                placeholder="Selecciona un pedido o busca por paciente…"
                loadingMessage={() => 'Cargando pedidos…'}
                noOptionsMessage={() =>
                    query.isError ? 'No se pudieron cargar los pedidos' : 'No se encontraron pedidos'
                }
            />
            <ErrorNotice error={query.error} onRetry={query.refetch} />
        </Stack>
    )
}
