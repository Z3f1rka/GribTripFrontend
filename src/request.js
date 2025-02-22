import axios from 'axios'

export const auth_get = (url) => {
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token')
    const refresh_token = localStorage.getItem('refresh_token')
    var resp_data
    const API = import.meta.env.VITE_API_URL
    const data = axios.get(API + url, {
      headers: { authorization: `Bearer ${token}` },
    })
    data.then((response) => {
      resp_data = response.data
      resolve(resp_data)
    })
    data.catch((err) => {
      const values = {
        refresh_token: refresh_token,
      }
      axios
        .get(API + 'auth/refresh', { headers: { 'jwt-refresh': refresh_token } })
        .then((response) => {
          err.value = response.data.error
          if (err.value) {
            reject(err.value)
          } else {
            token = response.data.access_token
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('refresh_token', response.data.refresh_token)
            const data = axios.get(API + url, {
              headers: { authorization: `Bearer ${token}` },
            })
            data
              .then((response) => {
                resp_data = response.data
                console.log(resp_data)
                resolve(resp_data)
              })
              .catch((response) => {
                resolve(undefined)
              })
          }
        })
    })
  })
}

export const auth_post = (url, values) => {
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token')
    const refresh_token = localStorage.getItem('refresh_token')
    var resp_data
    const API = import.meta.env.VITE_API_URL
    const data = axios.post(API + url, values, {
      headers: { authorization: `Bearer ${token}` },
    })
    data.then((response) => {
      resp_data = response.data
      resolve(resp_data)
    })
    data.catch((err) => {
      const values = {
        refresh_token: refresh_token,
      }
      axios
        .get(API + 'auth/refresh', { headers: { 'jwt-refresh': refresh_token } })
        .then((response) => {
          err.value = response.data.error
          if (err.value) {
            reject(err.value)
          } else {
            token = response.data.access_token
            localStorage.setItem('token', response.data.access_token)
            localStorage.setItem('refresh_token', response.data.refresh_token)
            const data = axios.post(API + url, values, {
              headers: { authorization: `Bearer ${token}` },
            })
            data.then((response) => {
              resp_data = response.data
              console.log(resp_data)
              resolve(resp_data)
            })
          }
        })
    })
  })
}
