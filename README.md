A wrapper on top of the NWS API to speed up queries.


# Install dependencies 
```
npm install
```

# Development
```
npm start
```
Open brower to localhost:8080


# Build

Comment out the require('./development.js'); line in index.js
```
npm run build
```

# Usage

Code hosted at https://www.weather.gov/source/wrh/NwsApi/NwsApi-1.1.0.js

## Instantiating

Products: 
`let myProduct = new NwsApi.Product(filters);`

Forecasts:
`let myForecast = new NwsApi.Forecast(lat, lon, filters)`

Alerts: 
`let myAlert = new NwsApi.Alert(filters)`

Zones: 
```let myZone = new NwsApi.Zone(zoneType,filters)
//Available zoneTypes : land, marine, forecast, public, coastal, offshore, fire, county
```

## Filtering

Using the classes is fairly straight forward and filtering options for classes matches the API queries: https://www.weather.gov/documentation/services-web-api#/

For example the Products class takes no arguments except for the filter you want.  These filterable options can be found on the documentation for the /products API using the link above. The /products URL in the API lists 7 filtering options (location,start,end,office,wmoid,type,limit), and all of these can be used by using the URL parameter as the filter object key.


``` 
let filters = {
  location: [], //Location id,
  start: '', //Start time
  end: '', //End time
  office: [], //Issuing office
  wmoid: [], WMO id code
  type: [], Product code (found via https://www.weather.gov/api/products/types)
  limit: 10, Limit
}
let product = NwsApi.Product(filters)
```


# Examples

```
function myCallback(apiOutput){
  console.log(apiOutput);
}

//Get all NWS AFDs
let myProduct = new NwsApi.Product({ type: 'AFD'  });
myProduct.getAll(myCallback);

//Get all AFDs from PIH
let myProduct2 = new NwsApi.Product({ type: 'AFD', office: 'PIH' });
myProduct2.getAll(myCallback);

//Get latest AFD from PIH
let myProduct3 = new NwsApi.Product({ type: 'AFD', office: 'PIH', limit: 1 });
myProduct3.getAll(myCallback); 

//Get Summary Forecast for 45.0 latitude, -125.0 longitude.
let myForecast1 = new NwsApi.Forecast(45.0,-125.0)
myForecast1.getSummaryForecast(myCallback);

//Get Raw Forecast for 45.0 latitude, -125.0 longitude.
let myForecast2 = new NwsApi.Forecast(45.0,-125.0)
myForecast2.getRawForecast(myCallback);

//Get all 3 forecasts types for 45.0 latitude, -125.0 longitude.
let myForecast3 = new NwsApi.Forecast(45.0,-125.0)
myForecast3.getForecasts(['raw','hourly','summary'],myCallback);

//Get all active alerts for 45.0 latitude, -125.0 longitude.
let myAlert1 = new NwsApi.Alert({ area: 'ID', active: true })
myAlert1.getAll(myCallback);

//Get all active red flag warnings.
let myAlert3 = new NwsApi.Alert({ event: 'Red Flag Warning', active:true})
myAlert3.getAll(myCallback);

//Get all Idaho fire zones.
let myZone1 = new NwsApi.Zone('fire', {area: 'ID'})
myZone1.getAll(myCallback);

//Get public zone information for 45.0 latitude, -125.0 longitude.
let myZone2 = new NwsApi.Zone('forecast', {area: 'ID'})
myZone2.getAll(myCallback);

//Get all Western Region marine zones with geometries.
let myZone3 = new NwsApi.Zone('marine', {region: 'WR', include_geometry:true })
myZone3.getAll(myCallback);


```