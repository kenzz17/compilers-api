const { spawn } = require('child_process');

function docker_run(filename, lang){
    full_dirname = __dirname+'/temp/'+filename+'/';

    return new Promise((resolve)=>{
        switch(lang){
            case 'cpp':
                const docker_cpp = spawn('docker', [
                    'run', '--rm',
                    '--stop-timeout', '5',
                    '--volume', full_dirname+':/my',
                    'run-cpp',
                    '/bin/sh',
                    '-c', 'g++ /my/main.cpp; ./a.out < /my/in'
                ]);
                docker_cpp.stdout.setEncoding('utf-8');
                docker_cpp.stderr.setEncoding('utf-8');
                const resp = {"stdout":"", "stderr":""};
                docker_cpp.stderr.on('data', (data)=>{resp.stderr += data});
                docker_cpp.stdout.on('data', (data)=>{
                        resp.stdout += data;
                        if(resp.stdout.length>10000) resolve({"error":"Stdout limit exceeded", "stderr":resp.stderr, "stdout":resp.stdout});
                });
                docker_cpp.on('exit', ()=>resolve(resp));
                docker_cpp.on('error', ()=>resolve({"error":"Docker error"}));
                break;
            case 'py':
                const docker_py = spawn('docker', [
                    'run', '--rm',
                    '--stop-timeout', '5',
                    '--volume', full_dirname+':/my',
                    'run-python',
                    '/bin/sh',
                    '-c', 'python3 /my/main.py < /my/in'
                ]);
                docker_py.stdout.setEncoding('utf-8');
                docker_py.stderr.setEncoding('utf-8');
                const resp_ = {"stdout":"", "stderr":""};
                docker_py.stderr.on('data', (data)=>{resp_.stderr += data});
                docker_py.stdout.on('data', (data)=>{
                        resp_.stdout += data;
                        if(resp_.stdout.length>10000) resolve({"error":"Stdout limit exceeded", "stderr":resp_.stderr, "stdout":resp_.stdout});
                });
                docker_py.on('exit', ()=>resolve(resp_));
                docker_py.on('error', ()=>resolve({"error":"Docker error"}));
                break;
            default:
                resolve({"error":"supported languages are cpp, py"})
        }
    });
}

module.exports = docker_run;