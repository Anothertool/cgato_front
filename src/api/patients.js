import client from './client'

export const patientsApi = {
    getAll: (params, signal) =>
        client.get('/api/patients/', { params, signal }).then(({ data }) => data),
    getById: (id) => client.get(`/api/patients/${id}/`).then(({ data }) => data),
    create: (data) => client.post('/api/patients/', data).then(({ data }) => data),
    update: (id, data) => client.patch(`/api/patients/${id}/`, data).then(({ data }) => data),
    remove: (id) => client.delete(`/api/patients/${id}/`),
}
