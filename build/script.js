document.body.style.backgroundColor = "white";
var button = this.document.getElementById("createSite");
button.style.visibility = "visible";
button.onclick = openPage()

function openPage() {
    window.open("extension.html");
}