import { isBoolean, isBooleanString, isNumber, isNumberString, isString } from 'class-validator'
import * as dot from 'dot-object'
import { ILike } from 'typeorm'

export const prepareObject = (object: object) => {
  const stringObject = dot.dot(object) as Record<string, string>
  const newObj: Record<string, string | number | boolean> = {}

  Object.keys(stringObject).forEach((key) => {
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

export const prepareSearch = (object: object) => {
  const stringObject = dot.dot(object) as Record<string, string>
  const newObject: object = {}

  Object.keys(stringObject).forEach((key) => {
    if (isString(stringObject[key])) {
      newObject[key] = ILike(`%${stringObject[key]}%`)
      return
    }
    newObject[key] = stringObject[key]
  })

  return dot.object(newObject)
}

export const prepareOrder = (object: object) => dot.object(object)

export const getRelations = (object: object) => {
  const stringObject = dot.dot(object) as Record<string, string>
  const relations = Object.keys(stringObject).reduce((acc, item) => {
    const fieldParts = item.split('.')
    if (fieldParts.length === 1) {
      return acc
    }

    fieldParts.pop()
    const relation = fieldParts.join('.')

    return { ...acc, [relation]: true }
  }, {})

  return relations
}
