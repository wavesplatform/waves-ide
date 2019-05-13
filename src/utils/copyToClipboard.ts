export function copyToClipboard(value: string): boolean {
    const textField = document.createElement('textarea');
    textField.innerText = value;
    document.body.appendChild(textField);
    textField.select();
    textField.focus(); //SET FOCUS on the TEXTFIELD
    const result = document.execCommand('copy');
    textField.remove();
    return result;
   // ajax-error.focus(); //SET FOCUS BACK to MODAL
}
