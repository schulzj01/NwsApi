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

Code hosted at https://www.weather.gov/wrh/NwsApi/NwsApi-1.1.0.js

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