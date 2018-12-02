const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let algorithm = 'aes-256-cbc';
let password = 'myPass';

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/api/tree', (req, res) => {
    let servingDir;
    if (req.query.path) {
        // let dirPath = decrypt(req.query.path);
        let dirPath = req.query.path
        servingDir = path.resolve(__dirname, '..', dirPath);
        processReq(servingDir, res);
    } else {
        res.json([]);
    }
});

router.get('/api/resource', (req, res) => {
    // let filePath = decrypt(req.query.path);
    let filePath = req.query.path;
    let type = path.extname(filePath);
    switch (true) {
        case /\.(pdf|png|jpg)$/.test(type):
            res.send(fs.readFileSync(filePath, 'base64'));
            break;
        default:
            res.send(fs.readFileSync(filePath, 'UTF-8'));
    }
})

function processReq(servingDir, res) {
    let resp = [];
    fs.readdir(servingDir, (err, list) => {
        if (list) {
            for (let i = list.length - 1; i >= 0; i--) {
                resp.push(processNode(servingDir, list[i]));
            }
            res.json(resp);
        } else if (err) {
            res.json([]);
        }
    })
}

function processNode(servingDir, file) {
    let serve = fs.statSync(path.join(servingDir, file));
    return {
        // "path": encrypt(path.join(servingDir, file)),
        "path": path.join(servingDir, file),
        "title": file,
        "isDir": serve.isDirectory(),
        "ext": path.extname(file)
        // "id": path.join(servingDir, file),:
        // "text": file,
        // "icon": serve.isDirectory() ? 'jstree-custom-folder' : 'jstree-custom-file',
        // "state": {
        //     "opened": false,
        //     "disabled": false,
        //     "selected": false
        // },
        // "li_attr": {
        //     "base": path.join(servingDir, file),
        //     "isLeaf": !serve.isDirectory(),
        //     "ext": path.extname(file)
        // },
        // "children": serve.isDirectory()
    };
}

module.exports = router;