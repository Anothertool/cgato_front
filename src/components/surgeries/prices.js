export const SURGERY_PRICES = {
    FACO: {
        priceByLens: { HOYA_XY1: 2750, PURE_DEN00V: 3300, MULTI_DRN00V: 3300 },
        unit: 'eye',
    },
    FACO_ISTENT: {
        priceByImplant: { ISTENT_INJECT: 4800, ISTENT_INFINITY: 5200 },
        unit: 'eye',
    },
    FEPNP: { price: 5500, unit: 'eye' },
    EPNP: { price: 4500, unit: 'eye' },
    GLAUCOMA_PRESERFLO: { price: 4950, unit: 'eye' },
    GLAUCOMA_ISTENT: {
        priceByImplant: { ISTENT_INJECT: 4700, ISTENT_INFINITY: 4950 },
        unit: 'eye',
    },
    PRK: { price: 3200, unit: 'both_eyes' },
    LASIK: { price: 3200, unit: 'both_eyes' },
    CHALAZION: { price: 1400, unit: 'eye' },
    BLEPHAROPLASTY: { price: 2800, unit: 'eye' },
    CONJUNCTIVOCHALASIS_PUNCTOPLASTY: { price: 1400, unit: 'eye' },
    ICL: {
        priceByDiopters: { threshold: 5, below: 3250, aboveOrEqual: 3500 },
        unit: 'eye',
    },
}

export const implantTypeLabels = {
    ISTENT_INJECT: 'iStent Inject',
    ISTENT_INFINITY: 'iStent Infinity',
}

export function getSurgeryPrice(surgeryType, { iolModel, implantType, diopters } = {}) {
    const config = SURGERY_PRICES[surgeryType]
    if (!config) return 0
    if (config.priceByLens) return config.priceByLens[iolModel] ?? 0
    if (config.priceByImplant) return config.priceByImplant[implantType] ?? 0
    if (config.priceByDiopters) {
        if (diopters == null || String(diopters).trim() === '') return 0
        const value = Math.abs(Number(diopters))
        if (!Number.isFinite(value)) return 0
        const { threshold, below, aboveOrEqual } = config.priceByDiopters
        return value < threshold ? below : aboveOrEqual
    }
    return config.price ?? 0
}

export function getEstimatedAmount(value, implantType) {
    const price = getSurgeryPrice(value.surgery_type, {
        iolModel: value.iol_model,
        implantType,
        diopters: value.iol_power,
    })
    const eyeCount =
        SURGERY_PRICES[value.surgery_type]?.unit === 'both_eyes'
            ? 1
            : value.eye === 'BOTH'
              ? 2
              : ['RIGHT', 'LEFT'].includes(value.eye)
                ? 1
                : 0
    return String(price * eyeCount)
}
