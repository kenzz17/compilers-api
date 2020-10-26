const express = require('express');
const docker_run = require('./docker') 
const uuid = require('uuid');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
    res.send('Send post requests as {"lang":"---", "code":"---", "stdin":"---"}')
})

app.get('/v1', (req, res) => {
    res.send('Send post requests as {"lang":"---", "code":"---", "stdin":"---"}')
})

app.post('/v1', (req,res) => {
    filename = uuid.v4();
    spawn('mkdir', ['-p', './temp/'+filename]).on('exit',() => {
    fs.writeFile('./temp/'+filename+'/main.'+req.body.lang, req.body.code, (err1) => {
        fs.writeFile('./temp/'+filename+'/in', req.body.stdin, (err2) => {
            if(err1 || err2) {
                spawn('rm', ['-r', './temp/'+filename]);
                return res.json({"error":"Unable to write"});
            }
            docker_run(filename, req.body.lang).then(
                (data)=>{
                    spawn('rm', ['-r', './temp/'+filename]);
                    return res.json(data);
                }
            ).catch(
                ()=>{
                    spawn('rm', ['-r', './temp/'+filename]);
                    return res.json({"error":"Unable to run/compile"});
                }
            );
        })
    })
    })

})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));