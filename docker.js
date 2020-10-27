const { spawn } = require('child_process');

function docker_run(filename, lang){
    full_dirname = __dirname+'/temp/'+filename+'/';

    return new Promise((resolve)=>{
        switch(lang){
            case 'cpp':
                const docker_cpp = spawn('sudo', [
                    'docker','run', '--rm',
                    '--memory', '75m',
                    '--cpus', '0.5',
                    '--name', filename,
                    '--volume', full_dirname+':/my',
                    '--init',
                    'run-cpp',
                    'timeout', '-s', 'SIGKILL', '5',
                    '/bin/sh',
                    '-c', 'g++ /my/main.cpp; ./a.out < /my/in'
                ],{detached:true});
                setTimeout(()=>{
                        resolve({"error":">4 seconds: Time limit exceeded","stdout":"","stderr":""});
                }, 4000);
                docker_cpp.stdout.setEncoding('utf-8');
                docker_cpp.stderr.setEncoding('utf-8');
                const resp = {"stdout":"", "stderr":"","error":""};
                docker_cpp.stderr.on('data', (data)=>{resp.stderr += data});
                docker_cpp.stdout.on('data', (data)=>{
                        resp.stdout += data;
                        if(resp.stdout.length>5000){
                                resolve({"error":">5000 characters: Stdout limit exceeded", "stderr":resp.stderr, "stdout":resp.stdout});
                        }
                });
                docker_cpp.on('exit', ()=>resolve(resp));
                docker_cpp.on('error', ()=>resolve({"error":"Docker error","stdout":"","stderr":""}));
                break;
            case 'py':
                const docker_py = spawn('sudo', [
                    'docker','run', '--rm',
                    '--memory', '75m',
                    '--cpus', '0.5',
                    '--name', filename,
                    '--volume', full_dirname+':/my',
                    '--init',
                    'run-python',
                    'timeout', '-s', 'SIGKILL', '5',
                    '/bin/sh',
                    '-c', 'python3 /my/main.py < /my/in'
                ], {detached:true});
                setTimeout(()=>{
                        resolve({"error":">4 seconds: Time limit exceeded","stdout":"","stderr":""});
                }, 4000);
                docker_py.stdout.setEncoding('utf-8');
                docker_py.stderr.setEncoding('utf-8');
                const resp_ = {"stdout":"", "stderr":"","error":""};
                docker_py.stderr.on('data', (data)=>{resp_.stderr += data});
                docker_py.stdout.on('data', (data)=>{
                        resp_.stdout += data;
                        if(resp_.stdout.length>5000) {
                                resolve({"error":">5000 characters: Stdout limit exceeded", "stderr":resp_.stderr, "stdout":resp_.stdout});
                        }
                });
                docker_py.on('exit', ()=>resolve(resp_));
                docker_py.on('error', ()=>resolve({"error":"Docker error","stdout":"","stderr":""}));
                break;
            default:
                resolve({"error":"supported languages are cpp, py","stdout":"","stderr":""})
        }
    });
}

module.exports = docker_run;
