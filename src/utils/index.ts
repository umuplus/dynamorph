export function findRelatedAttributes(format: string): string[] {
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

export function generateRandomString(length: number = 6): string {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength))
    return result
}
