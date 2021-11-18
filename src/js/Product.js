import Base from './Base.js';
/**
 *  A class to handle product queries to the NWS API. Unfortuantely product queries don't actually come with the product text.  This class
 *  resolves that by returning the full product text with the query, and saves you some promise chaining.  
 *  You can query the products with either the getAll() method after instantiating.
 *  Filters can be found: https://www.weather.gov/documentation/services-web-api#/default/products_query
 *  @param {Object} filters - A key value pair set of filters for the Product query. 
 *  @param {Object} options - placeholder for now
 * 
 */
export default class Product extends Base  {
	
	constructor(filters,options) {
		super();
		this._queryUrl = 'https://api.weather.gov/products';
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
		this._filters = Object.assign(this._filters, filters); // Could also just do "addedBack.comments = Comments.comments;" if you only care about this one property
	};

	/**
	 * Background function to query the listing of all products that match our filters specified in instantiation.
	 * @returns A listing of all specified products.
	 */
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
	};


	/**
	 * Get all products for the specified filters in the class. 
	 * Note caution has to be used with this.  Perhaps I need another maximum or rate limiter to not allow folks to accidetnally query 5000 products? 
	 * @param {Function} callback - A callback to handle the alerts.
	 * @param  {args} args - Any further arguments passed to this function go through to the callback
	 * @returns {Object} - An object with a listing of all products.
	 */
	async getAll(callback,...args){
		let prodListingSubset = [];
		//If we haven't queryied our product listing yet, lets get it over with.
		if (!this._productListing) { prodListingSubset = await this.getFullProductListing(); }
		else { prodListingSubset = this._productListing; }

		//If a limit isn't set (by accident), the amount of raw products returned would overwhelm the system with ajax requests. 
		//So by default, we're going to limit products to the _getAllLimit variable.  This will be overrided if limit is set higher when initiating the class.
		if (!this._filters.limit) { 
			console.log(`No limit set on product query, only returning ${this._getAllLimit} products`)
			prodListingSubset = prodListingSubset.slice(0,this._getAllLimit); 
		}
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