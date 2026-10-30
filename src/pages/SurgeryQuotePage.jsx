import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { surgeriesApi } from '../api/surgeries'
import useAuthFetch from '../hooks/useAuthFetch'
import { ErrorNotice } from '../components/ui/Feedback'

export default function SurgeryQuotePage() {
    const { id } = useParams()
    const [document, setDocument] = useState(null)
    const [pdfError, setPdfError] = useState(null)
    const [attempt, setAttempt] = useState(0)
    const query = useAuthFetch(['surgeries', 'detail', id], ({ signal }) => surgeriesApi.getById(id, signal), {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    useEffect(() => {
        if (!query.data) return
        let active = true
        let url
        setDocument(null)
        setPdfError(null)
        const generate = async () => {
            try {
                const [{ pdf }, { default: SurgeryQuote }] = await Promise.all([
                    import('@react-pdf/renderer'),
                    import('../components/pdf/SurgeryQuote'),
                ])
                if (!active) return
                const blob = await pdf(<SurgeryQuote surgery={query.data} />).toBlob()
                if (!active) return
                url = URL.createObjectURL(blob)
                setDocument({ url })
            } catch (error) {
                if (active) setPdfError(error)
            }
        }
        generate()
        return () => {
            active = false
            if (url) URL.revokeObjectURL(url)
        }
    }, [query.data, id, attempt])

    return (
        <Box h="100dvh" bg="gray.50" color="gray.800">
            <ErrorNotice error={query.error} onRetry={query.refetch} />
            <ErrorNotice error={pdfError} onRetry={() => setAttempt((current) => current + 1)} />
            {!query.error && !pdfError && !document && (
                <Flex align="center" justify="center" gap="3" h="full" role="status">
                    <Spinner size="sm" />
                    <Text>{query.isPending ? 'Cargando cirugía…' : 'Generando presupuesto…'}</Text>
                </Flex>
            )}
            {!query.error && document && (
                <Box
                    as="iframe"
                    title="PDF del presupuesto de cirugía"
                    src={document.url}
                    w="full"
                    h="full"
                    display="block"
                    border="0"
                />
            )}
        </Box>
    )
}
