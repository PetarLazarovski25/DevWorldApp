import axios from 'axios'
import { REGISTER_FAIL, REGISTER_SUCCESS, USER_LOADED, AUTH_ERROR, USER_LOGINED, LOGIN_FAIL } from './types'
import { setAlert } from './alert'
import setAuthToken from '../utils/setAuthToken'


//LOGIN USER

export const loginUser = (email, password) => async dispatch => {

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ email, password })

    try {
        const res = await axios.post('/api/auth/login', body, config)

        dispatch({
            type: USER_LOGINED,
            payload: res.data
        })

        dispatch(loadUser())
    } catch (error) {
        console.log(error.response)
        dispatch({
            type: LOGIN_FAIL
        })
    }
}


//LOAD USER

export const loadUser = () => async dispatch => {
    if (localStorage.token) {
        setAuthToken(localStorage.token)
    }

    try {
        const res = await axios.get('/api/auth')

        dispatch({
            type: USER_LOADED,
            payload: res.data
        })
    } catch (e) {
        dispatch({
            type: AUTH_ERROR
        })
    }
}



//Register
export const register = ({ name, email, password }) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const body = JSON.stringify({ name, email, password })

    try {
        const res = await axios.post('/api/users', body, config)

        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        })

        dispatch(loadUser())

    } catch (error) {

        const errors = error.response.data

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: REGISTER_FAIL
        })
    }

}



