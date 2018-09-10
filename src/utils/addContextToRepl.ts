export const contextBinding = {
  async sync(context: any): Promise<any> {

    return new Promise<(ctx: any) => void>((resolve, _) => {
      const tryToFindIframe = () => {
        const iframe = ((document.getElementsByTagName('iframe')).item(0))
        if (iframe) {
          const iframeWindow = iframe.contentWindow
          if (!this.initialProps) {
            this.initialProps = Object.keys(iframeWindow).reduce((a, b) => { a[b] = true; return a }, {})
          }
          const sync = (ctx) => {
            Object.keys(ctx).forEach(key => {
              iframeWindow[key] = ctx[key]
            });

            Object.keys(iframeWindow).filter(x => !this.initialProps[x]).forEach(x => {
              ctx[x] = iframeWindow[x]
            })
          }

          sync(context)

          resolve(context)
        } else {
          setTimeout(tryToFindIframe, 100)
        }
      }

      tryToFindIframe()
    })
  }
}

