export const patientName = (patient) =>
    [patient?.first_name, patient?.last_name].filter(Boolean).join(' ') || 'Sin nombre'
export const patientSourceLabels = {
    SOCIAL_MEDIA: 'Redes sociales',
    INSURER: 'Aseguradora',
    CONSULTATION: 'Consulta en la clínica',
    REFERRAL: 'Recomendación',
    WEB: 'Web / Google',
    OTHER: 'Otros',
    UNKNOWN: 'Desconocido',
}
export const formatDate = (value, withTime = false) =>
    value && !Number.isNaN(new Date(value).getTime())
        ? new Intl.DateTimeFormat('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
          }).format(new Date(value))
        : '—'
export const budgetStatusLabels = {
    QUOTED: 'Presupuestado',
    ACCEPTED: 'Aceptado',
    LOST: 'Perdido',
}
export const statusLabels = {
    ...budgetStatusLabels,
    SCHEDULED: 'Programada',
    AWAITING_CONFIRMATION: 'Pendiente de confirmar',
    COMPLETED: 'Realizada',
    CANCELLED: 'Cancelada',
}
export const statusColors = {
    QUOTED: 'orange',
    ACCEPTED: 'teal',
    LOST: 'red',
    SCHEDULED: 'blue',
    AWAITING_CONFIRMATION: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'gray',
}
export const eyeLabels = { RIGHT: 'Derecho', LEFT: 'Izquierdo', BOTH: 'Ambos' }
export const surgeryTypeLabels = {
    FACO_INSTENT: 'Faco + Instent',
    FACO: 'Faco',
    FEPNP: 'FEPNP',
    FACO_PRESERFLO: 'Faco + Preserflo',
    BLEPHAROPLASTY: 'Blefaroplastia',
    TUMOR: 'Tumoración',
    INSTENT: 'Instent',
    EPNP: 'EPNP',
    PRESERFLO: 'Preserflo',
}
export const insurerLabels = {
    CASER: 'Caser',
    ADESLAS: 'Adeslas',
    CIGNA: 'Cigna',
    DKV: 'DKV',
    DIVINA_PASTORA: 'Divina Pastora',
    PRIVATE: 'Privado',
}
export const iolModelLabels = {
    PURE_DEN00V: 'PURE DEN00V',
    PURE_TORICA_DET: 'PURE + TORICA DET',
    MULTI_DRN00V: 'MULTI DRN00V',
    MULTI_TORICA_DRT: 'MULTI + TORICA DRT',
    HOYA_XY1: 'HOYA XY1',
}
export const checklist = {
    lens_ordered: 'Lentes pedidas',
    lens_verified: 'Lentes comprobadas',
    eyes_verified: 'Ojos a operar comprobados',
    informed_consent_signed: 'Consentimiento informado firmado',
    blood_test_done: 'Analítica realizada',
    anesthetist_appointment: 'Cita con anestesista concertada',
}
export function toDateTimeInput(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
