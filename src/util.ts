/**
 * A promise queue.
 *
 * Only a single promise may run at a time.
 * One other promise may be queued up.
 *
 * If multiple promises get queued up, only the last is executed
 * once the pending one resolves.
 *
 * It's like throttling, but based on promise completion instead
 * of a wait time.
 */
export const promiseThrottle = <
  P extends Promise<any>,
  PC extends (...args: any[]) => P
>(
  promiseCreator: PC
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

  return wrappedPromiseCreator
}
