// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @grant       none
// @version     0.1
// @author      PianoNic
// @description 5.1.2024, 09:19:31
// ==/UserScript==

//######################################################
//############# CHECK FOR CONFIG PAGE ##################
//######################################################
function isConfigPage() {
    return window.location.href === 'https://moodle.bbbaden.ch/userscript/config';
}

if (isConfigPage()) {

    // HEAD SECTION
    document.title = 'Userscript Config';

    // HEADER SECTION
    var pageHeader = document.getElementById('page-header');

    if (pageHeader) {
        var errorHeading = pageHeader.querySelector('h1.h2');
        if (errorHeading) {
            errorHeading.innerHTML = 'Moodle Userscript Config';
        }

    }

    // PAGE CONTENT SECTION
    var pageContent = document.getElementById('page-content');
    if (pageContent) {
        pageContent.innerHTML = `
            <div id="region-main" class="header-maxwidth" aria-label="Inhalt">
                <div class="nav-tabs h2" id="line"></div>
                <h2>Abschnitt 1</h2>
                <p>Bla Bla Bla</p>
                <button class="btn btn-outline-secondary btn-sm text-nowrap h2">hi</button>
                <button class="btn btn-outline-secondary btn-sm text-nowrap h2">hi</button>
                <div class="nav-tabs h2" id="line"></div>
                <h2>Abschnitt 2</h2>
                <p>Bla Bla Bla</p>
            </div>
        `;
    }
}
//######################################################
//########### CHECK FOR EXTENSIONS PAGE ################
//######################################################
function isExtensionsPage() {
    return window.location.href === 'https://moodle.bbbaden.ch/userscript/extensions';
}

function appendTableToHTML() {
    // Fetch the table from the given URL
    fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
        .then(response => response.text())
        .then(data => {
            // Parse the markdown content into HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');

            // Extract the table
            const table = doc.querySelector('table');

            // Set styles to make the table use the full width
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';

            // Add space between each line (transparent border)
            const tbody = table.querySelector('tbody');
            if (tbody) {
                const tableRows = tbody.querySelectorAll('tr');
                tableRows.forEach(row => {
                    row.style.borderBottom = '4px solid transparent';
                });
            }

            // Append the table to the specified div
            const tableOfContentDiv = document.getElementById('tableOfContent');
            if (tableOfContentDiv) {
                // Add two new columns at the end of each row
                const headerRow = table.querySelector('thead tr');
                headerRow.innerHTML += '<th>Installed Status</th>';

                const bodyRows = table.querySelectorAll('tbody tr');
                bodyRows.forEach(row => {
                    // Convert all "Install" links to buttons
                    const installLink = row.querySelector('td:last-child a');
                    installLink.outerHTML = '<button class="btn btn-outline-secondary btn-sm text-nowrap h2 install-button">' + "<a href='" + installLink + "'>" +"Install</a>" + '</button>';

                    // Add "Installed Status" column with default value "Not Installed"
                    row.innerHTML += '<td>Not Installed</td>';
                });

                // Append the table to the div
                tableOfContentDiv.appendChild(table);
            }
        })
        .catch(error => {
            console.error('Error fetching or appending table:', error);
        });
}




if (isExtensionsPage()) {
    // HEAD SECTION
    document.title = 'Manage Userscripts';

    // HEADER SECTION
    var pageHeader = document.getElementById('page-header');

    if (pageHeader) {
        var errorHeading = pageHeader.querySelector('h1.h2');
        if (errorHeading) {
            errorHeading.innerHTML = 'Manage Userscripts';
        }
    }

    // PAGE CONTENT SECTION
    var pageContent = document.getElementById('page-content');
    if (pageContent) {
        pageContent.innerHTML = `
            <div id="region-main" class="header-maxwidth" aria-label="Inhalt">
                <div class="nav-tabs h2" id="line"></div>
                <div id="tableOfContent"></div>
            </div>
        `;

        // Append the table to HTML
        appendTableToHTML();
    }
}

//######################################################
//################ ADD NEW PATHS #######################
//######################################################
var carouselItemMain = document.getElementById('carousel-item-main');

var divider = document.createElement('div');
divider.className = 'dropdown-divider';

carouselItemMain.appendChild(divider);

var newAnchor1 = document.createElement('a');
newAnchor1.href = 'https://moodle.bbbaden.ch/userscript/config';
newAnchor1.className = 'dropdown-item';
newAnchor1.setAttribute('role', 'menuitem');
newAnchor1.setAttribute('tabindex', '-1');
newAnchor1.textContent = 'Userscript Config';

carouselItemMain.appendChild(newAnchor1);

var newAnchor2 = document.createElement('a');
newAnchor2.href = 'https://moodle.bbbaden.ch/userscript/extensions';
newAnchor2.className = 'dropdown-item';
newAnchor2.setAttribute('role', 'menuitem');
newAnchor2.setAttribute('tabindex', '-1');
newAnchor2.textContent = 'Manage Userscripts';

// Append the second anchor element to the div
carouselItemMain.appendChild(newAnchor2);