
export default class Base { 
	constructor(){
	}

  //retrys a promise multiple times with a timeout in order to deal with failed requests to the API.
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

	async retryFetchAllJson(urls,options,wait,numTries) { 
		return await Promise.all(
			urls.map(async url => {
				const response = await this.retryFetch(url,options,wait,numTries);
				return response.json();
			})
		)
	}


	async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
	};


  //Build URL from all parameters
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