import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react'
import { surgeriesApi } from '../api/surgeries'
import useAuthFetch from '../hooks/useAuthFetch'
import { ErrorNotice } from '../components/ui/Feedback'

export default function SurgeryQuotePage() {
    const { id } = useParams()
    const [document, setDocument] = useState(null)
    const [pdfError, setPdfError] = useState(null)
    const [attempt, setAttempt] = useState(0)
    const downloaded = useRef(null)
    const downloadLink = useRef(null)
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
                setDocument({ url, filename: `presupuesto-${id}.pdf` })
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

    useEffect(() => {
        if (document && downloaded.current !== id) {
            downloaded.current = id
            downloadLink.current?.click()
        }
    }, [document, id])

    return (
        <Stack minH="100vh" bg="gray.50" color="gray.800" p={{ base: '4', md: '6' }} gap="4">
            <Flex align="center" justify="space-between" gap="3" wrap="wrap">
                <Heading size="lg">Presupuesto de cirugía</Heading>
                {document && (
                    <Button asChild bg="blue.950" color="white">
                        <a ref={downloadLink} href={document.url} download={document.filename}>
                            Descargar PDF
                        </a>
                    </Button>
                )}
            </Flex>
            <ErrorNotice error={query.error} onRetry={query.refetch} />
            <ErrorNotice error={pdfError} onRetry={() => setAttempt((current) => current + 1)} />
            {!query.error && !pdfError && !document && (
                <Flex align="center" justify="center" gap="3" py="20" role="status">
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
                    flex="1"
                    minH="80vh"
                    borderWidth="1px"
                    rounded="lg"
                />
            )}
        </Stack>
    )
}
