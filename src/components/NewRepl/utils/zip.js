const MAX_SAFE_INTEGER = 9007199254740991

function filter(array, predicate) {
    let index = -1
    let resIndex = 0
    const length = array == null ? 0 : array.length
    const result = []

    while (++index < length) {
        const value = array[index]
        if (predicate(value, index, array)) {
            result[resIndex++] = value
        }
    }
    return result
}

function map(array, iteratee) {
    let index = -1
    const length = array == null ? 0 : array.length
    const result = new Array(length)

    while (++index < length) {
        result[index] = iteratee(array[index], index, array)
    }
    return result
}

function baseProperty(key) {
    return (object) => object == null ? undefined : object[key]
}

function unzip(array) {
    if (!(array != null && array.length)) {
        return []
    }
    let length = 0
    array = filter(array, (group) => {
        if (isArrayLikeObject(group)) {
            length = Math.max(group.length, length)
            return true
        }
    })
    let index = -1
    const result = new Array(length)
    while (++index < length) {
        result[index] = map(array, baseProperty(index))
    }
    return result
}


function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value)
}

function isArrayLike(value) {
    return value != null && typeof value != 'function' && isLength(value.length)
}

function isObjectLike(value) {
    return typeof value == 'object' && value !== null
}

function isLength(value) {
    return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
}

export default function zip(...arrays) {
    return unzip(arrays)
}
