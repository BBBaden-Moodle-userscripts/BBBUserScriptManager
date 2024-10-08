// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.4.1
// @author      PianoNic
// @description 5.1.2024, 09:19:31
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @note
// @note        REQUIREMENTS / IMPORT MODULS
// @require     https://github.com/BBBaden-Moodle-userscripts/PageBuilderLib/raw/main/PageBuilder.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/UserscriptBridgeLib/raw/main/userscriptBridge.lib.js
// ==/UserScript==

//########### ADD LINK TO MOODLE SIDEBAR ###############

var ul = document.querySelector('.no-overflow ul');
if (ul) ul.innerHTML += '<li><a href="https://moodle.bbbaden.ch/userscript/extensions">UserScript Manager</a></li>';


//############# CHECK FOR CONFIG PAGE ##################

if (window.location.href === 'https://moodle.bbbaden.ch/userscript/config') {

    PageBuilder.prepare404Page('Userscript Config', 'Userscript Config');
}


//########### CHECK FOR EXTENSIONS PAGE ################

if (window.location.href === 'https://moodle.bbbaden.ch/userscript/extensions') {

    PageBuilder.prepare404Page('Manage Userscripts', 'Manage Userscripts');

    PageBuilder.addExtensionInstallationTable();

}

//####################### Dropdown #######################

function addElementToDropdown(dropdown, url, name) {
    // Create the new anchor element
    var newAnchor = document.createElement('a');

    newAnchor.href = url;
    newAnchor.className = 'dropdown-item';
    newAnchor.setAttribute('role', 'menuitem');
    newAnchor.setAttribute('tabindex', '-1');
    newAnchor.textContent = name;

    // Append the anchor element to the div
    dropdown.appendChild(newAnchor);
}

function addDividerToDropdown(dropdown) {
    // Create the new anchor element
    var newDivider = document.createElement('div');

    newDivider.className = 'dropdown-divider';

    // Append the anchor element to the div
    dropdown.appendChild(newDivider);
}

var dropdown = document.getElementById("carousel-item-main");

addDividerToDropdown(dropdown);
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/config', 'Userscript Config');
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/extensions', 'Manage Userscripts');

//####################### DataBridge #######################
const connection = new Manager();

connection.fetchInstalledUserscripts().then((userscripts) => {
    console.log('Installed Userscripts:', userscripts);
});
// Create a new DataBridge
// const UserScriptCon = new Connection("BBBUserScriptManager");
// if (window.location.href === 'https://moodle.bbbaden.ch/userscript/extensions' || window.location.href === 'https://moodle.bbbaden.ch/userscript/config') {
//     // Register an event listener for the extensionInstalled event
//     Protocol.registerMessageType(UserScriptCon, 'extensionInstalled', function (msg) {
//         var scriptInstalled = msg.body?.script?.scriptName;
//         var scriptVersion = msg.body?.script?.scriptVersion;

//         console.log(`detected installed script: ${scriptInstalled} v${scriptVersion}`);

//         // Call the updateInstallationStatus function from your library
//         PageBuilder.updateInstallationStatus(scriptInstalled, scriptVersion);
//     });


//     function getInstalledExtensions() {
//         // Send a message to the installed extensions
//         UserScriptCon.send({
//             header: {
//                 receiver: "*",
//                 protocolVersion: "1.0",
//                 messageType: "getInstalled",
//             },
//             body: "",
//         });
//     }

//     setTimeout(getInstalledExtensions, 1000);
// }
