import client from './client'

export const surgeriesApi = {
    getAvailability: (params, signal) =>
        client.get('/api/surgeries/availability/', { params, signal }).then(({ data }) => data),
    getOptions: (params, signal) => client.get('/api/surgeries/options/', { params, signal }).then(({ data }) => data),
    getAll: (params, signal) => client.get('/api/surgeries/', { params, signal }).then(({ data }) => data),
    getDay: async ({ start, end }, signal) => {
        const params = {
            scheduled_at__gte: start,
            scheduled_at__lt: end,
            ordering: 'scheduled_at,id',
        }
        const surgeries = []
        let page = 1
        let data
        do {
            data = await surgeriesApi.getAll({ ...params, page }, signal)
            surgeries.push(...(Array.isArray(data) ? data : data.results))
            page += 1
        } while (data.next)
        return surgeries
    },
    getCalendar: ({ start, end }, signal) => {
        const params = {
            view: 'calendar',
            scheduled_at__gte: start,
            scheduled_at__lt: end,
            ordering: 'scheduled_at',
        }
        return surgeriesApi.getAll(params, signal)
    },
    getById: (id, signal) => client.get(`/api/surgeries/${id}/`, { signal }).then(({ data }) => data),
    create: (data) => client.post('/api/surgeries/', data).then(({ data }) => data),
    update: (id, data) => client.patch(`/api/surgeries/${id}/`, data).then(({ data }) => data),
    remove: (id) => client.delete(`/api/surgeries/${id}/`),
    complete: (id) => client.post(`/api/surgeries/${id}/complete/`).then(({ data }) => data),
    cancel: (id) => client.post(`/api/surgeries/${id}/cancel/`).then(({ data }) => data),
    reopen: (id) => client.post(`/api/surgeries/${id}/reopen/`).then(({ data }) => data),
}
