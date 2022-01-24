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

    const params = new URLSearchParams();
    params.append('make_code', 'TOYO');
    params.append('family_code', 'PRADO');
    params.append('body_style_code', 'STYLE_1');

    nock(host, { reqHeaders: configHeaders })
      .get(`/segments/vehicles/vehicles?${params}`)
      .reply(200, vehiclesResults);
  });

  it('should return a hash of families', (done) => {
    new VehiclelinkApi(host, bearerToken)
      .fetchVehicles('vehicles', 'TOYO', 'PRADO', 'STYLE_1')
      .then((vehicles) => {
        expect(vehicles).toHaveLength(1);
        expect(vehicles[0].length_value).toEqual('5100');
        done();
      });
  });
});
