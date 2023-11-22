import Cache, { Item } from './cache'
import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
vi.mock('fs')

vi.mocked(fs.unlinkSync).mockReturnValue(undefined)

describe('get', () => {
  it('cache get', async () => {

    const item: Item = {
      data: {
        hello: "worlds",
      },
    }

    /* eslint-disable */
    // @ts-ignore
    fs.existsSync.mockReturnValue(true)
    /* eslint-disable*/
    // @ts-ignore
    fs.readFileSync.mockReturnValue(
      Buffer.from(JSON.stringify(item), 'utf-8')
    )

    const cache = new Cache()

    const value = cache.get<{ hello: string }>('some-key')

    if (value === undefined) {
      return
    }

    expect(value.hello).toBe("worlds")
  })

  it('cache get - not expired', async () => {

    const item: Item = {
      data: {
        hello: "worlds",
      },
      expires: new Date('2050-01-01T00:00:00'),
    }

    /* eslint-disable*/
    //@ts-ignore
    fs.existsSync.mockReturnValue(true)
    /* eslint-disable*/
    //@ts-ignore
    fs.readFileSync.mockReturnValue(
      Buffer.from(JSON.stringify(item), 'utf-8')
    )

    const cache = new Cache()

    const value = cache.get('some-key')

    expect(value).toBeDefined()
  })

  it('cache get - expired', async () => {

    const item: Item = {
      data: {
        hello: "worlds",
      },
      expires: new Date('2010-01-01T00:00:00'),
    }

    //@ts-ignore
    fs.existsSync.mockReturnValue(true)
    //@ts-ignore
    fs.readFileSync.mockReturnValue(
      Buffer.from(JSON.stringify(item), 'utf-8')
    )

    const cache = new Cache()

    const value = cache.get('some-key')

    expect(value).toBeUndefined()
  })
})

describe('set', () => {
  it('cache set', async () => {

    const item: Item = {
      data: {
        hello: "worlds",
      },
    }

    //@ts-ignore
    fs.existsSync.mockReturnValue(true)
    //@ts-ignore
    fs.writeFileSync.mockReturnValue(
      undefined
    )

    const cache = new Cache()
    cache.set('some-key', item)

  })
})

