export const sleepAsync = async (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export const isNumeric = (num: any) => !isNaN(num)
