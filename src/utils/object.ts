import { isBoolean, isBooleanString, isNumber, isNumberString } from 'class-validator'
import * as dot from 'dot-object'

export const prepareObject = (object: object) => {
  const stringObject = dot.dot(object) as Record<string, string>
  const newObj: Record<string, string | number | boolean> = {}

  Object.keys(stringObject).map((key) => {
    if (isNumberString(stringObject[key]) || isNumber(stringObject[key])) {
      newObj[key] = Number(stringObject[key])
      return
    }

    if (isBooleanString(stringObject[key]) || isBoolean(stringObject[key])) {
      newObj[key] = Boolean(stringObject[key])
      return
    }

    newObj[key] = stringObject[key]
  })

  return dot.object(newObj)
}
