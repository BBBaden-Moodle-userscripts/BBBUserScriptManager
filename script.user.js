// ==UserScript==
// @name        BBB UserScript ScriptTemp
// @namespace   Violentmonkey Scripts
// @match       https://moodle.bbbaden.ch/*
// @icon        https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/blob/main/icons/icon.png?raw=true
// @grant       GM_info
// @version     0.2.3
// @author      PianoNic
// @description the part of the script that should be added to the userscripts
// @downloadURL https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @updateURL   https://github.com/BBBaden-Moodle-userscripts/BBBUserScriptManager/raw/main/BBBUserScriptManager.user.js
// @note
// @note        REQUIREMENTS / IMPORT MODULS
// @require     https://github.com/BBBaden-Moodle-userscripts/404PageBuilder/raw/main/404PageBuilder.lib.user.js
// @require     https://github.com/black-backdoor/DataBridge/raw/main/DataBridge.lib.user.js
// ==/UserScript==

//####################### DataBridge #######################
// Create a new DataBridge
const UserScriptManagerCon = new Connection("BBBUserScriptManager");

// Register an event listener for the extensionInstalled event
Protocol.registerMessageType(UserScriptManagerCon, 'getInstalled', function (msg) {
    UserScriptManagerCon.send({
        "header": {
            "receiver": msg.header.sender,
            "protocolVersion": "1.0",
            "messageType": "extensionInstalled",
        },
        "body": {
            "script": {
                "scriptName": GM_info.script.name,
                "scriptVersion": GM_info.script.version,
            }
        }
    });
});
