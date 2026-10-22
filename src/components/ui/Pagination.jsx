import { Button, Flex, IconButton, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function Pagination({ data, page, onChange, loading }) {
    const lastPage =
        data?.next && data?.results?.length ? Math.max(page, Math.ceil(data.count / data.results.length)) : page
    return (
        <Flex px="5" py="4" borderTopWidth="1px" align="center" justify="space-between" gap="3" wrap="wrap">
            <Text fontSize="sm" color="gray.500">
                {data?.count ?? 0} registros · Página {page}
            </Text>
            <Flex gap="2" wrap="wrap">
                <IconButton
                    aria-label="Primera página"
                    title="Primera página"
                    variant="outline"
                    size="sm"
                    disabled={loading || !data?.previous}
                    onClick={() => onChange(1)}
                >
                    <ChevronsLeft size={15} />
                </IconButton>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || !data?.previous}
                    onClick={() => onChange(page - 1)}
                >
                    <ChevronLeft size={15} />
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || !data?.next}
                    onClick={() => onChange(page + 1)}
                >
                    Siguiente
                    <ChevronRight size={15} />
                </Button>
                <IconButton
                    aria-label="Última página"
                    title="Última página"
                    variant="outline"
                    size="sm"
                    disabled={loading || !data?.next || !Number.isFinite(lastPage)}
                    onClick={() => onChange(lastPage)}
                >
                    <ChevronsRight size={15} />
                </IconButton>
            </Flex>
        </Flex>
    )
}
