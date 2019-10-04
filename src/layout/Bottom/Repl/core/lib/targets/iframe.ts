/*global document */
export const container:any = document.createElement('iframe');
container.width = container.height = 1;
container.style.opacity = 0;
container.style.border = 0;
container.style.position = 'absolute';
container.style.top = '-100px';
container.setAttribute('name', '<proxy>');
document.body.appendChild(container);

export default function run(command:any) {
  const res:any = {
    error: false,
    command,
  };

  try {
    res.value = container.contentWindow.eval(command);
    container.contentWindow.$_ = res.value;
  } catch (error) {
    res.error = true;
    res.value = error;
  }

  return res;
}