import axios from 'axios'

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    withXSRFToken: true,
})

export function errorMessage(error) {
    if (error.code === 'API_CONFIG_MISSING')
        return 'Falta VITE_API_URL. Configura el archivo .env y reinicia Vite.'
    if (error.response?.status === 401)
        return 'La sesión no está iniciada o ha caducado. Accede con una sesión autorizada de Django.'
    if (error.response?.status === 403)
        return 'Acceso denegado. Comprueba la sesión, los permisos y la configuración CSRF de Django.'
    if (!error.response)
        return 'No se puede conectar con la API. Comprueba la conexión y la configuración del servidor.'
    const detail = error.response.data
    if (typeof detail === 'string') return 'El servidor no pudo completar la operación.'
    const flatten = (value) =>
        Array.isArray(value)
            ? value.map(flatten).join(' ')
            : value && typeof value === 'object'
              ? Object.entries(value)
                    .map(([key, message]) => `${key}: ${flatten(message)}`)
                    .join(' · ')
              : String(value ?? '')
    return flatten(detail) || 'No se pudo completar la operación.'
}

client.interceptors.request.use((config) => {
    if (!config.baseURL) {
        const error = new Error('Missing API configuration')
        error.code = 'API_CONFIG_MISSING'
        throw error
    }
    // Incorporar aquí las credenciales cuando se defina el flujo de autenticación.
    return config
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        error.userMessage = errorMessage(error)
        return Promise.reject(error)
    },
)

export default client
