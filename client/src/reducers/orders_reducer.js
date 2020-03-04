import types from '../actions/types';

const DEFAULT_STATE = {
    details: []
}

export default (state = DEFAULT_STATE, action) => {

    switch(action.type){
        case types.GET_GUEST_ORDER_DETAILS:
            return {...state, details: action.order}
        default:
            return state;
    }
}