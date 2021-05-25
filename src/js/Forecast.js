import Base from './Base.js';

export default class Forecast extends Base  {
	constructor(lat,lon) {
		super();
		this._baseUrl = 'https://api.weather.gov/';
		this._pointMetadataUrl = 'points/';
		this._gridpointsUrl = 'gridpoints/';
		this._fcstHourlyUrl = 'forecast/hourly';
		this._fcstSummaryUrl = 'forecast';

		this._lat = lat;
		this._lon = lon;

		this._pointMetadata = null;
		this._rawForecast = null;
		this._summaryForecast = null;
		this._hourlyForecast = null;
	}
	//Outside callable function to return the raw forecast
	async getRawForecast(callback,...args){
		if (!this._rawForecast){ await this.queryRawForecast(); }
		if (callback)  { callback(this._rawForecast,...args); }
		else { return this._rawForecast; }
	}
	//Outside callable function to return the hourly forecast
	async getHourlyForecast(callback,...args){
		if (!this._hourlyForecast){ await this.queryHourlyForecast(); }
		if (callback)  { callback(this._hourlyForecast,...args); }
		else { return this._hourlyForecast; }
	}
	//Outside callable function to return the summary forecast
	async getSummaryForecast(callback,...args){
		if (!this._summaryForecast){ await this.querySummaryForecast(); }
		if (callback)  { callback(this._summaryForecast,...args); }
		else { return this._summaryForecast; }
	}
	
	//Outside callable function to return multiple forecast types at once.
	async getForecasts(types,callback,...args) {
		let forecastData = {}
		if (types.includes('raw')) { forecastData['raw'] = await this.getRawForecast(); }
		if (types.includes('hourly')) { forecastData['hourly'] = await this.getHourlyForecast(); }
		if (types.includes('summary')) { forecastData['summary'] = await this.getSummaryForecast(); }
		if (callback)  { callback(forecastData,...args); }
		else { return forecastData }
	}

	//Callable from outside, but mainly used just inside this class.  I've added shortcut outside callable functions below for must metadata use cases 
	async getMetaData(){
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		return this._pointMetadata; 
	}
	
	get gridX() { return this._pointMetadata.properties.gridX; }
	get gridY() { return this._pointMetadata.properties.gridY; }
	get cwa() { return this._pointMetadata.properties.cwa; }
	get relativeLocation() { return this._pointMetadata.properties.relativeLocation}
	get humanLocation(){
		let meters = this.relativeLocation.properties.distance.value;
		let degrees = this.relativeLocation.properties.bearing.value;
		let city = this.relativeLocation.properties.city;
		let state = this.relativeLocation.properties.state;
		//Only display distance and direction if > 5 km from city.
		let locationName = ''
		if (meters > 5000) { 
			let directions = ['N','NNW','NW','WNW','W','WSW','SW','SSW','S','SSE','SE','ESE','E','ENE','NE','NNE'];
			let direction = directions[Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16];
			//convert our meters to miles, cause 'merica
			let distance = parseInt(0.000621371 * meters); 
			locationName+= `${distance}mi ${direction} of `;
		}
		locationName+= `${city}, ${state}`; 
		return locationName;
	}

	async queryPointMetadata() {
		var url = this._baseUrl+this._pointMetadataUrl+this._lat+','+this._lon;
		try { 
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit); 
			this._pointMetadata = await response.json();
		}	
		catch { throw new Error(`Unable to load API Metadata from ${url}`); }		
	};
	async queryRawForecast(callback,...args) {	
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.cwa+'/'+this.gridX+','+this.gridY
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			this._rawForecast = await response.json();
		}
		catch { throw new Error(`Unable to load Raw Forecast from ${url}`); }
	}
	async queryHourlyForecast(callback,...args) {
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.cwa+'/'+this.gridX+','+this.gridY+'/'+this._fcstHourlyUrl;
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			const json = await response.json();
			this._hourlyForecast = json 
		}
		catch { throw new Error(`Unable to load Hourly Forecast from ${url}`); }
	}
	async querySummaryForecast(callback,...args) {
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.cwa+'/'+this.gridX+','+this.gridY+'/'+this._fcstSummaryUrl;
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			const json = await response.json();
			this._summaryForecast = json 
		}
		catch { throw new Error(`Unable to load Summary Forecast from ${url}`); }
	}

	async getRawWeatherDataBetweenPeriods(element,startDate,endDate){
		if (!this._rawForecast){ await this.getRawForecast();	}
		let rawFcstData = this._rawForecast.properties[element].values;
		let hourlyFcstData = [];
		let validHourlyFcstData = [];
		let calcMethod = false;
		if (element == 'quantitativePrecipitation') { calcMethod = 'split'; }
		rawFcstData.forEach( rawFcst => {
			
			hourlyFcstData = hourlyFcstData.concat(this.hourlyForecastFromRaw(rawFcst,calcMethod));
		});
		
		validHourlyFcstData = hourlyFcstData.filter((fcst) => {
			if ((fcst.startDate >= startDate) && (fcst.endDate <= endDate)) { return true; }
		})
		return validHourlyFcstData;
	}
	
/*	hourlyTimesBetween(startDate,endDate){
		let desiredForecastDates = [];
		let hourlyDate = startDate; 
		while (hourlyDate < endDate){
			desiredForecastDates.push(new Date(hourlyDate))
			hourlyDate = new Date(hourlyDate.setHours(hourlyDate.getHours() + 1));
		}
		return desiredForecastDates;
	}*/

/*	hourlyForecastFromRaw(wxData,calc){
		let wxDataTimePeriod = this.decodeRawForecastTimePeriod(wxData.validTime)
		let hourlyForecastData = [];
		let hourlyDate = wxDataTimePeriod.startDate;
		let hourlyValue;
		if (calc == 'split') { hourlyValue = wxData.value / wxDataTimePeriod.duration; }
		else { hourlyValue = wxData.value; }
		while (hourlyDate < wxDataTimePeriod.endDate){
			let hourlyStartDate = new Date(hourlyDate);
			hourlyDate = new Date(hourlyDate.setHours(hourlyDate.getHours() + 1))
			let hourlyEndDate = new Date(hourlyDate); 
			hourlyForecastData.push({
				startDate : hourlyStartDate,
				endDate : hourlyEndDate,
				value : hourlyValue
			})
		}
		return hourlyForecastData;
	}
	

	decodeRawForecastTimePeriod(validTime){
		let start = validTime.split('/')[0];
		let duration = validTime.split('/')[1];
		duration = parseInt(duration.substring(duration.lastIndexOf("T") + 1,duration.lastIndexOf("H")))
		let startDate = new Date(start);
		let endDate = new Date(start);
		endDate.setHours(endDate.getHours()+duration);
		return {"startDate": startDate, "endDate": endDate, "duration": duration };
	}*/



	
//		const summaryFcst = await this.summarhyForecast();
//		if (!this._pointMetadata){ await this.apiPointMetaData();	}
//		var url = this._baseUrl+this._gridpointsUrl+this._cwa+'/'+this._gridX+','+this._gridY+'/'+this._fcstSummaryUrl;
//		const response = await fetch(url)
//		const json = await response.json();
//		callback(json,...args)
//	}

}