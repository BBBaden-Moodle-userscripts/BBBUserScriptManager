// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.6.0
// @author      PianoNic
// @description BBB UserScript Manager
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/LoggingLibrary/raw/refs/heads/main/Logging.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/PageBuilderLib/raw/main/PageBuilder.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/UserscriptBridgeLib/raw/main/userscriptBridge.lib.js
// @run-at      document-idle
// ==/UserScript==

(function() {
    'use strict';

    Logger.info('manager', 'v0.6.0');

    PageBuilder.prepare404Page = (title, text) => {
        document.title = title;
        const h = document.querySelector('#page-header h1.h2');
        if (h) h.innerHTML = text;
        const p = document.getElementById('page-content');
        if (p) {
            p.innerHTML = '';
            const c = document.createElement('div');
            c.className = 'custom-content';
            c.style.padding = '20px';
            p.appendChild(c);
        }
    };

    const addTable = () => {
        const content = document.querySelector('.custom-content');
        if (!content) return Logger.error('manager', 'custom-content not found');
        
        content.innerHTML = '<div class="alert alert-info">Loading...</div>';
        
        fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
            .then(r => r.text())
            .then(data => {
                const doc = new DOMParser().parseFromString(data, 'text/html');
                const table = doc.querySelector('table');
                
                table.style.width = '100%';
                table.classList.add('table', 'table-striped');
                
                const th = document.createElement('th');
                th.textContent = 'Status';
                table.querySelector('thead tr').appendChild(th);
                
                table.querySelectorAll('tbody tr').forEach(row => {
                    const last = row.querySelector('td:last-child a');
                    if (last) last.outerHTML = `<a href="${last.href}" target="_blank"><button class="btn btn-sm btn-outline-primary">Install</button></a>`;
                    
                    const status = document.createElement('td');
                    status.className = 'status-cell text-center';
                    status.innerHTML = '<span class="badge badge-secondary">Not Installed</span>';
                    row.appendChild(status);
                });
                
                content.innerHTML = '';
                content.appendChild(table);
                Logger.success('manager', 'Table loaded');
                
                setTimeout(checkScripts, 2000);
            })
            .catch(e => {
                Logger.error('manager', 'Table load failed', e);
                content.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
            });
    };

    const checkScripts = () => {
        if (typeof Manager === 'undefined') return Logger.warn('manager', 'Manager not available');
        
        new Manager().fetchInstalledUserscripts().then(scripts => {
            Logger.info('manager', `Found ${scripts.length} scripts`);
            scripts.forEach(s => {
                if (!s?.name || !s?.version) return;
                
                document.querySelectorAll('.custom-content tbody tr').forEach(row => {
                    const name = row.querySelector('td:nth-child(2)')?.textContent.trim();
                    if (name && (name.toLowerCase() === s.name.toLowerCase() || 
                        name.toLowerCase().includes(s.name.toLowerCase()) || 
                        s.name.toLowerCase().includes(name.toLowerCase()))) {
                        const cell = row.querySelector('.status-cell');
                        if (cell) {
                            cell.innerHTML = `<span class="badge badge-success">✓ v${s.version}</span>`;
                            Logger.success('manager', `${name} detected`);
                        }
                    }
                });
            });
        });
    };

    const url = window.location.href;
    
    if (url === 'https://moodle.bbbaden.ch/userscript/config') {
        PageBuilder.prepare404Page('Userscript Config', 'Userscript Config');
    }
    
    if (url === 'https://moodle.bbbaden.ch/userscript/extensions') {
        PageBuilder.prepare404Page('Manage Userscripts', 'Manage Userscripts');
        setTimeout(addTable, 100);
    }

    setTimeout(() => {
        const ul = document.querySelector('.no-overflow ul');
        if (ul && !ul.querySelector('a[href*="userscript"]')) {
            ul.innerHTML += '<li><a href="https://moodle.bbbaden.ch/userscript/extensions">UserScript Manager</a></li>';
        }
        
        const dd = document.getElementById('carousel-item-main');
        if (dd) {
            dd.innerHTML += '<div class="dropdown-divider"></div><a href="https://moodle.bbbaden.ch/userscript/config" class="dropdown-item">Config</a><a href="https://moodle.bbbaden.ch/userscript/extensions" class="dropdown-item">Extensions</a>';
        }
    }, 500);

})();
