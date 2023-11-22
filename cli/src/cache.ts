import os from 'os'
import fs from 'fs'

const DEFAULT_DIRECTORY = `${os.homedir()}/.axiom/cache`

export interface Item {
  expires?: Date;
  data: unknown
}

export default class {
  constructor(private cacheDir: string = DEFAULT_DIRECTORY) { }

  get<T = object>(name: string): T | undefined {
    const file = `${this.cacheDir}/${name}`
    /**
     * does this item exist?
     */
    if (!fs.existsSync(file)) {
      return
    }

    const buffer = fs.readFileSync(file)
    /**
     * fetch the item
     */
    const item = JSON.parse(buffer.toString()) as Item

    /**
     * Just return it
     */
    if (item.expires === undefined) {
      return item.data as T
    }

    item.expires = new Date(item.expires)
    /**
     * Exired?
     * delete if so
     */
    if (item.expires < new Date()) {
      this.delete(name)
      return
    }

    return item.data as T
  }

  delete(name: string): void {
    fs.unlinkSync(
      `${this.cacheDir}/${name}`,
    )
  }

  set(name: string, value: unknown, expires?: Date): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, {
        recursive: true,
        mode: 0o700,
      })
    }
    fs.writeFileSync(
      `${this.cacheDir}/${name}`,
      JSON.stringify({
        expires,
        data: value
      }),
      {
        mode: 0o600
      }
    )
  }
}

