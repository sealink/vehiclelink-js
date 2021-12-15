[![npm version](https://badge.fury.io/js/%40sealink%2Fvehiclelink.svg)](https://badge.fury.io/js/%40sealink%2Fvehiclelink)
[![Coverage Status](https://coveralls.io/repos/github/sealink/vehiclelink-js/badge.svg?branch=master)](https://coveralls.io/github/sealink/vehiclelink-js?branch=master)
[![Build Status](https://github.com/sealink/vehiclelink-js/workflows/Build%20and%20Test/badge.svg?branch=master)](https://github.com/sealink/vehiclelink-js/actions)

### Why

Provides a wrapper api which hides the underlying vehiclelink services.

### VehiclelinkApi

- fetchSegments
- fetchMakes
- fetchfamilies
- fetchVehicles

### Deployment

Build / Deployment is handled via Github actions.
Package management is via NPM.

First create the release branch

```
git branch release/0.1.0
```

Second Update package.json and specify the version you are releasing

Next Tag and push to github

```
git tag v0.1.0
git push origin master --tags
```

Remember to merge changes back to the master branch
