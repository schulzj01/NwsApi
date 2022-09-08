import Base from './Base.js';

/**
 *  A class to handle forecast queries to the NWS API. Queries are generally by lat/lon so this class helps to save
 *  the extra query step of having to find the lat/lon via the gridpoints URI.  Once this class has bene instantiated,
 *  you can query the forecast with the get*Forecast methods.
 *  @param {Number} lat - latitude of the forecast point you need
 *  @param {Number} lon - longitude of the forecast point you need
 *
 */
export default class Forecast extends Base {

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
	/**
	 * Return the raw (all forecast data) from the API.  This can be called with a callback function to handle the results,
	 * or can be called as part of an async query, to return the data the data as a string.
	 * @param {Function} callback - callback function that will handle the requests.
	 * @param  {...any} args - additional arguments to pass to the callback function.
	 * @returns {Object} - Forecast data object
	 */
	async getRawForecast(callback,...args){
		if (!this._rawForecast){ await this.queryRawForecast(); }
		if (callback) { callback(this._rawForecast,...args); }
		else { return this._rawForecast; }
	}
	/**
	 * Return the hourly forecast data from the API.  This can be called with a callback function to handle the results,
	 * or can be called as part of an async query, to return the data the data as a string.
	 * @param {Function} callback - callback function that will handle the requests.
	 * @param  {...any} args - additional arguments to pass to the callback function.
	 * @returns {Object} - Forecast data object
	 */
	async getHourlyForecast(callback,...args){
		if (!this._hourlyForecast){ await this.queryHourlyForecast(); }
		if (callback) { callback(this._hourlyForecast,...args); }
		else { return this._hourlyForecast; }
	}
	/**
	 * Return the summary forecast data from the API.  This can be called with a callback function to handle the results,
	 * or can be called as part of an async query, to return the data the data as a string.
	 * @param {Function} callback - callback function that will handle the requests.
	 * @param  {...any} args - additional arguments to pass to the callback function.
	 * @returns {Object} - Forecast data object
	 */
	async getSummaryForecast(callback,...args){
		if (!this._summaryForecast){ await this.querySummaryForecast(); }
		if (callback) { callback(this._summaryForecast,...args); }
		else { return this._summaryForecast; }
	}

	/**
	 * Return a combination of forecast data types from the API.  This can be called with a callback function to handle the results,
	 * or can be called as part of an async query, to return the data the data as a string.
	 * @param {Array} types - An array of strings of raw,hourly,summary to represent which forecast types to return.
	 * @param {Function} callback - callback function that will handle the requests.
	 * @param  {...any} args - additional arguments to pass to the callback function.
	 * @returns {Object} - Forecast data object with other forecast types broken up as separate properties
	 */
	async getForecasts(types,callback,...args) {
		let forecastData = {}
		if (types.includes('raw')) { forecastData['raw'] = await this.getRawForecast(); }
		if (types.includes('hourly')) { forecastData['hourly'] = await this.getHourlyForecast(); }
		if (types.includes('summary')) { forecastData['summary'] = await this.getSummaryForecast(); }
		if (callback) { callback(forecastData,...args); }
		else { return forecastData }
	}

	/**
	 * Return the point metadata about a lat/lon point. Callable from outside, but mainly used just inside this class.
	 * I've added shortcut outside callable functions below for must metadata use cases
	 * @returns metadata on lat/lon point.
	 */
	async getMetaData(){
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		return this._pointMetadata;
	}

	get gridX() { return this._pointMetadata.properties.gridX; }
	get gridY() { return this._pointMetadata.properties.gridY; }
	get cwa() { return this._pointMetadata.properties.cwa; }
	get gridId() { return this._pointMetadata.properties.gridId; }
	get relativeLocation() { return this._pointMetadata.properties.relativeLocation}
	/**
	 * Retuns a human readable location instead of what's given by the API.
	 * @returns {String} Location name (i.e. 30mi N of Pocatello)
	 */
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

	/**
	 * Queries (and retries if necessary) the metadata for the lat/lon
	 */
	async queryPointMetadata() {
		var url = this._baseUrl+this._pointMetadataUrl+this._lat+','+this._lon;
		try {
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit);
			this._pointMetadata = await response.json();
			this.fix1x1GridMisalignment();
		}
		catch { throw new Error(`Unable to load API Metadata from ${url}`); }
	};
	/**
	 * Queries (and retries if necessary) the metadata for the raw forecast.
	 */
	async queryRawForecast(callback,...args) {
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.gridId+'/'+this.gridX+','+this.gridY
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			this._rawForecast = await response.json();
		}
		catch { throw new Error(`Unable to load Raw Forecast from ${url}`); }
	}
	/**
	 * Queries (and retries if necessary) the metadata for the hourly forecast.
	 */
	async queryHourlyForecast(callback,...args) {
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.gridId+'/'+this.gridX+','+this.gridY+'/'+this._fcstHourlyUrl;
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			const json = await response.json();
			this._hourlyForecast = json
		}
		catch { throw new Error(`Unable to load Hourly Forecast from ${url}`); }
	}
	/**
	 * Queries (and retries if necessary) the metadata for the summary forecast.
	 */
	async querySummaryForecast(callback,...args) {
		if (!this._pointMetadata){ await this.queryPointMetadata();	}
		try {
			var url = this._baseUrl+this._gridpointsUrl+this.gridId+'/'+this.gridX+','+this.gridY+'/'+this._fcstSummaryUrl;
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit)
			const json = await response.json();
			this._summaryForecast = json
		}
		catch { throw new Error(`Unable to load Summary Forecast from ${url}`); }
	}
	/**
	 * Helper function to return raw forecast data between forecast periods if desired.
	 */
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

	/**
	 * This addresses ServiceNow Ticket INC0317747. Certain WFO's data have a misalignment by 1 in the vertical
	 * and 1 in the horizontal.  This workaround subtracts the extra 1,1 grid that is affecting these sites
	 */
	fix1x1GridMisalignment(){
		let affectedCWAs = ['AFC','AER','ALU', 'AFG', 'AJK', 'BOX', 'CAE', 'DLH', 'HGX', 'HNX', 'LIX', 'LWX', 'MAF', 'MFR', 'MLB', 'MRX', 'MTR']
		if (affectedCWAs.includes(this._pointMetadata?.properties?.cwa)) {
			let props = this._pointMetadata.properties;
			let prevUrlText = `${props.gridX},${props.gridY}`;
			//decrement the grid values
			props.gridX--;
			props.gridY--;
			let newUrlText = `${props.gridX},${props.gridY}`;
			let urlPropsToChange = ['forecast','forecastGridData','forecastHourly','observationStations'];
			urlPropsToChange.forEach(prop => {
				props[prop] = (props[prop]) ? props[prop].replace(prevUrlText,newUrlText) : null
			})
		}
	}
}