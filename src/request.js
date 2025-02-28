import axios from 'axios'

export const auth_get = (url, api = undefined) => {
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token')
    const refresh_token = localStorage.getItem('refresh_token')
    var resp_data
    var API = import.meta.env.VITE_API_URL
    const data = axios.get((api ? api : API) + url, {
      headers: { authorization: `Bearer ${token}` },
    })
    data.then((response) => {
      resp_data = response.data
      resolve(resp_data)
    })
    data.catch((err) => {
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
            const data = axios.get((api ? api : API) + url, {
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

export const auth_post = (url, values, api = undefined, headers = undefined) => {
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token')
    const refresh_token = localStorage.getItem('refresh_token')
    var API = import.meta.env.VITE_API_URL
    var resp_data
    var header
    if (headers) {
      header = { authorization: `Bearer ${token}`, 'Content-Type': headers }
    } else {
      header = { authorization: `Bearer ${token}` }
    }
    const data = axios.post((api ? api : API) + url, values, {
      headers: header,
    })
    data.then((response) => {
      resp_data = response.data
      resolve(resp_data)
    })
    data.catch((err) => {
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
            token = localStorage.getItem('token')
            if (headers) {
              header = { authorization: `Bearer ${token}`, 'Content-Type': headers }
            } else {
              header = { authorization: `Bearer ${token}` }
            }
            const data = axios.post((api ? api : API) + url, values, {
              headers: header,
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
export const auth_delete = (url, api = undefined, headers = undefined) => {
  return new Promise((resolve, reject) => {
    var token = localStorage.getItem('token')
    const refresh_token = localStorage.getItem('refresh_token')
    var resp_data
    var API = import.meta.env.VITE_API_URL
    var header
    if (headers) {
      header = { authorization: `Bearer ${token}`, 'Content-Type': headers }
    } else {
      header = { authorization: `Bearer ${token}` }
    }
    const data = axios.delete((api ? api : API) + url, {
      headers: header,
    })
    data.then((response) => {
      resp_data = response.data
      resolve(resp_data)
    })
    data.catch((err) => {
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
            token = localStorage.getItem('token')
            if (headers) {
              header = { authorization: `Bearer ${token}`, 'Content-Type': headers }
            } else {
              header = { authorization: `Bearer ${token}` }
            }
            const data = axios.delete((api ? api : API) + url, {
              headers: header,
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
