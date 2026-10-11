import { combineReducers } from 'redux'

import ticketReducer from './reducers/ticket'

const rootReducer = combineReducers({
  ticketReducer,
})

export default rootReducer
