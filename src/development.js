
window.onload = function() {

	let alertSubmits = [...document.getElementsByClassName('alertSubmit')];
	alertSubmits.forEach(el => el.addEventListener('click',alertSubmit));

	let productSubmits = [...document.getElementsByClassName('productSubmit')];
	productSubmits.forEach(el => el.addEventListener('click',productSubmit));

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
	let input = event.srcElement.previousSibling;
	let val = input.value;
	let filter = input.dataset.filter;
	let alert = new NwsApi.Alert({ 
		[filter] : val,
	});
	waiting();
	alert.getAll(populateText);
}

/*  Product Tests   */
function productSubmit(event){
	let input = event.srcElement.previousSibling;
	let val = input.value;
	let filter = input.dataset.filter;
	let product = new NwsApi.Product({ 
		[filter] : val,
	});
	waiting();
	product.getMostRecent(3,populateText);
}

