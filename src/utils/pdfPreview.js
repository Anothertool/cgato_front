export function showPdfPreview(preview, blob) {
    if (preview.closed) return
    const pdfBlob =
        blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
    const url = URL.createObjectURL(pdfBlob)
    const release = () => {
        window.clearInterval(timer)
        window.removeEventListener('pagehide', onPageHide)
        URL.revokeObjectURL(url)
    }
    const onPageHide = (event) => {
        if (!event.persisted) release()
    }
    // Keep the URL available for the viewer's print/reload actions until it closes.
    const timer = window.setInterval(() => {
        if (preview.closed) release()
    }, 1000)
    window.addEventListener('pagehide', onPageHide)
    try {
        preview.location.replace(url)
    } catch (error) {
        release()
        throw error
    }
}
