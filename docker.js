const { spawn } = require('child_process');

function run (cmd, image_name, filename, full_dirname,resolve){
    const docker_process = spawn('sudo', [
        'docker','run', '--rm',
        '--memory', '75m',
        '--cpus', '0.5',
        '--name', filename,
        '--volume', full_dirname+':/my',
        '--init',
        image_name,
        'timeout', '-s', 'SIGKILL', '5',
        '/bin/sh',
        '-c', cmd
    ],{detached:true});
    docker_process.stdout.setEncoding('utf-8'); docker_process.stderr.setEncoding('utf-8');

    setTimeout(()=>{
            resolve({"error":">4 seconds: Time limit exceeded","stdout":"","stderr":""});
    }, 4000);

    const resp = {"stdout":"", "stderr":"","error":""};
    docker_process.stderr.on('data', (data)=>{resp.stderr += data});
    docker_process.stdout.on('data', (data)=>{
            resp.stdout += data;
            if(resp.stdout.length>5000){
                    resolve({"error":">5000 characters: Stdout limit exceeded", "stderr":resp.stderr, "stdout":resp.stdout});
            }
    });

    docker_process.on('exit', ()=>resolve(resp));
    docker_process.on('error', ()=>resolve({"error":"Docker error","stdout":"","stderr":""}));
}

function docker_run(filename, lang){
    full_dirname = __dirname+'/temp/'+filename+'/';

    return new Promise((resolve)=>{
        switch(lang){
            case 'cpp':
                run('g++ /my/main.cpp; ./a.out < /my/in', 'run-cpp', filename, full_dirname, resolve);
                break;
            case 'py':
                run('python3 /my/main.py < /my/in', 'run-python', filename, full_dirname, resolve);
                break;
            case 'js':
                run('node /my/main.js < /my/in', 'run-js', filename, full_dirname, resolve);
                break;
            default:
                resolve({"error":"supported languages are cpp, py","stdout":"","stderr":""})
        }
    });
}

module.exports = docker_run;
