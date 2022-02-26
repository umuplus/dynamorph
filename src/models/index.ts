import { BaseClass } from './types/_'
import { ModelConfiguration } from './types'

export class Model extends BaseClass {
    private readonly _config: ModelConfiguration

    constructor(config: ModelConfiguration, profileName?: string) {
        super(profileName)

        this._config = ModelConfiguration.parse(config)
        Object.setPrototypeOf(this, Model.prototype)
    }

    get config() {
        return this._config
    }
}
