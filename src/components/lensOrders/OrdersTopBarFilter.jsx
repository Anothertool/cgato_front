import { Button, Flex, Grid, Input } from '@chakra-ui/react'
import { ClipboardList, Eye, Stethoscope, X } from 'lucide-react'
import FormField, { SelectInput } from '../ui/FormField'

const orderTypes = [
    { value: '', label: 'Todos', icon: ClipboardList, color: 'gray', bg: 'white' },
    { value: 'false', label: 'LC', icon: Eye, color: 'yellow', bg: 'yellow.50/50' },
    { value: 'true', label: 'LIO', icon: Stethoscope, color: 'blue', bg: 'blue.50/50' },
]

export default function OrdersTopBarFilter({
    isSurgery,
    onSurgeryChange,
    laboratory,
    onLaboratoryChange,
    search,
    onSearchChange,
    onClear,
}) {
    return (
        <Grid
            templateColumns={{
                base: '1fr',
                md: 'minmax(0, 1fr) minmax(0, 1fr)',
                xl: 'auto minmax(0, 240px) minmax(0, 1fr) auto',
            }}
            alignItems="end"
            gap="4"
            mb="4"
            p="4"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            rounded="lg"
        >
            <FormField label="Tipo de pedido">
                <Flex gap="2" wrap="wrap" role="group" aria-label="Tipo de pedido">
                    {orderTypes.map(({ value, label, icon: Icon, color, bg }) => (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            bg={bg}
                            color={`${color}.800`}
                            borderColor={isSurgery === value ? `${color}.600` : `${color}.200`}
                            boxShadow={
                                isSurgery === value ? `inset 0 0 0 1px var(--chakra-colors-${color}-600)` : 'none'
                            }
                            _hover={{ bg: value ? `${color}.100/50` : 'gray.50' }}
                            aria-pressed={isSurgery === value}
                            onClick={() => onSurgeryChange(value)}
                        >
                            <Icon size={16} aria-hidden="true" />
                            {label}
                        </Button>
                    ))}
                </Flex>
            </FormField>
            <FormField label="Laboratorio">
                <SelectInput
                    aria-label="Laboratorio"
                    value={laboratory}
                    onChange={(event) => onLaboratoryChange(event.target.value)}
                >
                    <option value="">Todos los laboratorios</option>
                    <option value="TIEDRA">TIEDRA</option>
                    <option value="MENICOM">MENICON</option>
                    <option value="MARKENOVI">Markennovy</option>
                </SelectInput>
            </FormField>
            <FormField label="Buscar pedidos">
                <Input
                    type="search"
                    placeholder="Nombre o teléfono del paciente"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </FormField>
            <Button
                type="button"
                variant="outline"
                justifySelf="end"
                disabled={!isSurgery && !laboratory && !search}
                onClick={onClear}
            >
                <X size={16} aria-hidden="true" />
                Limpiar
            </Button>
        </Grid>
    )
}
