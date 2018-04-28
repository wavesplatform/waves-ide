export function copyToClipboard(value: string): boolean {
  var input = document.createElement('input');
  input.setAttribute('value', value);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input)
  return result;
}