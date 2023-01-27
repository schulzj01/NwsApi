window.NwsApi=(()=>{"use strict";var t={48:(t,e,r)=>{r.r(e),r.d(e,{Alert:()=>s,Forecast:()=>a,Product:()=>o,Zone:()=>l});class i{constructor(){this._requestRetryLimit=5,this._requestRetryTimeout=4e3}async retryFetch(t,e,r,i){try{let r=await fetch(t,e);if(r.ok)return r;throw new Error("Request to "+t+" failed: "+r.statusText)}catch(s){if(1===i)throw s;return await this.sleep(r),await this.retryFetch(t,e,r,i-1)}}async retryFetchAllJson(t,e,r,i){return await Promise.all(t.map((async t=>(await this.retryFetch(t,e,r,i)).json())))}async sleep(t){return new Promise((e=>setTimeout(e,t)))}buildGetUrl(t,e){let r=t+"?";for(let[t,i]of Object.entries(e))if(null!==i){let e=t,s="";s=Array.isArray(i)?i.join(","):i.toString(),r+="&"+e+"="+s}return r=encodeURI(r),r}}class s extends i{constructor(t,e){super(),this._queryUrl="https://api.weather.gov/alerts",this._filters={active:null,start:null,end:null,status:null,message_type:null,event:null,code:null,region_type:null,point:null,region:null,area:null,zone:null,urgency:null,certainty:null,severity:null,limit:null,cursor:null,product:null,siteid:null,zone:null,county:null,latlon:null},this.returnObj={updated:null,features:null},this._filters=Object.assign(this._filters,t)}async getAll(t,...e){let r=this.buildGetUrl(this._queryUrl,this._filters);try{const t=await this.retryFetch(r,null,this._requestRetryTimeout,this._requestRetryLimit);let e=await t.json();this.returnObj.updated=new Date(e.updated),this.returnObj.features=e.features,this.returnObj.type=e.type}catch{console.error("NWS API Unavailable or Bad Request: "+r),this.returnObj=!1}if(!t)return this.returnObj;t(this.returnObj,...e)}async getByCwa(t,e,...r){await this.getAll(),Array.isArray(t)||(t=[t]);let i=t.map((t=>t.toUpperCase()));i.includes("AFC")&&i.push("ALU","AER"),i.includes("AFG")&&i.push("WCZ");let s=this.returnObj.features.filter((t=>{let e,r=t?.properties?.parameters?.PIL?.[0],s=t?.properties?.parameters?.AWIPSidentifier?.[0];return r?e=r.substr(6,3):s&&(e=s.substr(3,3)),i.includes(e)})),a={updated:this.returnObj.updated,features:s};if(!e)return a;e(a,...r)}}class a extends i{constructor(t,e){super(),this._baseUrl="https://api.weather.gov/",this._pointMetadataUrl="points/",this._gridpointsUrl="gridpoints/",this._fcstHourlyUrl="forecast/hourly",this._fcstSummaryUrl="forecast",this._lat=t,this._lon=e,this._pointMetadata=null,this._rawForecast=null,this._summaryForecast=null,this._hourlyForecast=null}async getRawForecast(t,...e){if(this._rawForecast||await this.queryRawForecast(),!t)return this._rawForecast;t(this._rawForecast,...e)}async getHourlyForecast(t,...e){if(this._hourlyForecast||await this.queryHourlyForecast(),!t)return this._hourlyForecast;t(this._hourlyForecast,...e)}async getSummaryForecast(t,...e){if(this._summaryForecast||await this.querySummaryForecast(),!t)return this._summaryForecast;t(this._summaryForecast,...e)}async getForecasts(t,e,...r){let i={};if(t.includes("raw")&&(i.raw=await this.getRawForecast()),t.includes("hourly")&&(i.hourly=await this.getHourlyForecast()),t.includes("summary")&&(i.summary=await this.getSummaryForecast()),!e)return i;e(i,...r)}async getMetaData(){return this._pointMetadata||await this.queryPointMetadata(),this._pointMetadata}get gridX(){return this._pointMetadata.properties.gridX}get gridY(){return this._pointMetadata.properties.gridY}get cwa(){return this._pointMetadata.properties.cwa}get gridId(){return this._pointMetadata.properties.gridId}get relativeLocation(){return this._pointMetadata.properties.relativeLocation}get humanLocation(){let t=this.relativeLocation.properties.distance.value,e=this.relativeLocation.properties.bearing.value,r=this.relativeLocation.properties.city,i=this.relativeLocation.properties.state,s="";if(t>5e3){let r=["N","NNW","NW","WNW","W","WSW","SW","SSW","S","SSE","SE","ESE","E","ENE","NE","NNE"][Math.round(((e%=360)<0?e+360:e)/22.5)%16];s+=`${parseInt(621371e-9*t)}mi ${r} of `}return s+=`${r}, ${i}`,s}async queryPointMetadata(){var t=this._baseUrl+this._pointMetadataUrl+this._lat+","+this._lon;try{const e=await this.retryFetch(t,null,this._requestRetryTimeout,this._requestRetryLimit);this._pointMetadata=await e.json(),this.fix1x1GridMisalignment()}catch{throw new Error(`Unable to load API Metadata from ${t}`)}}async queryRawForecast(t,...e){this._pointMetadata||await this.queryPointMetadata();try{var r=this._baseUrl+this._gridpointsUrl+this.gridId+"/"+this.gridX+","+this.gridY;const t=await this.retryFetch(r,null,this._requestRetryTimeout,this._requestRetryLimit);this._rawForecast=await t.json()}catch{throw new Error(`Unable to load Raw Forecast from ${r}`)}}async queryHourlyForecast(t,...e){this._pointMetadata||await this.queryPointMetadata();try{var r=this._baseUrl+this._gridpointsUrl+this.gridId+"/"+this.gridX+","+this.gridY+"/"+this._fcstHourlyUrl;const t=await this.retryFetch(r,null,this._requestRetryTimeout,this._requestRetryLimit),e=await t.json();this._hourlyForecast=e}catch{throw new Error(`Unable to load Hourly Forecast from ${r}`)}}async querySummaryForecast(t,...e){this._pointMetadata||await this.queryPointMetadata();try{var r=this._baseUrl+this._gridpointsUrl+this.gridId+"/"+this.gridX+","+this.gridY+"/"+this._fcstSummaryUrl;const t=await this.retryFetch(r,null,this._requestRetryTimeout,this._requestRetryLimit),e=await t.json();this._summaryForecast=e}catch{throw new Error(`Unable to load Summary Forecast from ${r}`)}}async getRawWeatherDataBetweenPeriods(t,e,r){this._rawForecast||await this.getRawForecast();let i=this._rawForecast.properties[t].values,s=[],a=[],l=!1;return"quantitativePrecipitation"==t&&(l="split"),i.forEach((t=>{s=s.concat(this.hourlyForecastFromRaw(t,l))})),a=s.filter((t=>{if(t.startDate>=e&&t.endDate<=r)return!0})),a}fix1x1GridMisalignment(){if(["AFC","AER","ALU","AFG","AJK","BOX","CAE","DLH","HGX","HNX","LIX","LWX","MAF","MFR","MLB","MRX","MTR"].includes(this._pointMetadata?.properties?.cwa)){let t=this._pointMetadata.properties,e=`${t.gridX},${t.gridY}`;t.gridX--,t.gridY--;let r=`${t.gridX},${t.gridY}`;["forecast","forecastGridData","forecastHourly","observationStations"].forEach((i=>{t[i]=t[i]?t[i].replace(e,r):null}))}}}class l extends i{constructor(t,e,r){if(super(),this._queryUrl="https://api.weather.gov/zones",this._zoneType=t,this._filters={id:null,area:null,region:null,point:null,include_geometry:null,limit:null,effective:null},this.returnObj={updated:null,features:null,type:null},this._filters=Object.assign(this._filters,e),this._allowableZoneTypes=["land","marine","forecast","public","coastal","offshore","fire","county"],!this._allowableZoneTypes.includes(this._zoneType))throw new Error(`Zone type '${this._zoneType}' not valid.  Appropriate values are (${this._allowableZoneTypes.join("|")})`)}async getAll(t,...e){let r=this._queryUrl+"/"+this._zoneType,i=this.buildGetUrl(r,this._filters);try{const t=await this.retryFetch(i,null,this._requestRetryTimeout,this._requestRetryLimit);let e=await t.json();this.returnObj.updated=new Date(e.updated),this.returnObj.features=e.features,this.returnObj.type=e.type}catch{console.error("NWS API Unavailable or Bad Request: "+i),this.returnObj=!1}if(!t)return this.returnObj;t(this.returnObj,...e)}}class o extends i{constructor(t,e){super(),this._queryUrl="https://api.weather.gov/products",this._getAllLimit=25,this._filters={location:null,start:null,end:null,office:null,wmoid:null,type:null,limit:null},this._productListing=!1,this.returnObj={updated:null,features:null},this._filters=Object.assign(this._filters,t)}async getFullProductListing(){let t=this.buildGetUrl(this._queryUrl,this._filters);try{const e=await this.retryFetch(t,null,this._requestRetryTimeout,this._requestRetryLimit);let r=await e.json();return this._productListing=r["@graph"],this._productListing}catch{throw new Error("NWS API Unavailable or Bad Request: "+t)}}async getAll(t,...e){let r=[];r=this._productListing?this._productListing:await this.getFullProductListing(),this._filters.limit||(console.log(`No limit set on product query, only returning ${this._getAllLimit} products`),r=r.slice(0,this._getAllLimit));let i=await this.getProductsFulltext(r);if(!t)return i;t(i,...e)}async getProductsFulltext(t){let e=[];if(0!==t.length){let r=t.map((t=>t["@id"]));e=await this.retryFetchAllJson(r,null,this._requestRetryTimeout,this._requestRetryLimit)}return e}}}},e={};function r(i){if(e[i])return e[i].exports;var s=e[i]={exports:{}};return t[i](s,s.exports,r),s.exports}return r.d=(t,e)=>{for(var i in e)r.o(e,i)&&!r.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r(48)})();