export const paymentMethodLabels = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otros',
}

export const invoiceStatusLabels = {
    PENDING: 'Pendiente de emitir',
    ISSUED: 'Emitida, pendiente de entregar',
    DELIVERED: 'Emitida y entregada',
}

export const invoiceStatusColors = { PENDING: 'orange', ISSUED: 'blue', DELIVERED: 'green' }

export const todayDate = () => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const formatMoney = (value) =>
    value === undefined || value === null
        ? '—'
        : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
              Number(value),
          )
