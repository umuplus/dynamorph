const ulidPattern = /^[0-9A-HJ-NP-TV-Z]{26}$/
export function isUlid(value?: any): boolean {
    return typeof value === 'string' && ulidPattern.test(value)
}

const emailPattern = /^[^\s@]+@[^\s@]+$/
export function isEmail(value?: any): boolean {
    return typeof value === 'string' && emailPattern.test(value)
}

const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
export function isUrl(value?: any): boolean {
    return typeof value === 'string' && urlPattern.test(value)
}

export function isInt(value: any){
    return typeof value === 'number' && value % 1 === 0;
}

export function isFloat(value: any){
    return typeof value === 'number' && value % 1 !== 0;
}