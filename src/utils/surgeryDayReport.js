import { insurerLabels, iolModelLabels } from './format'

const timeZone = 'Europe/Madrid'
const timeFormatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
})
const partsFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
})

function madridMidnight(utcDay) {
    let instant = utcDay
    // Resolve the offset separately for each midnight, including 23/25-hour days.
    for (let i = 0; i < 3; i += 1) {
        const parts = Object.fromEntries(
            partsFormatter.formatToParts(new Date(instant)).map(({ type, value }) => [type, value]),
        )
        const local = Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second),
        )
        instant += utcDay - local
    }
    return new Date(instant).toISOString()
}

export function surgeryDayRange(day) {
    const [year, month, date] = day.split('-').map(Number)
    return {
        start: madridMidnight(Date.UTC(year, month - 1, date)),
        end: madridMidnight(Date.UTC(year, month - 1, date + 1)),
    }
}

export const surgeryDayLabel = (day) => day.split('-').reverse().join('/')

export function surgeryDayRows(surgeries, day) {
    const { start, end } = surgeryDayRange(day)
    return surgeries
        .filter((surgery) => {
            const scheduled = new Date(surgery.scheduled_at).getTime()
            return (
                surgery.scheduled_at &&
                scheduled >= Date.parse(start) &&
                scheduled < Date.parse(end) &&
                !surgery.cancelled_at &&
                surgery.budget_status !== 'LOST' &&
                !['CANCELLED', 'LOST'].includes(surgery.display_status)
            )
        })
        .sort((a, b) => Date.parse(a.scheduled_at) - Date.parse(b.scheduled_at))
        .map((surgery) => {
            const scheduled = new Date(surgery.scheduled_at)
            const model =
                surgery.iol_model_label || iolModelLabels[surgery.iol_model] || surgery.iol_model
            const power =
                surgery.iol_power == null || surgery.iol_power === ''
                    ? ''
                    : `${surgery.iol_power} D`
            return {
                id: surgery.id,
                name:
                    [surgery.patient?.first_name, surgery.patient?.last_name]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || '—',
                eye: { RIGHT: 'DERECHO', LEFT: 'IZQUIERDO', BOTH: 'AMBOS' }[surgery.eye] || '—',
                lens: [model, power].filter(Boolean).join(' · ') || '—',
                phone: surgery.patient?.phone?.trim().replace(/^\+34\s*/, '') || '—',
                time: timeFormatter.format(scheduled),
                insurer:
                    surgery.insurer_label ||
                    insurerLabels[surgery.insurer] ||
                    surgery.insurer ||
                    '—',
            }
        })
}
