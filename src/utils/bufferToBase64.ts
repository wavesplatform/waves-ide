export function bufferToBase64(buf: any) {
  var binstr = Array.prototype.map.call(buf, function (ch:any) {
    return String.fromCharCode(ch);
  }).join('')
  return btoa(binstr)
}