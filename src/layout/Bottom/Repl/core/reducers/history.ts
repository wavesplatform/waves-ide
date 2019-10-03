const ADD_HISTORY = 'ADD_HISTORY';

const defaultState:any = [];

const reducer = (state = defaultState, action:any) => {
  if (action.type === ADD_HISTORY) {
    if (state.slice(-1).pop() !== action.value) {
      return [...state, action.value];
    }
  }

  return state;
};

export default reducer;
