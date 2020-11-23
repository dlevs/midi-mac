import _ from 'lodash'

/**
 * Lodash's throttle function, but for functions that return promises.
 *
 * Not only will the throttling wait the minimum `wait` time before
 * allowing another execution, it will also wait for the last promise
 * to have completed.
 */
export const promiseThrottle = <
  P extends Promise<any>,
  PC extends (...args: any[]) => P
>(
  promiseCreator: PC,
  wait: number,
  options: _.ThrottleSettings
) => {
  let current: P | null = null
  let next: (() => P) | null = null

  const exec = async (fn: () => P) => {
    current = fn()
    const result = await current
    current = null
    return result
  }

  const wrappedPromiseCreator = (async (...args) => {
    const thisNext = () => promiseCreator(...args)

    if (current) {
      next = thisNext
      await current
      if (next === thisNext) {
        return exec(thisNext)
      } else {
        return current
      }
    }

    return exec(thisNext)
  }) as PC

  return _.throttle(wrappedPromiseCreator, wait, options)
}
