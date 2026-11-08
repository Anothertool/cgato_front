import client from './client'

export const lensOrdersQueryKey = (status, filters) => ['lens-orders', { status, ...filters }]
export const lensOrderOptionsQueryKey = ['lens-orders', 'options']

export const lensOrdersApi = {
    getPage: (params, signal) => client.get('/api/orders/', { params, signal }).then(({ data }) => data),
    getById: (id, signal) => client.get(`/api/orders/${id}/`, { signal }).then(({ data }) => data),
    create: (values) => client.post('/api/orders/', values).then(({ data }) => data),
    update: (id, values) => client.patch(`/api/orders/${id}/`, values).then(({ data }) => data),
}
