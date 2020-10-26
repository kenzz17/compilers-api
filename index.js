const express = require('express');
const docker_run = require('./docker') 
const uuid = require('uuid');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
    res.json({"team":"kenzz17","members":["Shivam Raj","Aman Singh", "Pawan Kumar","Aniket Agrawal"]})
})

app.get('/v1', (req, res) => {
    res.json({"lang":"", "code":"", "stdin":""})
})

app.post('/v1', (req,res) => {
    if(req.body.passwd != '314159kenzz17') return res.json({"error":"Access Denied","stdout":"","stdout":""});
    filename = uuid.v4();
    spawn('sudo', ['mkdir','-p', './temp/'+filename]).on('exit',() => {
    fs.writeFile('./temp/'+filename+'/main.'+req.body.lang, req.body.code, (err1) => {
        fs.writeFile('./temp/'+filename+'/in', req.body.stdin, (err2) => {
            if(err1 || err2) {
                spawn('sudo', ['rm','-r', './temp/'+filename]);
                return res.json({"error":"Unable to write","stderr":"","stdout":""});
            }
            docker_run(filename, req.body.lang).then(
                (data)=>{
                    spawn('sudo', ['rm','-r', './temp/'+filename]);
                    return res.json(data);
                }
            ).catch(
                ()=>{
                    spawn('sudo', ['rm', './temp/'+filename]);
                    return res.json({"error":"Unable to run/compile", "stderr":"", "stdout":""});
                }
            );
        })
    })
    })

})

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
