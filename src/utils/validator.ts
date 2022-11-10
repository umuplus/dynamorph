const pattern = /[0-9A-HJKMNP-TV-Z]{26}/
export function isUlid(value: any): boolean {
    return typeof value === 'string' && pattern.test(value)
}
