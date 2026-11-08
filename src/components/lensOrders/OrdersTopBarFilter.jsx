import { Button, Grid, Input } from '@chakra-ui/react'
import { X } from 'lucide-react'
import FormField, { SelectInput } from '../ui/FormField'

export default function OrdersTopBarFilter({ laboratory, onLaboratoryChange, search, onSearchChange, onClear }) {
    return (
        <Grid
            templateColumns={{ base: '1fr', sm: 'minmax(0, 240px) minmax(0, 1fr) auto' }}
            alignItems="end"
            gap="4"
            mb="4"
            p="4"
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            rounded="lg"
        >
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
                disabled={!laboratory && !search}
                onClick={onClear}
            >
                <X size={16} aria-hidden="true" />
                Limpiar
            </Button>
        </Grid>
    )
}
