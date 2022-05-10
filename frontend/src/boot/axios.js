import axios from 'axios'
import { Notify } from 'quasar'

export default ({ Vue }) => {
  Vue.prototype.$axios = axios.create({
    baseURL: process.env.API,
    timeout: 30000,
    headers: {
      'Content-type': 'application/json'
    }
  })

  Vue.mixin(AxiosCatchMixin)
}

/**
 * Mixin Para tratamento do Axios
 */
const AxiosCatchMixin = {
  methods: {
    AxiosCatch (error) {
      console.error(error)
      Notify.create({
        message: error.response.data.error.message,
        type: 'negative'
      })
    }
  }
}
