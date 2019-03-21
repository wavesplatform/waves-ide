const canvas = document.createElement('canvas');

export function getTextWidth(text: string, font: string) {
    // re-use canvas object for better performance
    //const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}
