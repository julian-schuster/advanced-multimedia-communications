const params = new URLSearchParams(window.location.search)
var name =params.get('name');
var color =params.get('color').replace("%23", "#");
