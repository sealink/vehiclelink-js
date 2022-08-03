import { request } from './api';

class VehiclelinkApi {
  constructor(host, bearerToken) {
    this.host = host;
    this.bearerToken = bearerToken;
  }

  makeGetRequest(opts) {
    let request = {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.bearerToken}`,
      },
    };
    if (opts.signal) {
      request.signal = opts.signal;
    }
    return request;
  }

  fetchSegments(opts = {}) {
    const url = `${this.host}/segments`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchMakes(segmentCode, opts = {}) {
    const url = `${this.host}/segments/${segmentCode}/makes`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchFamilies(segmentCode, makeCode, opts = {}) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    const url = `${this.host}/segments/${segmentCode}/families?${params}`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchVehicles(segmentCode, makeCode, familyCode, bodyStyleCode, opts = {}) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    params.append('family_code', familyCode);
    params.append('body_style_code', bodyStyleCode);

    const { sizeUnit, weightUnit, orderBy, orderDirection } = opts;

    if (sizeUnit) {
      params.append('size_unit', sizeUnit);
    }
    if (weightUnit) {
      params.append('weight_unit', weightUnit);
    }
    if (orderBy) {
      params.append('order_by', orderBy);
    }
    if (orderDirection) {
      params.append('order_direction', orderDirection);
    }
    const url = `${this.host}/segments/${segmentCode}/vehicles?${params}`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchVariant(segmentCode, variantCode, opts = {}) {
    const url = `${this.host}/segments/${segmentCode}/variants/${variantCode}`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchVariants(
    segmentCode,
    makeCode,
    familyCode,
    bodyStyleCode,
    yearCode,
    opts = {}
  ) {
    const params = new URLSearchParams();
    params.append('make_code', makeCode);
    params.append('family_code', familyCode);
    params.append('body_style_code', bodyStyleCode);
    params.append('year_code', yearCode);

    const { sizeUnit, weightUnit, seatCapacity } = opts;

    if (sizeUnit) {
      params.append('size_unit', sizeUnit);
    }
    if (weightUnit) {
      params.append('weight_unit', weightUnit);
    }
    if (seatCapacity) {
      params.append('seat_capacity', seatCapacity);
    }

    const url = `${this.host}/segments/${segmentCode}/variants?${params}`;
    return request(url, this.makeGetRequest(opts));
  }

  fetchAttachments(opts = {}) {
    const { sizeUnit, weightUnit } = opts;

    const params = new URLSearchParams();
    if (sizeUnit) {
      params.append('size_unit', sizeUnit);
    }
    if (weightUnit) {
      params.append('weight_unit', weightUnit);
    }
    const url = `${this.host}/attachments?${params}`;
    return request(url, this.makeGetRequest(opts));
  }
}

export { VehiclelinkApi as default };
