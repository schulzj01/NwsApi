
window.onload = function() {

	document.getElementById('alertByZoneNumberSubmit').addEventListener('click',alertByZoneSubmit);
	document.getElementById('alertByProductTypeSubmit').addEventListener('click',alertByProductTypeSubmit);

	document.getElementById('productByLocationSubmit').addEventListener('click',productByLocationSubmit);
	document.getElementById('productByProductTypeSubmit').addEventListener('click',productByProductTypeSubmit);
}
function jsonEscape(str)  {
	return str.replace(/\\n/g,'\n')
}
function populateText(data){
	document.getElementById('textViewer').innerHTML = jsonEscape(JSON.stringify(data));
}
/*   Alert Tests  */
function alertByZoneSubmit(){
	let val = document.getElementById('alertByZoneNumber').value;
	let alert = new NwsApi.Alert({ 
		zone : val,
	});
	waiting();
	alert.getAll(populateText);
}
function alertByZoneSubmit(){
	let val = document.getElementById('alertByZoneNumber').value;
	let alert = new NwsApi.Alert({ 
		zone : val,
	});
	waiting();
	alert.getAll(populateText);
}

/*   Product Tests  */
function productByLocationSubmit(){
	let val = document.getElementById('productByLocation').value;
	let product = new NwsApi.Product({ 
		location : [val],
	});
	waiting();
	product.getMostRecent(3,populateText);
}
function productByProductTypeSubmit(){
	let val = document.getElementById('productByProductType').value;
	let product = new NwsApi.Product({ 
		type : [val],
	});
	waiting();
	product.getMostRecent(3,populateText);
}
function waiting(){
	populateText('Loading...');
}
