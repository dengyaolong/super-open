const defaultBrowser = require('default-browser');
const fs = require('fs')
const {spawn, spawnSync} = require('child_process');

const openUrl = require('openurl')
const chromePath = require('@moonandyou/chrome-path');

const defaultChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function getCommand() {
    var command;
    switch(process.platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'explorer.exe';
            break;
        case 'linux':
            command = 'xdg-open';
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }
    return defaultBrowser()
        .then(browser => {
            if(browser.name.toUpperCase() === 'CHROME') {
                if(fs.existsSync(defaultChromePath)) {
                    return defaultChromePath
                } else {
                    return chromePath().then(res => res['google-chrome'])
                }
            } else {
                return command
            }
        });
}

function openURL(command, url, callback) {
    var child = spawn(command, [url]);
    var errorText = "";
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        errorText += data;
    });
    child.stderr.on('end', function () {
        if (errorText.length > 0) {
            var error = new Error(errorText);
            if (callback) {
                callback(error);
            } else {
                throw error;
            }
        } else if (callback) {
            callback(null);
        }
    });
}

function open(url, callback) {
    getCommand().then(cmd => {
        return openURL(cmd, url, (err) => {
            if(~cmd.indexOf('Chrome')) {
                spawnSync('open', ['-a', cmd])
            }
        })
    })
}

module.exports = open
