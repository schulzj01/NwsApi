
window.onload = function() {

	let alertSubmits = [...document.getElementsByClassName('alertSubmit')];
	alertSubmits.forEach(el => el.addEventListener('click',alertSubmit));

	let alertByCwaSubmits = [...document.getElementsByClassName('alertByCwaSubmit')];
	alertByCwaSubmits.forEach(el => el.addEventListener('click',alertByCwaSubmit));

	let productSubmits = [...document.getElementsByClassName('productSubmit')];
	productSubmits.forEach(el => el.addEventListener('click',productSubmit));

	let zoneSubmits = [...document.getElementsByClassName('zoneSubmit')];
	zoneSubmits.forEach(el => el.addEventListener('click',zoneSubmit));

	let forecastSubmits = [...document.getElementsByClassName('forecastSubmit')];
	forecastSubmits.forEach(el => el.addEventListener('click',forecastSubmit));

}
function jsonEscape(str)  { return str.replace(/\\n/g,'\n') }
function populateText(data){ document.getElementById('textViewer').innerHTML = jsonEscape(JSON.stringify(data,null, 2)); }
function waiting(){ populateText('Loading...'); }

/*   Alert Tests  */
function alertSubmit(event){
	let button = event.srcElement;
	let input = button.previousSibling;
	let val = input.value;
	let filter = button.dataset.filter;
	let alert = new NwsApi.Alert({
		[filter] : val,
		limit : 10
	});
	waiting();
	alert.getAll(populateText);
}
function alertByCwaSubmit(event){
	let button = event.srcElement;
	let input = button.previousSibling;
	let cwas = input.value;
	let alert = new NwsApi.Alert({active: true});
	waiting();
	cwaArray = cwas.split(',');
	alert.getByCwa(cwaArray,populateText);
}

/*  Product Tests   */
function productSubmit(event){
	let button = event.srcElement;
	let input = button.previousSibling;
	let val = input.value;
	let filter = button.dataset.filter;
	let product = new NwsApi.Product({
		[filter] : val,
		limit : 10
	});
	waiting();
	product.getAll(populateText);
}

/*  Zone Tests   */
function zoneSubmit(event){
	let button = event.srcElement;
	let input = button.previousSibling;
	let val = input.value;
	let filter = button.dataset.filter;
	let zonetype = document.getElementById('zoneType').selectedOptions[0].value;
	let zone = new NwsApi.Zone(zonetype,{
		[filter] : val,
		limit : 10
	});
	waiting();
	zone.getAll(populateText);
}

/*  Forecast Tests   */
function forecastSubmit(event){
	let lat = document.getElementById('forecastLat').value;
	let lon = document.getElementById('forecastLon').value;
	let button = event.srcElement;
	let forecast = button.dataset.forecast;
	let product = new NwsApi.Forecast(lat,lon);
	waiting();
	product.getForecasts(forecast,populateText);
}
