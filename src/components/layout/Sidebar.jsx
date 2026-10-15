import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { NavLink } from 'react-router-dom'
import { Cat, ClipboardList, Users, ShieldCheck } from 'lucide-react'

export default function Sidebar() {
    return (
        <Flex
            as="aside"
            w={{ base: 'full', md: '232px' }}
            position={{ base: 'static', md: 'fixed' }}
            insetY="0"
            left="0"
            bg="white"
            borderRightWidth="1px"
            borderColor="gray.200"
            direction="column"
            zIndex="10"
        >
            <Flex px="7" py="7" align="center" gap="3">
                <Flex
                    align="center"
                    justify="center"
                    bg="blue.950"
                    color="white"
                    rounded="xl"
                    boxSize="40px"
                >
                    <Text fontSize="xl" fontWeight="bold">
                        C
                    </Text>
                    <Box ml="-1">
                        <Cat size={22} strokeWidth={1.7} />
                    </Box>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="-1px" color="blue.950">
                    CGato
                    <Text as="span" color="blue.500">
                        .
                    </Text>
                </Text>
            </Flex>
            <Box px="4" py={{ base: '0', md: '6' }} pb="4">
                <Text
                    display={{ base: 'none', md: 'block' }}
                    px="3"
                    mb="3"
                    fontSize="10px"
                    fontWeight="bold"
                    letterSpacing="1.8px"
                    color="gray.400"
                >
                    GESTIÓN CLÍNICA
                </Text>
                <Stack direction={{ base: 'row', md: 'column' }} gap="2">
                    {[
                        { to: '/surgeries', label: 'Cirugías', icon: ClipboardList },
                        { to: '/patients', label: 'Pacientes', icon: Users },
                    ].map(({ to, label, icon: Icon }) => (
                        <Box key={to} asChild>
                            <NavLink to={to}>
                                {({ isActive }) => (
                                    <Flex
                                        align="center"
                                        gap="3"
                                        px="4"
                                        py="3"
                                        rounded="lg"
                                        bg={isActive ? 'blue.50' : 'transparent'}
                                        color={isActive ? 'blue.900' : 'gray.500'}
                                        fontWeight={isActive ? 'semibold' : 'medium'}
                                        fontSize="sm"
                                        _hover={{ bg: 'gray.50' }}
                                    >
                                        <Icon size={19} />
                                        {label}
                                        {isActive && (
                                            <Box
                                                ml="auto"
                                                boxSize="5px"
                                                rounded="full"
                                                bg="blue.700"
                                            />
                                        )}
                                    </Flex>
                                )}
                            </NavLink>
                        </Box>
                    ))}
                </Stack>
            </Box>
            <Box mt="auto" p="6" display={{ base: 'none', md: 'block' }}>
                <Flex gap="2" color="gray.500" align="center" fontSize="xs">
                    <ShieldCheck size={16} />
                    <Text>Espacio de gestión interno</Text>
                </Flex>
                <Text mt="3" fontSize="10px" color="gray.400">
                    CGato · Gestión oftalmológica
                </Text>
            </Box>
        </Flex>
    )
}
