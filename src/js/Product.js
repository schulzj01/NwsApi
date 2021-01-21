import Base from './Base.js';

export default class Product extends Base  {
	
	constructor(filters,options) {
		super();
		this._queryUrl = 'https://api.weather.gov/products';
		//this._activeUrl = '/active'
		//this._zoneUrl = '/zone';
		this._requestRetryLimit = 4;
		this._requestRetryTimeout = 1000; //4000;
		this._getAllLimit = 25;
		this._filters = {
			location : null,
			start : null,
			end : null,
			office : null,
			wmoid : null,
			type : null,
			limit : null,
		}

		this._productListing = false;

		this.returnObj = {
			updated : null,
			features : null
		}
		this._filters = Object.assign(this._filters, filters);   // Could also just do "addedBack.comments = Comments.comments;" if you only care about this one property
	};


	async getFullProductListing(){
		let url = this.buildGetUrl(this._queryUrl,this._filters);
		try {
			const response = await this.retryFetch(url, null, this._requestRetryTimeout, this._requestRetryLimit);
			let json = await response.json();
			this._productListing = json['@graph'];	
			return this._productListing;
		} 
		catch {
			throw new Error('NWS API Unavailable or Bad Request: ' + url); 
			//this._productListing = false;
			return false;
		}
		//if (callback) { callback(this.returnObj,...args); }
		//else { return this.returnObj; }			
	};

	// //Returns the most recent products given a total number to go back.
	// async getMostRecent(numProducts = 1,callback,...args){
	// 	//Make sure we're not requesting more then our max number of products.
	// 	if (numProducts > this._mostRecentLimit) { numProducts = this._mostRecentLimit; }
	// 	if (!this._productListing) { await this.getFullProductListing(); }
	// 	let prodListingSubset = this._productListing.slice(0,numProducts);
	// 	let prodFullTexts = await this.getProductsFulltext(prodListingSubset);

		
	// 	if (callback)  { callback(prodFullTexts,...args); }
	// 	else { return prodFullTexts; }
	// }

	//Get all products from the current product listing.  Note caution has to be used with this.
	//Perhaps I need another maximum or rate limiter to not allow folks to accidetnally query 5000 products?
	async getAll(callback,...args){
		let prodListingSubset = [];
		//If we haven't queryied our product listing yet, lets get it over with.
		if (!this._productListing) { prodListingSubset = await this.getFullProductListing(); }
		else { prodListingSubset = this._productListing; }

		//If a limit isn't set (by accident), the amount of raw products returned would overwhelm the system with ajax requests. 
		//So by default, we're going to limit products to the _getAllLimit variable.  This will be overrident if limit is set higher 
		//when initiating the class.
		if (!this._filters.limit) { prodListingSubset = prodListingSubset.slice(0,this._getAllLimit); }
		//if (prodListingSubset.length > this._getAllLimit) { prodListingSubset = prodListingSubset.slice(0,this._getAllLimit); }
		
		let prodFullTexts = await this.getProductsFulltext(prodListingSubset);
		if (callback)  { callback(prodFullTexts,...args); }
		else { return prodFullTexts; }
	}
	
	//Get an array of all products listed in the listing.
	async getProductsFulltext(productListing){
		let productTexts = [];
		if (productListing.length !== 0) {
			let urls = productListing.map( prod => prod['@id']);			
			productTexts = await this.retryFetchAllJson(urls, null, this._requestRetryTimeout, this._requestRetryLimit);
		} 
		return productTexts;
	}

	//Returns the latest product
/*	async getLatest(callback,...args){
		this.getMostRecent(1,callback,...args)
	}*/


	
/*	//Returns all or a subset of the products
	async bySubset(idx,callback,...args){
		let json = [];
		let prodArray = this._productListing['@graph'];
		if (prodArray.length !== 0) {	
			//slice off any extra if a limit is set.
			if (this._limit) { prodArray = prodArray.slice(0,this._limit )}

			json = await Promise.all(
				prodArray.map(async prod => {
					var url = prod['@id'];
					const response = await fetch(url)
					return response.json();
				})
			)
		}
		if (callback)  { callback(json,...args); }
		else { return json; }
	}
*/
}



/*
export default class Products {
	
	constructor(type = null, wfo = null, idx = false, limit = false, startDate = false, endDate = false) {
		this._baseUrl = 'https://api.weather.gov/';
		this._productsUrl = 'products'
		this._locationsUrl = '/locations'
		this._typesUrl = '/types';

		this._type = type;
		this._wfo = wfo;
		this._idx = idx;
		this._limit = limit;
		this._startDate = startDate;
		this._endDate = endDate;
		this._productListing = null
	}

	//Returns a single product by an index
	async byIndex(idx,callback,...args){
		let json = {};
		if (this._productListing['@graph'].length !== 0) {
			var url = this._productListing['@graph'][this._idx]['@id'];
			const response = await fetch(url)
			json = await response.json();
		}
		if (callback)  { callback(json,...args); }
		else { return json; }
	}

	//Returns all or a subset of the products
	async bySubset(idx,callback,...args){
		let json = [];
		let prodArray = this._productListing['@graph'];
		if (prodArray.length !== 0) {
				//filter out by start date
			if (this._startDate) { 
				prodArray = prodArray.filter( product => {
					return this._startDate < new Date(product.issuanceTime);
				});
			}
			if (this._endDate) { 
				prodArray = prodArray.filter( product => {
					return this._endDate > new Date(product.issuanceTime)
				})
			}			
			//slice off any extra if a limit is set.
			if (this._limit) { prodArray = prodArray.slice(0,this._limit )}

			json = await Promise.all(
				prodArray.map(async prod => {
					var url = prod['@id'];
					const response = await fetch(url)
					return response.json();
				})
			)
		}
		if (callback)  { callback(json,...args); }
		else { return json; }
	}

	async getProductsByLocationAndType(callback,...args){
		if ((this._type) && (this._wfo)){
			var url = this._baseUrl+this._productsUrl+this._typesUrl+'/'+this._type+this._locationsUrl+'/'+this._wfo
			const response = await fetch(url)
			var json = await response.json();
			let products;
			this._productListing = json;

			if (this._idx !== false) {  products = await this.byIndex() }
			else { products = await this.bySubset() }
			if (callback) { callback(products,...args); }
			else { return products; }
		}
		else { return false; }
	}
}
*/