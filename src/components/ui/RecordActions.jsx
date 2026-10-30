import { IconButton, Menu, Portal } from '@chakra-ui/react'
import { Ban, CalendarCheck, Check, FileText, MoreHorizontal, Pencil, RotateCcw, Trash2 } from 'lucide-react'

export default function RecordActions({
    label,
    onEdit,
    onDelete,
    onCancel,
    onComplete,
    onReopen,
    onApproveAndSchedule,
    quoteHref,
    disabled,
}) {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <IconButton aria-label={`Acciones de ${label}`} size="sm" variant="ghost" disabled={disabled}>
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
                        {quoteHref && (
                            <Menu.Item value="quote" asChild>
                                <a href={quoteHref} target="_blank" rel="noopener noreferrer">
                                    <FileText size={15} />
                                    Ver presupuesto PDF
                                </a>
                            </Menu.Item>
                        )}
                        {onApproveAndSchedule && (
                            <Menu.Item value="approve-and-schedule" onSelect={onApproveAndSchedule}>
                                <CalendarCheck size={15} />
                                Aprobar y citar
                            </Menu.Item>
                        )}
                        {onComplete && (
                            <Menu.Item value="complete" onSelect={onComplete}>
                                <Check size={15} />
                                Marcar como realizada
                            </Menu.Item>
                        )}
                        {onReopen && (
                            <Menu.Item value="reopen" onSelect={onReopen}>
                                <RotateCcw size={15} />
                                Reabrir cirugía
                            </Menu.Item>
                        )}
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
