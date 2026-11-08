import { Badge, Box, Button, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react'
import { lensOrdersApi } from '../../api/lensOrders'
import { useAuthInfiniteFetch } from '../../hooks/useAuthFetch'
import { ErrorNotice } from '../ui/Feedback'
import LensOrderCard from './LensOrderCard'

export default function LensOrderList({ stage, queryKey }) {
    const { status, label, color, icon: Icon } = stage
    const query = useAuthInfiniteFetch(
        queryKey,
        ({ queryKey: [, filters], pageParam, signal }) =>
            lensOrdersApi.getPage({ ...filters, page: pageParam }, signal),
        {
            initialPageParam: 1,
            getNextPageParam: (lastPage, _pages, lastPageParam) => (lastPage.next ? lastPageParam + 1 : undefined),
        },
    )
    const orders = new Map()
    query.data?.pages.forEach(({ results }) => {
        results.forEach((order) => orders.set(order.id, order))
    })
    const headingId = `lens-orders-${status}`

    return (
        <Stack as="section" aria-labelledby={headingId} minW="0" minH="0" gap="3" p="2" bg="gray.100" rounded="xl">
            <Flex align="center" gap="2" px="3" py="3" bg={color} color="white" rounded="lg" flexShrink="0">
                <Icon size={18} aria-hidden="true" />
                <Heading id={headingId} as="h2" size="sm">
                    {label}
                </Heading>
                {query.data && <Badge ml="auto">{query.data.pages[0].count}</Badge>}
            </Flex>
            <Box
                flex="1"
                minH="0"
                overflowY="auto"
                overscrollBehaviorY="contain"
                tabIndex={0}
                role="region"
                aria-label={`Lista de pedidos: ${label}`}
            >
                <Stack gap="3">
                    {query.isPending && (
                        <Flex align="center" gap="2" p="3" role="status">
                            <Spinner size="sm" />
                            <Text fontSize="sm">Cargando…</Text>
                        </Flex>
                    )}
                    {query.error && (
                        <ErrorNotice
                            error={query.error}
                            onRetry={query.isFetchNextPageError ? undefined : query.refetch}
                        />
                    )}
                    {query.data && orders.size === 0 && (
                        <Text fontSize="sm" color="gray.600" textAlign="center" py="5">
                            Sin pedidos en esta etapa
                        </Text>
                    )}
                    {[...orders.values()].map((order) => (
                        <LensOrderCard
                            key={order.id}
                            order={order}
                            disabled={query.isRefetchError || (query.isFetching && !query.isFetchingNextPage)}
                        />
                    ))}
                    {query.hasNextPage && (
                        <Button
                            size="sm"
                            variant="outline"
                            loading={query.isFetchingNextPage}
                            disabled={query.isFetching}
                            onClick={() => query.fetchNextPage()}
                        >
                            {query.isFetchNextPageError ? 'Reintentar carga' : 'Cargar más'}
                        </Button>
                    )}
                </Stack>
            </Box>
        </Stack>
    )
}
