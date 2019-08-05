const siteCreationContainer = 
        "<h3>Create CI Site</h3>" +
        "<img id='settingsIcon' src='resources/gearIcon.png' title='Edit default configuration'>" +
        "<div id='buttonsContainer'>" +
            "<button id='default'>Default</button>" +
            "<button id='custom'>Custom</button>" +
        "</div>";

var siteCreationBox = document.createElement('div');
siteCreationBox.innerHTML = siteCreationContainer;
siteCreationBox.align = "center";
siteCreationBox.id = "siteCreationBox";

document.body.appendChild(siteCreationBox);
