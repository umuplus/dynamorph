import { z } from 'zod'

export const Options = z.object({
    delimiter: z.string().default('#'),
    safe: z.boolean().default(true),
})
export type Options = z.infer<typeof Options>

export const Settings = z
    .object({
        name: z.string().min(1).optional(),
        options: Options,
    })
    .array()
    .min(1)
export type Settings = z.infer<typeof Settings>

export class Configuration {
    private _settings: Settings

    constructor() {
        const options = Options.parse({})
        this._settings = Settings.parse([{ options }])
    }

    update(options: Options, name?: string): void {
        let index = this._settings.findIndex((s) => s.name === name)
        const val = { name, options: Options.parse(options) }
        if (index >= 0) this._settings[index] = val
        else this._settings.push(val)
    }

    profile(name?: string): Options | undefined {
        const setting = this._settings.find((setting) => setting.name === name)
        if (!setting) return undefined
        return setting.options
    }
}

export const config = new Configuration()
