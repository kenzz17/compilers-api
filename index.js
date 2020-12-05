const express = require('express');
const docker_run = require('./docker')
const uuid = require('uuid');
const util = require('util');
const { spawn, spawnSync } = require('child_process');

// promisifed method
const writeFile_promise = util.promisify(require('fs').writeFile);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req, res) => {
    res.json({ "team": "kenzz17", "members": ["Shivam Raj", "Aman Singh", "Pawan Kumar", "Aniket Agrawal"] })
})

app.post('/v1', async (req, res) => {
    if (req.body.passwd != '314159kenzz17') return res.json({ "error": "Access Denied", "stdout": "", "stdout": "" });

    filename = uuid.v4();
    toRun = '__main__.' + req.body.lang;
    try {
        spawnSync('sudo', ['mkdir', '-p', './temp/' + filename]);
        const code = writeFile_promise('./temp/' + filename + '/' + toRun, req.body.code);
        const stdin = writeFile_promise('./temp/' + filename + '/in', req.body.stdin);
        await Promise.all([code, stdin]).catch((err) => { throw 'err' });
    } catch (err) {
        spawn('sudo', ['rm', '-r', './temp/' + filename]);
        return res.json({ "error": "Unable to write", "stderr": "", "stdout": "" });
    }

    docker_run(filename, toRun, req.body.lang)
        .then((data) => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json(data);
        })
        .catch(() => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json({ "error": "Unable to run/compile", "stderr": "", "stdout": "" });
        });
})

app.post('/v2', async (req, res) => {
    if (req.body.passwd != '314159kenzz17') return res.json({ "error": "Access Denied", "stdout": "", "stdout": "" });

    filename = uuid.v4();
    toRun = '__main__.' + req.body.lang;
    try {
        spawnSync('sudo', ['mkdir', '-p', './temp/' + filename]);
        const helper = [];
        req.body.helper.forEach((ele, idx) => {
            helper.push(writeFile_promise('./temp/' + filename + '/' + ele.name + '.' + ele.lang, ele.body));
        });
        const code = writeFile_promise('./temp/' + filename + '/' + toRun, req.body.code);
        const stdin = writeFile_promise('./temp/' + filename + '/in', req.body.stdin);
        await Promise.all([...helper, code, stdin]).catch((err) => { throw 'err' });
    } catch (err) {
        spawn('sudo', ['rm', '-r', './temp/' + filename]);
        return res.json({ "error": "Unable to write", "stderr": "", "stdout": "" });
    }

    docker_run(filename, toRun, req.body.lang)
        .then((data) => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json(data);
        })
        .catch(() => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json({ "error": "Unable to run/compile", "stderr": "", "stdout": "" });
        });
})

app.post('/v3', async (req, res) => {
    if (req.body.passwd != '314159kenzz17') return res.json({ "error": "Access Denied", "stdout": "", "stdout": "" });

    filename = uuid.v4();
    toRun = req.body.path + '/' + req.body.name + '.' + req.body.lang;
    try {
        const helper = [];
        req.body.helper.forEach((ele, idx) => {
            file = './temp/' + filename + '/' + ele.path + '/' + ele.name + '.' + ele.lang;
            dir = './temp/' + filename + '/' + ele.path + '/';
            spawnSync('sudo', ['mkdir', '-p', dir]);
            helper.push(writeFile_promise(file, ele.body));
        });
        const stdin = writeFile_promise('./temp/' + filename + '/in', req.body.stdin);
        await Promise.all([...helper, stdin]).catch((err) => { throw 'err' });
    } catch (err) {
        spawn('sudo', ['rm', '-r', './temp/' + filename]);
        return res.json({ "error": "Unable to write", "stderr": "", "stdout": "" });
    }

    docker_run(filename, toRun, req.body.lang)
        .then((data) => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json(data);
        })
        .catch(() => {
            spawn('sudo', ['rm', '-r', './temp/' + filename]);
            res.json({ "error": "Unable to run/compile", "stderr": "", "stdout": "" });
        });
})

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
