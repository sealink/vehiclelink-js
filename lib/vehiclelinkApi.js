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

  fetchMakes(segmentCode) {
    const url = `${this.host}/segments/${segmentCode}/makes`;
    return request(url, this.makeGetRequest());
  }

  fetchFamilies(segmentCode, makeCode) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    const url = `${this.host}/segments/${segmentCode}/families?${params}`;
    return request(url, this.makeGetRequest());
  }

  fetchVehicles(segmentCode, makeCode, familyCode, bodyStyleDescription) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    params.append('family_code', familyCode);
    params.append('body_style_description', bodyStyleDescription);
    const url = `${this.host}/segments/${segmentCode}/vehicles?${params}`;
    return request(url, this.makeGetRequest());
  }
}

export { VehiclelinkApi as default };
