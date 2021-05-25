import Base from './Base.js';


export default class Zone extends Base  {
	
	constructor(zoneType,filters,options) {
		super();
		this._queryUrl = 'https://api.weather.gov/zones';
		this._zoneType = zoneType;

		this._filters = {
			id : null,
			area : null,
			region : null,			
			point : null,
			include_geometry : null,
			limit : null,
			effective : null,
		}

		this.returnObj = {
			updated : null,
			features : null,
			type : null,
		}
		this._filters = Object.assign(this._filters, filters);   // Could also just do "addedBack.comments = Comments.comments;" if you only care about this one property
		//If our zone type isn't a correct option, error out.
		this._allowableZoneTypes = ['land','marine','forecast','public','coastal','offshore','fire','county']
		if (!this._allowableZoneTypes.includes(this._zoneType)) { throw new Error(`Zone type '${this._zoneType}' not valid.  Appropriate values are (${this._allowableZoneTypes.join('|')})`)}
	};

	async getAll(callback,...args){
		let zoneUrl = this._queryUrl+'/'+this._zoneType;
		let url = this.buildGetUrl(zoneUrl,this._filters);
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

}
