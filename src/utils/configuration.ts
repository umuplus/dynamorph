import { z } from 'zod'

export const Options = z.object({
    delimiter: z.string().default('#'),
    safe: z.boolean().default(true),
})
export type Options = z.infer<typeof Options>

export const Settings = z.object({
    name: z.string().min(1).optional(),
    options: Options,
}).array().min(1)
export type Settings = z.infer<typeof Settings>

class Configuration {
    private settings: Settings

    constructor() {
        const options = Options.parse({})
        this.settings = Settings.parse([ { options } ])
    }

    update(options: Options, name?: string): void {
        const settings = this.settings.map(setting => {
            if (setting.name !== name) return setting
            return { ...setting, options: Options.parse(options) }
        })

        this.settings = Settings.parse(settings)
    }

    profile(name?: string): Options | undefined {
        const setting = this.settings.find(setting => setting.name === name)
        if (!setting) return undefined
        return setting.options
    }
}

export const config = new Configuration()
