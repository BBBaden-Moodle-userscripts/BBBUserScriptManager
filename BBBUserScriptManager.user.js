// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.5.0
// @author      PianoNic
// @description BBB UserScript Manager with BroadcastChannel communication
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/PageBuilderLib/raw/main/PageBuilder.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/UserscriptBridgeLib/raw/main/userscriptBridge.lib.js
// ==/UserScript==

(function() {
    'use strict';

    console.log('BBB UserScript Manager loaded');

    //########### ADD LINK TO MOODLE SIDEBAR ###############
    function addSidebarLink() {
        var ul = document.querySelector('.no-overflow ul');
        if (ul) {
            ul.innerHTML += '<li><a href="https://moodle.bbbaden.ch/userscript/extensions">UserScript Manager</a></li>';
        }
    }
    
    //############# CHECK FOR CONFIG PAGE ##################
    if (window.location.href === 'https://moodle.bbbaden.ch/userscript/config') {
        if (typeof PageBuilder !== 'undefined') {
            PageBuilder.prepare404Page('Userscript Config', 'Userscript Config');
        } else {
            console.error('PageBuilder is not loaded');
        }
    }
    
    //########### CHECK FOR EXTENSIONS PAGE ################
    if (window.location.href === 'https://moodle.bbbaden.ch/userscript/extensions') {
        if (typeof PageBuilder !== 'undefined') {
            PageBuilder.prepare404Page('Manage Userscripts', 'Manage Userscripts');
            
            // Wait a bit for the DOM to be ready, then add the table
            setTimeout(() => {
                PageBuilder.addExtensionInstallationTable();
                
                // After table is added, fetch installed scripts
                setTimeout(() => {
                    initDataBridge();
                }, 500);
            }, 100);
        } else {
            console.error('PageBuilder is not loaded');
        }
    }
    
    //####################### Dropdown #######################
    function addElementToDropdown(dropdown, url, name) {
        if (!dropdown) {
            console.error('Dropdown element not found');
            return;
        }
        
        var newAnchor = document.createElement('a');
        newAnchor.href = url;
        newAnchor.className = 'dropdown-item';
        newAnchor.setAttribute('role', 'menuitem');
        newAnchor.setAttribute('tabindex', '-1');
        newAnchor.textContent = name;
        dropdown.appendChild(newAnchor);
    }
    
    function addDividerToDropdown(dropdown) {
        if (!dropdown) {
            console.error('Dropdown element not found');
            return;
        }
        
        var newDivider = document.createElement('div');
        newDivider.className = 'dropdown-divider';
        dropdown.appendChild(newDivider);
    }
    
    function initDropdown() {
        var dropdown = document.getElementById("carousel-item-main");
        if (dropdown) {
            addDividerToDropdown(dropdown);
            addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/config', 'Userscript Config');
            addElementToDropdown(dropdown, 'https://moodle.bbbaden.ch/userscript/extensions', 'Manage Userscripts');
        } else {
            console.warn('Dropdown element "carousel-item-main" not found');
        }
    }
    
    //####################### DataBridge #######################
    function initDataBridge() {
        // Check if Manager is available
        if (typeof Manager !== 'undefined') {
            try {
                console.log('Initializing Manager...');
                const manager = new Manager();
                
                manager.fetchInstalledUserscripts().then((userscripts) => {
                    console.log('Installed Userscripts:', userscripts);
                    
                    // Update the table with installed scripts
                    userscripts.forEach(script => {
                        if (script && script.name && script.version) {
                            PageBuilder.updateInstallationStatus(script.name, script.version);
                        }
                    });
                }).catch((error) => {
                    console.error('Error fetching userscripts:', error);
                });
            } catch (error) {
                console.error('Error initializing Manager:', error);
            }
        } else {
            console.warn('Manager class not available from UserscriptBridgeLib');
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addSidebarLink();
            initDropdown();
        });
    } else {
        addSidebarLink();
        initDropdown();
    }

})();
