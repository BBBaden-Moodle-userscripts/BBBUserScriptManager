// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.5.1
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/404PageBuilder/raw/main/404PageBuilder.lib.user.js
// @require     https://github.com/black-backdoor/DataBridge/raw/main/DataBridge.lib.user.js
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

    function addExtensionInstallationTable() {
        // Fetch repo data from GitHub API
        fetch('https://api.github.com/users/BBBaden-Moodle-userscripts/repos')
            .then(response => response.json())
            .then(data => {
                const repos = data.map(repo => fetch(repo.contents_url.replace('{+path}', '')));
                return Promise.all(repos);
            })
            .then(responses => Promise.all(responses.map(res => res.json())))
            .then(contents => {
                // Filter and map the repositories based on the presence of .user.js files
                const filteredRepos = contents.filter(files => {
                    const hasUserJs = files.some(file => file.name.endsWith('.user.js'));
                    const hasLibUserJs = files.some(file => file.name.endsWith('.lib.user.js'));
                    return hasUserJs && !hasLibUserJs;
                }).map(files => {
                    const repo = files[0]?.repository;
                    const userJsFile = files.find(file => file.name.endsWith('.user.js'));
                    return {
                        name: repo?.name,
                        html_url: repo?.html_url,
                        language: repo?.language,
                        raw_url: userJsFile ? userJsFile.download_url : null
                    };
                });

                // Create a table element
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';

                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = '<th>Repository Name</th><th>Language</th><th>Installed Status</th><th>Action</th>';
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Create table body
                const tbody = document.createElement('tbody');
                filteredRepos.forEach(repo => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><a href="${repo.html_url}" target="_blank">${repo.name}</a></td>
                        <td>${repo.language || 'N/A'}</td>
                        <td>Not Installed</td>
                        <td><a href="${repo.raw_url}" target="_blank">Install</a></td>`;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);

                // Append the table to the specified div
                const pageContent = document.getElementsByClassName('custom-content')[0];
                if (pageContent) {
                    pageContent.appendChild(table);
                } else {
                    console.error('Error: custom-content class not found.');
                }
            })
            .catch(error => {
                console.error('Error fetching or appending table:', error);
            });
    }

    addExtensionInstallationTable();
}


//####################### Dropdown #######################

function addElementToDropdown(dropdown, url, name) {
    var newAnchor = document.createElement('a');
    newAnchor.href = url;
    newAnchor.className = 'dropdown-item';
    newAnchor.setAttribute('role', 'menuitem');
    newAnchor.setAttribute('tabindex', '-1');
    newAnchor.textContent = name;
    dropdown.appendChild(newAnchor);
}

function addDeviderToDropdown(dropdown) {
    var newDivider = document.createElement('div');
    newDivider.className = 'dropdown-divider';
    dropdown.appendChild(newDivider);
}

// Detect current Moodle theme
var dropdownID = "carousel-item-main";

// The following code is no longer required, since they removed the classic theme.

// Switch statement to handle different themes (kept for reference)
/*
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

if (dropdown) {
    addDeviderToDropdown(dropdown);
    addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/config', 'Userscript Config');
    addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/extensions', 'Manage Userscripts');
} else {
    console.error('Dropdown element not found.');
}


//####################### DataBridge #######################
// Create a new DataBridge
const UserScriptCon = new Connection("BBBUserScriptManager");

if (['https://moodle.bbbaden.ch/userscript/extensions', 'https://moodle.bbbaden.ch/userscript/config'].includes(window.location.href)) {
    // Register an event listener for the extensionInstalled event
    Protocol.registerMessageType(UserScriptCon, 'extensionInstalled', function (msg) {
        var scriptInstalled = msg.body?.script?.scriptName;
        var scriptVersion = msg.body?.script?.scriptVersion;

        console.log(`Detected installed script: ${scriptInstalled} v${scriptVersion}`);

        // Call the updateInstallationStatus function from your library
        PageBuilder.updateInstallationStatus(scriptInstalled, scriptVersion);
    });

    function getInstalledExtensions() {
        // Send a message to the installed extensions
        UserScriptCon.send({
            header: {
                receiver: "*",
                protocolVersion: "1.0",
                messageType: "getInstalled",
            },
            body: "",
        });
    }

    setTimeout(getInstalledExtensions, 1000);
}
