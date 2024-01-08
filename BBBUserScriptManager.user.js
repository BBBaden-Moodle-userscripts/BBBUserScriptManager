// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       none
// @version     0.2
// @author      PianoNic
// @description 5.1.2024, 09:19:31
// @note
// @note        REQUIREMENTS / IMPORT MODULS
// @require     https://github.com/BBBaden-Moodle-userscripts/MoodleThemeDetector/raw/main/MoodleThemeDetector.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/404PageBuilder/raw/main/404PageBuilder.lib.user.js
// ==/UserScript==

//############# CHECK FOR CONFIG PAGE ##################

if (window.location.href === 'https://moodle.bbbaden.ch/userscript/config') {

    PageBuilder.preparePage('Userscript Config', 'Userscript Config');

    PageBuilder.addH1('H1 Test');

    PageBuilder.addLine();

    PageBuilder.addH2('H2 Test');

    PageBuilder.addLine();

    PageBuilder.addButton("Button Test");
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
const MoodleTheme = MoodleThemeDetector.detectTheme(document.head);
var dropdownID;

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

var dropdown = document.getElementById(dropdownID);

addDeviderToDropdown(dropdown);
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/config', 'Userscript Config');
addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/extensions', 'Manage Userscripts');

