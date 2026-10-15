import { IconButton, Menu, Portal } from '@chakra-ui/react'
import { Ban, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

export default function RecordActions({ label, onEdit, onDelete, onCancel }) {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <IconButton aria-label={`Acciones de ${label}`} size="sm" variant="ghost">
                    <MoreHorizontal size={18} />
                </IconButton>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content minW="160px">
                        <Menu.Item value="edit" onSelect={onEdit}>
                            <Pencil size={15} />
                            Editar
                        </Menu.Item>
                        {onCancel && (
                            <Menu.Item value="cancel" onSelect={onCancel}>
                                <Ban size={15} />
                                Cancelar cirugía
                            </Menu.Item>
                        )}
                        <Menu.Separator />
                        <Menu.Item value="delete" color="red.600" onSelect={onDelete}>
                            <Trash2 size={15} />
                            Eliminar
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}
