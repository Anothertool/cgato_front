export const patientName = (patient) =>
    [patient?.first_name, patient?.last_name].filter(Boolean).join(' ') || 'Sin nombre'
export const formatDate = (value, withTime = false) =>
    value && !Number.isNaN(new Date(value).getTime())
        ? new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
          }).format(new Date(value))
        : '—'
export const statusLabels = {
    PENDING: 'Pendiente',
    PREPARING: 'En preparación',
    READY: 'Preparada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
}
export const statusColors = {
    PENDING: 'orange',
    PREPARING: 'blue',
    READY: 'teal',
    COMPLETED: 'green',
    CANCELLED: 'gray',
}
export const eyeLabels = { RIGHT: 'Derecho', LEFT: 'Izquierdo', BOTH: 'Ambos' }
export const checklist = {
    lens_ordered: 'Lente solicitada',
    lens_received: 'Lente recibida',
    lens_verified: 'Lente verificada',
    documentation_ready: 'Documentación preparada',
}
export function toDateTimeInput(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
