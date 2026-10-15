import client from './client'

export const surgeriesApi = {
    getAll: (params, signal) =>
        client.get('/api/surgeries/', { params, signal }).then(({ data }) => data),
    getById: (id) => client.get(`/api/surgeries/${id}/`).then(({ data }) => data),
    create: (data) => client.post('/api/surgeries/', data).then(({ data }) => data),
    update: (id, data) => client.patch(`/api/surgeries/${id}/`, data).then(({ data }) => data),
    remove: (id) => client.delete(`/api/surgeries/${id}/`),
}
