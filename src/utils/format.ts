export function findCompositeAttributes(format: string): string[] {
    const matches = format.match(/{.+?}/g)
    if (!Array.isArray(matches)) return []
    return matches.map((f) => f.replace(/{/g, '').replace(/}/g, ''))
}

export function applyFormat(format: string, data: Record<string, any>): string {
    return Object.keys(data).reduce((final: string, field: string) => {
        final = final.replace(new RegExp(`{${field}}`, 'g'), data[field])
        return final
    }, format)
}
