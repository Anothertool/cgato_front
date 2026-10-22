import { Box, Table } from '@chakra-ui/react'
import { ListFeedback } from '../../ui/Feedback'
import Pagination from '../../ui/Pagination'

export default function CommonTable({ children, size = 'md', label, pagination }) {
    const { data, page, onChange, loading, error, onRetry } = pagination
    return (
        <>
            <ListFeedback
                loading={loading && !data}
                error={error}
                empty={!data?.results?.length}
                onRetry={onRetry}
                label={label}
            />
            {!error && !!data?.results?.length && (
                <Box overflowX="auto">
                    <Table.Root size={size}>{children}</Table.Root>
                </Box>
            )}
            <Pagination data={data} page={page} onChange={onChange} loading={loading} />
        </>
    )
}
