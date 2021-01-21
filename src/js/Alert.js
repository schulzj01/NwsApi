import Base from './Base.js';


export default class Alert extends Base  {
	
	constructor(filters,options) {
		super();
		this._queryUrl = 'https://api.weather.gov/alerts';
		//this._activeUrl = '/active'
		//this._zoneUrl = '/zone';
		this._requestRetryLimit = 4;
		this._requestRetryTimeout = 4000; //4000;
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

	async getAll(callback,...args){
		let url = this.buildGetUrl(this._queryUrl,this._filters);

		try {
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit);
			let json = await response.json();
			this.returnObj.updated = new Date(json.updated);
			this.returnObj.features = json.features;
		} 
		catch {
			console.error('NWS API Unavailable or Bad Request: ' + url); 
			this.returnObj = false;
		}
		if (callback) { callback(this.returnObj,...args); }
		else { return this.returnObj; }			
	};

}
