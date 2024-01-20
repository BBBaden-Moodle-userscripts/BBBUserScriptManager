// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       none
// @version     0.2.3
// @author      PianoNic
// @description 5.1.2024, 09:19:31
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @note
// @note        REQUIREMENTS / IMPORT MODULS
// @require     https://github.com/BBBaden-Moodle-userscripts/404PageBuilder/raw/main/404PageBuilder.lib.user.js
// ==/UserScript==

//########### ADD LINK TO MOODLE SIDEBAR ###############

var ul = document.querySelector('.no-overflow ul');
if (ul) ul.innerHTML += '<li><a href="https://moodle.bbbaden.ch/userscript/extensions">UserScript Manager</a></li>';


//############# CHECK FOR CONFIG PAGE ##################

if (window.location.href === 'https://moodle.bbbaden.ch/userscript/config') {

    PageBuilder.preparePage('Userscript Config', 'Userscript Config');
}


//########### CHECK FOR EXTENSIONS PAGE ################

if (window.location.href === 'https://moodle.bbbaden.ch/userscript/extensions') {

    PageBuilder.preparePage('Manage Userscripts', 'Manage Userscripts');

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

function addDeviderToDropdown(dropdown) {
    // Create the new anchor element
    var newDivider = document.createElement('div');

    newDivider.className = 'dropdown-divider';

    // Append the anchor element to the div
    dropdown.appendChild(newDivider);
}

// String containing the name of the current Moodle theme
//const MoodleTheme = MoodleThemeDetector.detectTheme(document.head);
var dropdownID;

dropdownID = "carousel-item-main";
/*
 
 The following code is not required anymore, since they removed the classic theme.

 add this to the userscript header (if used again):
 // @require     https://github.com/BBBaden-Moodle-userscripts/MoodleThemeDetector/raw/main/MoodleThemeDetector.lib.user.js
 
// Switch statement to handle different themes
switch (MoodleTheme) {
    case "classic":
        dropdownID = "action-menu-0-menu";
        break;
    case "boost":
        dropdownID = "carousel-item-main";
        break;
    default:
        dropdownID = "carousel-item-main";
        break;
}
*/

var dropdown = document.getElementById(dropdownID);

addDeviderToDropdown(dropdown);
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/config', 'Userscript Config');
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/extensions', 'Manage Userscripts');

