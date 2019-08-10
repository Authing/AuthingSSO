import axios from "axios";

class GraphQLClient {
  constructor(options) {
    const defaultOpt = {
      timeout: options.timeout || 8000,
      method: 'POST'
    };
    this.options = {
      ...defaultOpt,
      ...options
    };
  }

  request(data) {
    this.options.data = data;
    return axios(this.options).then((res) => {
      const d = res.data;
      if (d.errors) {
        throw d.errors[0];
      }
      return d.data;
    });
  }
}

export default GraphQLClient;
