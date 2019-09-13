const spreadableSymbol = Symbol.isConcatSpreadable;
const toString = Object.prototype.toString

function baseFlatten(array, depth, predicate, isStrict, result) {
    predicate || (predicate = isFlattenable)
    result || (result = [])

    if (array == null) {
        return result
    }

    for (const value of array) {
        if (depth > 0 && predicate(value)) {
            if (depth > 1) {
                // Recursively flatten arrays (susceptible to call stack limits).
                baseFlatten(value, depth - 1, predicate, isStrict, result)
            } else {
                result.push(...value)
            }
        } else if (!isStrict) {
            result[result.length] = value
        }
    }
    return result
}

function isFlattenable(value) {
    return Array.isArray(value) || isArguments(value) ||
        !!(value && value[spreadableSymbol])
}

function isArguments(value) {
    return isObjectLike(value) && getTag(value) == '[object Arguments]'
}

function isObjectLike(value) {
    return typeof value == 'object' && value !== null
}

function getTag(value) {
    if (value == null) {
        return value === undefined ? '[object Undefined]' : '[object Null]'
    }
    return toString.call(value)
}

export default function flatten(array) {
    const length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : []
}
