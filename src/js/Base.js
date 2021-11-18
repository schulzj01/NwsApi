/**
 *  An abstract class for API queries with a few utility functions
 * 
 */
export default class Base { 
	constructor(){
		this._requestRetryLimit = 5;
		this._requestRetryTimeout = 4000; 
	}

	/**
	 * Retrys a promise multiple times with a timeout in between in order to deal with failed requests to the weather.gov API
	 * 
	 * @param {*} url - The query URL
	 * @param {*} options - Any fetch option such as headers, etc.
	 * @param {*} wait - The time in milliseconds to wait before retrying a failed query.
	 * @param {*} numTries - The number of times to retry the query before ultimately failing.
	 * @returns {Promise} Successful result of a query or throws an error if failed.
	 */
	async retryFetch(url, options, wait, numTries) {
		try {
			let response = await fetch(url, options);
			if (!response.ok) { throw new Error('Request to '+url+' failed: ' + response.statusText); }
			else { return response; }
		} catch(err) {
			if (numTries === 1) { throw err; }
			else { 
				await this.sleep(wait);
				return await this.retryFetch(url, options, wait, numTries - 1);	
			}
		}
	};
	/**
	 * Retries a fetch of URLS multiple time to return a json object of the data.  Think of a retrying Promise.all().
	 * 
	 * @param {*} url - An array of query URLs
	 * @param {*} options - Any fetch option such as headers, etc.
	 * @param {*} wait - The time in milliseconds to wait before retrying a failed query.
	 * @param {*} numTries - The number of times to retry the query before ultimately failing.
	 * @returns {JSON} - A json string of data of the results
	 */
	async retryFetchAllJson(urls,options,wait,numTries) { 
		return await Promise.all(
			urls.map(async url => {
				const response = await this.retryFetch(url,options,wait,numTries);
				return response.json();
			})
		)
	}

	/**
	 * A asyncronous sleep command to handle asynchronous timeouts 
	 * @param {Integer} ms - The time in milliseconds to sleep
	 * @returns {Promise} The original promise after a the specified wait period
	 */
	async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};


	/**
	 * Build a GET based query url using an object of string and array parameters instead of building out a query manually with a string.
	 * Example parameters: 
	 * let parameters = { 
	 * 	myQuery1 = 'myString',
	 *  myQuery2 = ['myArrayVal1','myArrayVal2']
	 * }
	 * Would give a url like  https://myUrl/index.html?myQuery1=myString&myQuery2=myArrayVal1,myArrayVal2
	 * @param {String} baseUrl - The url or api endpoint to query
	 * @param {Object} parameters - An key/value pair object with the parameters to query.
	 * @returns {URL} 
	 */
	buildGetUrl(baseUrl, parameters) {
		//Object.entries(obj).sort((a, b) => b[0].localeCompare(a[0]));
		let url = baseUrl+'?';
		for (let [k, v] of Object.entries(parameters)) {
				if (v !== null) {
					let parm = k;
					let val = '';
					if (Array.isArray(v)) { val = v.join(','); }
					else { val = v.toString(); }
					url += '&' + parm + '=' + val;
			}
		}
		url = encodeURI(url);
		return url;
	}	
}