var newline = document.createElement('br');
//TODO: ^^^ remove

var siteCreationContainer = document.createElement('div');
siteCreationContainer.align = "center";
siteCreationContainer.id = "siteCreationContainer";

var siteCreationLabel = document.createElement('h3');
siteCreationLabel.id = "siteCreationLabel";
siteCreationLabel.innerHTML = "Create CI Site";
siteCreationContainer.appendChild(siteCreationLabel);

var changeConfig = document.createElement('a');
changeConfig.id = "changeConfig";
changeConfig.href = "";
changeConfig.innerHTML = "Edit default configuration";
siteCreationContainer.appendChild(changeConfig);

changeConfig.appendChild(newline);

var defaultButton = document.createElement('button');
defaultButton.id = "default";
defaultButton.innerText = "Default";
siteCreationContainer.appendChild(defaultButton);

var customButton = document.createElement('button');
customButton.id = "custom";
customButton.innerText = "Custom";
siteCreationContainer.appendChild(customButton);

document.getElementById("partial-pull-merging").appendChild(siteCreationContainer);
