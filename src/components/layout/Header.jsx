import { Box, Flex, Text } from '@chakra-ui/react'
import { ChevronRight, Stethoscope } from 'lucide-react'

export default function Header({ title }) {
    return (
        <Flex
            as="header"
            minH="76px"
            px={{ base: '5', lg: '10' }}
            align="center"
            justify="space-between"
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            gap="4"
        >
            <Flex gap="3" align="center" fontSize="sm">
                <Text color="gray.400">Clínica</Text>
                <Box color="gray.300">
                    <ChevronRight size={14} />
                </Box>
                <Text fontWeight="medium">{title}</Text>
            </Flex>
            <Flex gap="2" align="center" color="gray.500" fontSize="xs">
                <Stethoscope size={16} />
                <Text display={{ base: 'none', sm: 'block' }}>CRM oftalmológico</Text>
            </Flex>
        </Flex>
    )
}
