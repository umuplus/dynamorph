export function delimiter(value?: string): string {
    if (value) process.env.DYNAMORPH_DELIMITER = value
    return process.env.DYNAMORPH_DELIMITER || '#'
}

export function silent(value?: boolean): boolean {
    if (value) process.env.DYNAMORPH_SILENT = value ? 'true' : 'false'
    return process.env.DYNAMORPH_SILENT?.toLowerCase() === 'true'
}
