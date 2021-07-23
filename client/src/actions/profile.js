import axios from 'axios'
import { setAlert } from './alert'

import { CLEAR_PROFILE, DELETE_ACCOUNT, GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE, GET_PROFILES, GET_REPOS } from './types'


//Get curent user profile
export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me')

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })


    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

//Get all profiles
export const getAllProfiles = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile')

        dispatch({
            type: GET_PROFILES,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

//Get profile by ID
export const getProfileByID = userID => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/user/${userID}`)

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

//Create or update a profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.post('/api/profile', formData, config)

        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'))

        if (!edit) {
            history.push('/dashboard')
        }

    } catch (error) {

        const errors = error.response.data

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

//Add experience
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.put('/api/profile/experience', formData, config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience Added', 'success'))

        history.push('/dashboard')

    } catch (error) {
        const errors = error.response.data

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }


        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

//Add Education
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const res = await axios.post('/api/profile/education', formData, config)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education Added', 'success'))

        history.push('/dashboard')

    } catch (error) {
        const errors = error.response.data

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')))
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })

    }
}

//Delete Experience
export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Experience Removed', 'success'))

    } catch (error) {
        dispatch({
            type: PROFILE_ERROR
        })
    }
}

//Delete Education
export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`)

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        })

        dispatch(setAlert('Education Deleted', 'success'))
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR
        })
    }
}

//Delete Account
export const deleteAccount = () => async dispatch => {

    if (window.confirm('Are you sure? Your account cannot be retrived')) {
        try {
            await axios.delete('/api/profile')

            dispatch({
                type: CLEAR_PROFILE
            })

            dispatch({
                type: DELETE_ACCOUNT
            })

            dispatch(setAlert('Your account has been deleted'))
        } catch (error) {
            dispatch({
                type: PROFILE_ERROR
            })
        }
    }
}

//Get Github Repos
export const getGithubRepos = githubUser => async dispatch => {
    try {
        const res = await axios.get(`/api/profile/github/${githubUser}`)

        dispatch({
            type: GET_REPOS,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}