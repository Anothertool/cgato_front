import { Alert, Box, Button, Center, Stack, Text, Spinner } from '@chakra-ui/react'
import { Inbox } from 'lucide-react'

export function ErrorNotice({ error, onRetry }) {
    if (!error) return null
    return (
        <Alert.Root status="error" borderRadius="lg">
            <Alert.Indicator />
            <Alert.Content>
                <Alert.Title>
                    {[401, 403].includes(error.response?.status)
                        ? 'Sesión o permisos requeridos'
                        : 'No se pudo completar la solicitud'}
                </Alert.Title>
                <Alert.Description>
                    {error.userMessage || 'Se ha producido un error inesperado.'}
                </Alert.Description>
            </Alert.Content>
            {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </Alert.Root>
    )
}

export function ListFeedback({ loading, error, empty, onRetry, label }) {
    if (loading)
        return (
            <Center py="20" gap="3" role="status">
                <Spinner size="sm" />
                <Text color="gray.500">Cargando…</Text>
            </Center>
        )
    if (error)
        return (
            <Box p="6">
                <ErrorNotice error={error} onRetry={onRetry} />
            </Box>
        )
    if (empty)
        return (
            <Center py="20">
                <Stack align="center" gap="3">
                    <Box color="gray.400">
                        <Inbox size={30} />
                    </Box>
                    <Text fontWeight="medium">No hay {label}</Text>
                    <Text fontSize="sm" color="gray.500">
                        Añade un registro o ajusta los filtros de búsqueda.
                    </Text>
                </Stack>
            </Center>
        )
    return null
}
