var colorWell;

window.addEventListener("load", startup, false);

function startup() {
    colorWell = document.querySelector("#colorWell");
    colorWell.addEventListener("input", setValue, false);
    colorWell.addEventListener("change", setValue, false);
}

function setValue(event){
    document.getElementById("colorWell").value = event.target.value;
}