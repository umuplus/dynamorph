export function delimiter(value?: string): string {
    if (value) process.env.DYNAMORPH_DELIMITER = value
    return process.env.DYNAMORPH_DELIMITER || '#'
}

export function silent(value?: boolean): boolean {
    if (value) process.env.DYNAMORPH_SILENT = value ? 'true' : 'false'
    return process.env.DYNAMORPH_SILENT?.toLowerCase() === 'true'
}

export function updateTokenLength(value?: number): number {
    return value || 4
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
export function generateToken(length: number) {
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength))
    return result
}
