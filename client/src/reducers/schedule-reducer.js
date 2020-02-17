import types from '../actions/types';

const DEFAULT_STATE = {
    list: []
};

export default (state = DEFAULT_STATE, action) => {

    switch(action.type){
        case types.GET_SCHEDULE_DATA:
            return {...state, list: action.schedules};
        default:
            return state;
    }
}

