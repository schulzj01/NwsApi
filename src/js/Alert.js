import Base from './Base.js';

/**
 *  A class to handle alert queries to the NWS API. Once this class has been instantiated,
 *  you can query the alerts with either the getAll() or getByCwa()  methods.
 *  Filters can be found: https://www.weather.gov/documentation/services-web-api#/default/alerts_query
 *  @param {Object} filters - A key value pair set of filters for the Alerts query.
 *  @param {Object} options - placeholder for now
 *
 */
export default class Alert extends Base  {

	constructor(filters,options) {
		super();
		this._queryUrl = 'https://api.weather.gov/alerts';
		//this._activeUrl = '/active'
		//this._zoneUrl = '/zone';

		this._filters = {
			active : null,
			start : null,
			end : null,
			status : null,
			message_type : null,
			event : null,
			code : null,
			region_type : null,
			point : null,
			region : null,
			area : null,
			zone : null,
			urgency : null,
			certainty : null,
			severity : null,
			limit : null,
			cursor : null,
			product : null,
			siteid : null,
			zone : null,
			county : null,
			latlon : null,
			//newprop : null,
		}
		this.returnObj = {
			updated : null,
			features : null
		}
		this._filters = Object.assign(this._filters, filters);   // Could also just do "addedBack.comments = Comments.comments;" if you only care about this one property
	};

	/**
	 * Get alerts for the specified filters in the class.
	 * @param {Function} callback - A callback to handle the alerts.
	 * @param  {args} args - Any further arguments passed to this function go through to the callback
	 * @returns {Object} - An object with a date of when the query was updated, the features as an array, as well as the resultant type
	 */
	async getAll(callback,...args){
		let url = this.buildGetUrl(this._queryUrl,this._filters);
		try {
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit);
			let json = await response.json();
			this.returnObj.updated = new Date(json.updated);
			this.returnObj.features = json.features;
			this.returnObj.type = json.type;
		}
		catch {
			console.error('NWS API Unavailable or Bad Request: ' + url);
			this.returnObj = false;
		}
		if (callback) { callback(this.returnObj,...args); }
		else { return this.returnObj; }
	};
	/**
	 * Get alerts for the specified filters in the class, but only return results by CWA.  The API doesn't provide a filter to only get alerts by office, so add this as an option.
	 * @param {String[]} cwas - three digit office identifier. This can be an array or just a single string.
	 * @param {Function} callback - A callback to handle the alerts.
	 * @param  {args} args - Any further arguments passed to this function go through to the callback
	 * @returns {Object} - An object with a date of when the query was updated, the features as an array, as well as the resultant type
	 */
	async getByCwa(cwas,callback,...args){
		await this.getAll();
		//If we only have a single cwa as a string, make sure it's an array so it's compatible with prior versions
		if (!Array.isArray(cwas)) { cwas = [cwas]; }
		let CWAS = cwas.map(cwa => cwa.toUpperCase());

		//Alaska CWAs actually use different PILS, so include that workaround here:
		if (CWAS.includes('AFC')) { CWAS.push('ALU','AER'); }
		if (CWAS.includes('AFG')) { CWAS.push('WCZ'); }

		let filteredFeatures = this.returnObj.features.filter(feature => {
			let featCwa;
			let pil = feature?.properties?.parameters?.PIL?.[0];
			let awipsId = feature?.properties?.parameters?.AWIPSidentifier?.[0]
			if (pil){ featCwa = pil.substr(6,3); }
			else if (awipsId){ featCwa = awipsId.substr(3,3); }
			return CWAS.includes(featCwa);
		});
		let filteredObj = {
			updated : this.returnObj.updated,
			features : filteredFeatures
		};
		if (callback) { callback(filteredObj,...args); }
		else { return filteredObj; }
	}
}
