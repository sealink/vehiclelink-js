const { default: VehiclelinkApi } = require('../lib/vehiclelinkApi');
const nock = require('nock');

const host = 'http://127.0.0.1:8000';
const bearerToken = 'bearerToken';
const configHeaders = {
  'Content-Type': 'application/json',
  authorization: `Bearer ${bearerToken}`,
};

describe('errorHandling', () => {
  beforeEach(() => {
    nock(host, { reqHeaders: configHeaders }).get('/segments').reply(500, []);

    nock(host, { reqHeaders: configHeaders })
      .get('/segments/vehicles/makes')
      .reply(422, { error: 'Test error' });

    nock(host, { reqHeaders: configHeaders })
      .get('/segments/vehicles/families?make_code=TOYO')
      .reply(500, []);

    nock(host, { reqHeaders: configHeaders })
      .get(
        '/segments/vehicles/vehicles?make_code=TOYO&family_code=PRADO&body_style_code=STYLE_1'
      )
      .reply(500, []);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should handle errors when fetch segments', (done) => {
    new VehiclelinkApi(host, bearerToken).fetchSegments().catch((err) => {
      expect(err.response.status).toEqual(500);
      done();
    });
  });

  it('should handle errors when fetch makes', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchMakes('vehicles')
      .catch((err) => {
        expect(err.response.status).toEqual(422);
        done();
      });
  });

  it('should handle errors when fetch families', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchFamilies('vehicles', 'TOYO')
      .catch((err) => {
        expect(err.response.status).toEqual(500);
        done();
      });
  });

  it('should handle errors when fetch vehicles', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVehicles('vehicles', 'TOYO', 'PRADO', 'STYLE_1')
      .catch((err) => {
        expect(err.response.status).toEqual(500);
        done();
      });
  });
});

describe('fetchSegments', () => {
  beforeEach(() => {
    const segmentsResults = [
      { code: 'vehicles', description: 'Redbook Light Vehicles' },
      { code: 'caravans', description: 'Redbook Caravans' },
      { code: 'marine', description: 'Redbook Marine' },
    ];

    nock(host, { reqHeaders: configHeaders })
      .get('/segments')
      .reply(200, segmentsResults);
  });

  it('should return a hash of segments', (done) => {
    new VehiclelinkApi(host, bearerToken).fetchSegments().then((segments) => {
      expect(segments).toHaveLength(3);
      expect(segments[0].description).toEqual('Redbook Light Vehicles');
      expect(segments[1].code).toEqual('caravans');
      done();
    });
  });
});

describe('fetchMakes', () => {
  beforeEach(() => {
    const makesResults = [
      { code: 'TOYO', description: 'Toyota' },
      { code: 'MAZD', description: 'Mazda' },
    ];

    nock(host, { reqHeaders: configHeaders })
      .get('/segments/vehicles/makes')
      .reply(200, makesResults);
  });

  it('should return a hash of makes', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchMakes('vehicles')
      .then((makes) => {
        expect(makes).toHaveLength(2);
        expect(makes[0].description).toEqual('Toyota');
        expect(makes[1].description).toEqual('Mazda');
        done();
      });
  });
});

describe('fetchFamilies', () => {
  beforeEach(() => {
    const familiesResults = [
      {
        id: 1,
        code: 'PRADO',
        make_code: 'TOYO',
        description: 'PRADO',
        body_styles: [
          { code: 'STYLE_1', description: 'Style 1' },
          { code: 'STYLE_2', description: 'Style 2' },
        ],
      },
      {
        id: 2,
        code: 'LANDCRU',
        make_code: 'TOYO',
        description: 'LANDCRU',
        body_styles: [],
      },
    ];

    nock(host, { reqHeaders: configHeaders })
      .get('/segments/vehicles/families?make_code=TOYO')
      .reply(200, familiesResults);
  });

  it('should return a hash of families', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchFamilies('vehicles', 'TOYO')
      .then((families) => {
        expect(families).toHaveLength(2);
        expect(families[0].description).toEqual('PRADO');
        expect(families[0].body_styles).toHaveLength(2);
        expect(families[1].description).toEqual('LANDCRU');
        done();
      });
  });
});

describe('fetchVehicles', () => {
  beforeEach(() => {
    const vehiclesResults = [
      {
        id: 1,
        make_code: 'TOYO',
        family_code: 'PRADO',
        body_style_code: 'STYLE_1',
        length_value: '5100',
        width_value: '1600',
        height_value: '2000',
        size_unit: 'mm',
        weight_value: '1200',
        weight_unit: 'kg',
        start_year: '1990',
        end_year: '2010',
      },
    ];

    const vehiclesResultsWithDifferentUnits = [
      {
        id: 1,
        make_code: 'TOYO',
        family_code: 'PRADO',
        body_style_code: 'STYLE_1',
        length_value: '5.1',
        width_value: '1.6',
        height_value: '2.0',
        size_unit: 'm',
        weight_value: '1.2',
        weight_unit: 't',
        start_year: '1990',
        end_year: '2010',
      },
    ];

    const params = new URLSearchParams();
    params.append('make_code', 'TOYO');
    params.append('family_code', 'PRADO');
    params.append('body_style_code', 'STYLE_1');

    const paramsWithUnits = new URLSearchParams();
    paramsWithUnits.append('make_code', 'TOYO');
    paramsWithUnits.append('family_code', 'PRADO');
    paramsWithUnits.append('body_style_code', 'STYLE_1');
    paramsWithUnits.append('size_unit', 'm');
    paramsWithUnits.append('weight_unit', 't');

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/vehicles?${params}`)
      .reply(200, vehiclesResults);

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/vehicles?${paramsWithUnits}`)
      .reply(200, vehiclesResultsWithDifferentUnits);
  });

  it('should return a hash of vehicles', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVehicles('vehicles', 'TOYO', 'PRADO', 'STYLE_1')
      .then((vehicles) => {
        expect(vehicles).toHaveLength(1);
        expect(vehicles[0].length_value).toEqual('5100');
        expect(vehicles[0].size_unit).toEqual('mm');
        done();
      });
  });

  it('should return a hash of vehicles with different units', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVehicles('vehicles', 'TOYO', 'PRADO', 'STYLE_1', 'm', 't')
      .then((vehicles) => {
        expect(vehicles).toHaveLength(1);
        expect(vehicles[0].length_value).toEqual('5.1');
        expect(vehicles[0].size_unit).toEqual('m');
        expect(vehicles[0].weight_value).toEqual('1.2');
        expect(vehicles[0].weight_unit).toEqual('t');
        done();
      });
  });
});

describe('fetchVariant', () => {
  beforeEach(() => {
    const variantResult = {
      id: 1,
      make_code: 'TOYO',
      family_code: 'PRADO',
      body_style_code: 'STYLE_1',
      length_value: '5100',
      width_value: '1600',
      height_value: '2000',
      size_unit: 'mm',
      weight_value: '1200',
      weight_unit: 'kg',
      year_code: '2010',
      description: 'Variant 1',
      variant_code: 'PRADO',
    };

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/variants/PRADO`)
      .reply(200, variantResult);
  });

  it('should return the variant', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVariant('vehicles', 'PRADO')
      .then((vehicle) => {
        expect(vehicle.length_value).toEqual('5100');
        expect(vehicle.size_unit).toEqual('mm');
        done();
      });
  });
});

describe('fetchVariants', () => {
  beforeEach(() => {
    const variantResults = [
      {
        id: 1,
        make_code: 'TOYO',
        family_code: 'PRADO',
        body_style_code: 'STYLE_1',
        length_value: '5100',
        width_value: '1600',
        height_value: '2000',
        size_unit: 'mm',
        weight_value: '1200',
        weight_unit: 'kg',
        year_code: '2010',
        description: 'Variant 1',
        variant_code: 'CODE_1',
      },
    ];

    const variantResultsWithDifferentUnits = [
      {
        id: 1,
        make_code: 'TOYO',
        family_code: 'PRADO',
        body_style_code: 'STYLE_1',
        length_value: '5.1',
        width_value: '1.6',
        height_value: '2.0',
        size_unit: 'm',
        weight_value: '1.2',
        weight_unit: 't',
        year_code: '2010',
        description: 'Variant 1',
        variant_code: 'CODE_1',
      },
    ];

    const params = new URLSearchParams();
    params.append('make_code', 'TOYO');
    params.append('family_code', 'PRADO');
    params.append('body_style_code', 'STYLE_1');
    params.append('year_code', '2010');

    const paramsWithUnits = new URLSearchParams();
    paramsWithUnits.append('make_code', 'TOYO');
    paramsWithUnits.append('family_code', 'PRADO');
    paramsWithUnits.append('body_style_code', 'STYLE_1');
    paramsWithUnits.append('year_code', '2010');
    paramsWithUnits.append('size_unit', 'm');
    paramsWithUnits.append('weight_unit', 't');

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/variants?${params}`)
      .reply(200, variantResults);

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/variants?${paramsWithUnits}`)
      .reply(200, variantResultsWithDifferentUnits);
  });

  it('should return a hash of variants', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVariants('vehicles', 'TOYO', 'PRADO', 'STYLE_1', '2010')
      .then((vehicles) => {
        expect(vehicles).toHaveLength(1);
        expect(vehicles[0].length_value).toEqual('5100');
        expect(vehicles[0].size_unit).toEqual('mm');
        done();
      });
  });

  it('should return a hash of variants with different units', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVariants(
        'vehicles',
        'TOYO',
        'PRADO',
        'STYLE_1',
        '2010',
        null,
        'm',
        't'
      )
      .then((vehicles) => {
        expect(vehicles).toHaveLength(1);
        expect(vehicles[0].length_value).toEqual('5.1');
        expect(vehicles[0].size_unit).toEqual('m');
        expect(vehicles[0].weight_value).toEqual('1.2');
        expect(vehicles[0].weight_unit).toEqual('t');
        done();
      });
  });
});

describe('requestOptionsHandling', () => {
  const controller = new AbortController();
  const { signal } = controller;

  beforeEach(() => {
    nock(host).get('/segments').delay(10000).reply(200, `Passed`);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should abort request', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchSegments({ signal })
      .catch((err) => {
        expect(err).toEqual(new Error('The user aborted a request.'));
        done();
      });
    controller.abort();
  });
});

describe('fetchAttachments', () => {
  beforeEach(() => {
    const attachmentResults = [
      {
        id: 1,
        description: 'Roof Cargo - under 30cm high',
        category_id: 'roof',
        length_value: '0',
        height_value: '30',
        width_value: '0',
        size_unit: 'cm',
        weight_value: '30',
        weight_unit: 'kg',
      },
      {
        id: 3,
        description: 'Bull Bar',
        category_id: 'rear',
        length_value: '35',
        height_value: '0',
        width_value: '0',
        size_unit: 'cm',
        weight_value: '40',
        weight_unit: 'kg',
      },
    ];

    const attachmentResultsWithDifferentUnit = [
      {
        id: 1,
        description: 'Roof Cargo - under 30cm high',
        category_id: 'roof',
        length_value: '0',
        height_value: '0.3',
        width_value: '0',
        size_unit: 'm',
        weight_value: '0.03',
        weight_unit: 't',
      },
    ];

    const paramsWithUnits = new URLSearchParams();
    paramsWithUnits.append('size_unit', 'm');
    paramsWithUnits.append('weight_unit', 't');

    nock(host, { reqHeaders: configHeaders })
      .get('/attachments?')
      .reply(200, attachmentResults);

    nock(host, { reqHeaders: configHeaders })
      .get(`/attachments?${paramsWithUnits}`)
      .reply(200, attachmentResultsWithDifferentUnit);
  });

  it('should return an array of vehicle attachments', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchAttachments()
      .then((attachments) => {
        expect(attachments).toHaveLength(2);
        expect(attachments[0].height_value).toEqual('30');
        expect(attachments[0].size_unit).toEqual('cm');
        expect(attachments[1].weight_value).toEqual('40');
        expect(attachments[1].weight_unit).toEqual('kg');
        done();
      });
  });

  it('should return an array of vehicle attachments with different units', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchAttachments('m', 't')
      .then((attachments) => {
        expect(attachments).toHaveLength(1);
        expect(attachments[0].height_value).toEqual('0.3');
        expect(attachments[0].size_unit).toEqual('m');
        expect(attachments[0].weight_value).toEqual('0.03');
        expect(attachments[0].weight_unit).toEqual('t');
        done();
      });
  });
});
