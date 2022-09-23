import { createStore } from 'redux';

const initialState = {
  message: '',
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'showMessage': {
      return {...state, message: action.payload};
    }
    default:
      return state;
  }
}

const store = createStore(reducer);

export default store;
