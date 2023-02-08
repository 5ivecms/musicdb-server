export const sleepAsync = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const isNumeric = (value: string | number): boolean => {
  if (typeof value === 'number') return true
  const str = (value || '').toString()
  if (!str) return false
  return !isNaN(Number(str))
}

export const isBooleanString = (value: string | number | boolean) => value === 'true' || value === 'false'
