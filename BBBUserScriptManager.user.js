// ==UserScript==
// @name        BBB UserScript Manager
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @match       https://lms.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.9.0
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

    if (!UserscriptBridge.runOnce()) return;
    Logger.info('manager', 'v0.9.0');

    const CONFIG_PATH = '/userscript/config';
    const EXTENSIONS_PATH = UserscriptBridge.EXTENSIONS_PATH;

    UserscriptBridge.registerScript();

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

    // Archived scripts are hidden by default, the choice is remembered per browser
    const SHOW_ARCHIVED_KEY = 'bbb-userscript-manager-show-archived';

    const createArchivedToggle = (table) => {
        const archivedRows = [...table.querySelectorAll('tbody tr')]
            .filter(row => row.querySelector('img[alt="Archived"]'));

        const wrapper = document.createElement('div');
        wrapper.className = 'form-check mb-3';
        wrapper.innerHTML = `
            <input type="checkbox" class="form-check-input" id="show-archived">
            <label class="form-check-label" for="show-archived"></label>
        `;
        wrapper.querySelector('label').textContent = `Archivierte Skripte anzeigen (${archivedRows.length})`;

        const checkbox = wrapper.querySelector('input');
        const apply = () => archivedRows.forEach(row => { row.hidden = !checkbox.checked; });

        try {
            checkbox.checked = localStorage.getItem(SHOW_ARCHIVED_KEY) === 'true';
        } catch (e) {
            // Storage unavailable, keep the default
        }
        checkbox.addEventListener('change', () => {
            apply();
            try {
                localStorage.setItem(SHOW_ARCHIVED_KEY, String(checkbox.checked));
            } catch (e) {
                // Storage unavailable, the choice only lasts for this page
            }
        });
        apply();

        return wrapper;
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
                
                // Icon-only install column
                const installTh = table.querySelector('thead th:last-child');
                if (installTh) installTh.classList.add('text-center');

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
                        last.closest('td').classList.add('text-center');
                        last.outerHTML = `<a href="${last.href}" target="_blank" class="btn btn-sm btn-outline-primary install-btn"
                                             title="Installieren" aria-label="Installieren">
                            <i class="fa fa-download" aria-hidden="true"></i>
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
                
                content.replaceChildren(createArchivedToggle(table), table);
                
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
                        markInstalled(row);
                        const cell = row.querySelector('.status-cell');
                        if (cell) {
                            cell.innerHTML = `
                                <span class="badge badge-success bg-success" title="${matchedScript.name}">
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

    // Installed scripts get a reinstall button instead of install, which also pulls the latest version
    const markInstalled = (row) => {
        const button = row.querySelector('.install-btn');
        if (!button) return;
        button.classList.replace('btn-outline-primary', 'btn-outline-secondary');
        button.title = 'Neu installieren / aktualisieren';
        button.setAttribute('aria-label', button.title);
        button.querySelector('i').className = 'fa fa-refresh';
    };

    const updateAllStatusCells = (status, message = null) => {
        document.querySelectorAll('.status-cell').forEach(cell => {
            switch (status) {
                case 'not-installed':
                    cell.innerHTML = '<span class="badge badge-secondary bg-secondary">Not Installed</span>';
                    break;
                case 'error':
                    cell.innerHTML = `<span class="badge badge-danger bg-danger">${message || 'Error'}</span>`;
                    break;
                default:
                    cell.innerHTML = '<span class="badge badge-secondary">Unknown</span>';
            }
        });
    };

    const path = window.location.pathname;
    
    if (path === CONFIG_PATH) {
        PageBuilder.prepare404Page('Userscript Config', 'Userscript Config');
    }
    
    if (path === EXTENSIONS_PATH) {
        PageBuilder.prepare404Page('Manage Userscripts', 'Manage Userscripts');
        addTable();
    }

    // Add navigation links (relative, so they stay on the current Moodle instance)
    const ul = document.querySelector('.no-overflow ul');
    if (ul && !ul.querySelector('a[href*="userscript"]')) {
        ul.insertAdjacentHTML('beforeend', `<li><a href="${EXTENSIONS_PATH}">UserScript Manager</a></li>`);
    }
    
    const dd = document.getElementById('carousel-item-main');
    if (dd && !dd.querySelector('a[href*="userscript"]')) {
        dd.insertAdjacentHTML('beforeend', `
            <div class="dropdown-divider"></div>
            <a href="${CONFIG_PATH}" class="dropdown-item">
                <i class="fa fa-cog"></i> Config
            </a>
            <a href="${EXTENSIONS_PATH}" class="dropdown-item">
                <i class="fa fa-puzzle-piece"></i> Extensions
            </a>
        `);
    }

})();
