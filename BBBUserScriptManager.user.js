// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.7.0
// @author      PianoNic
// @description BBB UserScript Manager - Enhanced with better script detection
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/LoggingLibrary/raw/refs/heads/main/Logging.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/PageBuilderLib/raw/main/PageBuilder.lib.user.js
// @require     https://github.com/BBBaden-Moodle-userscripts/UserscriptBridgeLib/raw/main/userscriptBridge.lib.js
// @run-at      document-idle
// ==/UserScript==

(function() {
    'use strict';

    Logger.info('manager', 'v0.7.0 - Enhanced');

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

    const normalizeScriptName = (name) => {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
    };

    const isScriptMatch = (tableName, scriptName) => {
        const normalizedTable = normalizeScriptName(tableName);
        const normalizedScript = normalizeScriptName(scriptName);
        
        // Direct match
        if (normalizedTable === normalizedScript) return true;
        
        // Contains match (both directions)
        if (normalizedTable.includes(normalizedScript)) return true;
        if (normalizedScript.includes(normalizedTable)) return true;
        
        // Common variations
        const variations = [
            normalizedScript.replace('bbb', ''),
            normalizedScript.replace('userscript', ''),
            normalizedScript.replace('manager', ''),
        ];
        
        return variations.some(v => 
            normalizedTable.includes(v) || v.includes(normalizedTable)
        );
    };

    const addTable = () => {
        const content = document.querySelector('.custom-content');
        if (!content) return Logger.error('manager', 'custom-content not found');
        
        content.innerHTML = `
            <div class="alert alert-info">
                <strong>Loading userscripts...</strong>
                <div class="progress mt-2" style="height: 5px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         role="progressbar" style="width: 100%"></div>
                </div>
            </div>
        `;
        
        fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
            .then(r => r.text())
            .then(data => {
                const doc = new DOMParser().parseFromString(data, 'text/html');
                const table = doc.querySelector('table');
                
                if (!table) {
                    throw new Error('Table not found in AllProjects.md');
                }
                
                table.style.width = '100%';
                table.classList.add('table', 'table-striped', 'table-hover');
                
                // Add Status header
                const th = document.createElement('th');
                th.textContent = 'Status';
                th.style.width = '150px';
                th.style.textAlign = 'center';
                table.querySelector('thead tr').appendChild(th);
                
                // Process table rows
                table.querySelectorAll('tbody tr').forEach((row, index) => {
                    const last = row.querySelector('td:last-child a');
                    if (last) {
                        last.outerHTML = `<a href="${last.href}" target="_blank">
                            <button class="btn btn-sm btn-outline-primary">
                                <i class="fa fa-download"></i> Install
                            </button>
                        </a>`;
                    }
                    
                    const status = document.createElement('td');
                    status.className = 'status-cell text-center';
                    status.setAttribute('data-row-index', index);
                    status.innerHTML = `
                        <span class="badge badge-secondary">
                            <i class="fa fa-circle-notch fa-spin"></i> Checking...
                        </span>
                    `;
                    row.appendChild(status);
                });
                
                content.innerHTML = '';
                content.appendChild(table);
                
                Logger.success('manager', 'Table loaded successfully');
                
                // Check for installed scripts with a slight delay
                setTimeout(() => {
                    checkScripts();
                }, 500);
            })
            .catch(e => {
                Logger.error('manager', 'Table load failed', e);
                content.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>Error loading userscripts list:</strong><br>
                        ${e.message}
                    </div>
                `;
            });
    };

    const checkScripts = () => {
        if (typeof Manager === 'undefined') {
            Logger.warn('manager', 'Manager class not available');
            updateAllStatusCells('error', 'Manager not available');
            return;
        }
        
        Logger.info('manager', 'Fetching installed userscripts...');
        
        const manager = new Manager();
        manager.fetchInstalledUserscripts()
            .then(scripts => {
                Logger.info('manager', `Found ${scripts.length} installed script(s)`);
                
                if (scripts.length === 0) {
                    Logger.warn('manager', 'No scripts detected - setting all to Not Installed');
                    updateAllStatusCells('not-installed');
                    return;
                }
                
                // Log all found scripts for debugging
                scripts.forEach(s => {
                    Logger.info('manager', `Detected: ${s.name} v${s.version}`);
                });
                
                // First, set all cells to "Not Installed"
                updateAllStatusCells('not-installed');
                
                // Then update matching scripts
                let matchCount = 0;
                document.querySelectorAll('.custom-content tbody tr').forEach(row => {
                    const nameCell = row.querySelector('td:nth-child(2)');
                    const tableName = nameCell?.textContent.trim();
                    
                    if (!tableName) return;
                    
                    // Try to find a match
                    const matchedScript = scripts.find(s => 
                        s?.name && isScriptMatch(tableName, s.name)
                    );
                    
                    if (matchedScript) {
                        const cell = row.querySelector('.status-cell');
                        if (cell) {
                            cell.innerHTML = `
                                <span class="badge badge-success" title="${matchedScript.name}">
                                    <i class="fa fa-check"></i> v${matchedScript.version}
                                </span>
                            `;
                            matchCount++;
                            Logger.success('manager', `Matched: ${tableName} → ${matchedScript.name}`);
                        }
                    }
                });
                
                Logger.info('manager', `Matched ${matchCount} script(s)`);
                
                // Close manager connection
                manager.close();
            })
            .catch(error => {
                Logger.error('manager', 'Error fetching scripts:', error);
                updateAllStatusCells('error', 'Error checking scripts');
            });
    };

    const updateAllStatusCells = (status, message = null) => {
        document.querySelectorAll('.status-cell').forEach(cell => {
            switch (status) {
                case 'not-installed':
                    cell.innerHTML = '<span class="badge badge-secondary">Not Installed</span>';
                    break;
                case 'error':
                    cell.innerHTML = `<span class="badge badge-danger">${message || 'Error'}</span>`;
                    break;
                default:
                    cell.innerHTML = '<span class="badge badge-secondary">Unknown</span>';
            }
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

    // Add navigation links
    setTimeout(() => {
        const ul = document.querySelector('.no-overflow ul');
        if (ul && !ul.querySelector('a[href*="userscript"]')) {
            ul.innerHTML += '<li><a href="https://moodle.bbbaden.ch/userscript/extensions">UserScript Manager</a></li>';
        }
        
        const dd = document.getElementById('carousel-item-main');
        if (dd && !dd.querySelector('a[href*="userscript"]')) {
            dd.innerHTML += `
                <div class="dropdown-divider"></div>
                <a href="https://moodle.bbbaden.ch/userscript/config" class="dropdown-item">
                    <i class="fa fa-cog"></i> Config
                </a>
                <a href="https://moodle.bbbaden.ch/userscript/extensions" class="dropdown-item">
                    <i class="fa fa-puzzle-piece"></i> Extensions
                </a>
            `;
        }
    }, 500);

})();
