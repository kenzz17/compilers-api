const express = require('express');
const docker_run = require('./docker')
const uuid = require('uuid');
const util = require('util');
const { spawn, spawnSync } = require('child_process');

// promisifed method
const writeFile_promise = util.promisify(require('fs').writeFile);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req, res) => {
    res.json({"team":"kenzz17","members":["Shivam Raj","Aman Singh", "Pawan Kumar","Aniket Agrawal"]})
})

app.get('/v1', (req, res) => {
    res.json({"lang":"", "code":"", "stdin":""})
})

app.post('/v1', async (req,res) => {
    if(req.body.passwd != '314159kenzz17') return res.json({"error":"Access Denied","stdout":"","stdout":""});
    filename = uuid.v4();
    try {
        spawnSync('sudo', ['mkdir','-p', './temp/'+filename]);
        const code = writeFile_promise('./temp/'+filename+'/main.'+req.body.lang, req.body.code);
        const stdin = writeFile_promise('./temp/'+filename+'/in', req.body.stdin);
        await Promise.all([code, stdin]).catch(()=>{throw 'err'});
    } catch (err) {
        spawn('sudo', ['rm','-r', './temp/'+filename]);
        return res.json({"error":"Unable to write","stderr":"","stdout":""});
    }
    docker_run(filename, req.body.lang)
       .then((data)=>{
            spawn('sudo', ['rm','-r', './temp/'+filename]);
            res.json(data);
        })
       .catch(()=>{
            spawn('sudo', ['rm','-r', './temp/'+filename]);
            res.json({"error":"Unable to run/compile", "stderr":"", "stdout":""});
        });
})

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
