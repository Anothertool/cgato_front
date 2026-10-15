import { Button, Flex, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ data, page, onChange, loading }) {
    return (
        <Flex
            px="5"
            py="4"
            borderTopWidth="1px"
            align="center"
            justify="space-between"
            gap="3"
            wrap="wrap"
        >
            <Text fontSize="sm" color="gray.500">
                {data?.count ?? 0} registros · Página {page}
            </Text>
            <Flex gap="2">
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
            </Flex>
        </Flex>
    )
}
