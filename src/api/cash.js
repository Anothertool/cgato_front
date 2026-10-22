import client from './client'

export const cashApi = {
    getAll: (params, signal) =>
        client.get('/api/cash/entries/', { params, signal }).then(({ data }) => data),
    getSummary: (params, signal) =>
        client.get('/api/cash/summary/', { params, signal }).then(({ data }) => data),
    create: (data) => client.post('/api/cash/entries/', data).then(({ data }) => data),
    update: (id, data) => client.patch(`/api/cash/entries/${id}/`, data).then(({ data }) => data),
    remove: (id) => client.delete(`/api/cash/entries/${id}/`),
}
