import { request } from './api';

class VehiclelinkApi {
  constructor(host, bearerToken) {
    this.host = host;
    this.bearerToken = bearerToken;
  }

  makeGetRequest() {
    return {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };
  }

  fetchMakes() {
    const url = `${this.host}/makes`;
    return request(url, this.makeGetRequest());
  }

  fetchFamilies(makeCode) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    const url = `${this.host}/families?${params}`;
    return request(url, this.makeGetRequest());
  }

  fetchVehicles(makeCode, familyCode, bodyStyleDescription) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    params.append('family_code', familyCode);
    params.append('body_style_description', bodyStyleDescription);
    const url = `${this.host}/vehicles?${params}`;
    return request(url, this.makeGetRequest());
  }
}

export { VehiclelinkApi as default };
