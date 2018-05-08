export const contextAware = (component: React.StatelessComponent | React.ComponentClass) => {
  const store: React.Validator<Number> = (): Error => null
  component.contextTypes = { store }
}