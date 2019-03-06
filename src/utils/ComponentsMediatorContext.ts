import * as React from 'react';


import Mediator from '@utils/Mediator';

const Context = React.createContext<Mediator | null>(null);

const Provider = Context.Provider;
  
const Consumer = Context.Consumer;

export default Context;

export {
  Provider,
  Consumer
};
