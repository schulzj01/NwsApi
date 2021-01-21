
window.onload = function() {

	let alertSubmits = [...document.getElementsByClassName('alertSubmit')];
	alertSubmits.forEach(el => el.addEventListener('click',alertSubmit));

	let productSubmits = [...document.getElementsByClassName('productSubmit')];
	productSubmits.forEach(el => el.addEventListener('click',productSubmit));

	let forecastSubmits = [...document.getElementsByClassName('forecastSubmit')];
	forecastSubmits.forEach(el => el.addEventListener('click',forecastSubmit));

}
function jsonEscape(str)  {
	return str.replace(/\\n/g,'\n')
}
function populateText(data){
	document.getElementById('textViewer').innerHTML = jsonEscape(JSON.stringify(data));
}
function waiting(){
	populateText('Loading...');
}

/*   Alert Tests  */
function alertSubmit(event){	
	let button = event.srcElement;
	let input = button.previousSibling;
	let val = input.value;
	let filter = button.dataset.filter;
	let alert = new NwsApi.Alert({ 
		[filter] : val,
	});
	waiting();
	alert.getAll(populateText);


}

/*  Product Tests   */
function productSubmit(event){
	let button = event.srcElement;
	let input = button.previousSibling;
	let val = input.value;
	let filter = button.dataset.filter;
	let product = new NwsApi.Product({ 
		[filter] : val,
		limit : 3
	});
	waiting();
	product.getAll(populateText);
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
