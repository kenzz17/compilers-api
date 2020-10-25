const { spawn } = require('child_process');

function docker_run(filename, lang){
    full_dirname = __dirname+'/temp/'+filename+'/';

    return new Promise((resolve)=>{
        switch(lang){
            case 'cpp':
                const docker_cpp = spawn('docker', [
                    'run', '--rm',
                    '--volume', full_dirname+':/my',
                    'run-cpp',
                    '/bin/sh',
                    '-c', 'g++ /my/main.cpp; ./a.out < /my/in'
                ]);
                docker_cpp.on('exit', ()=>{
                    docker_cpp.stdout.setEncoding('utf-8');
                    docker_cpp.stderr.setEncoding('utf-8');
                    docker_cpp.stderr.on('data', (data)=>resolve({"stdout":"","stderr":data}));
                    docker_cpp.stdout.on('data', (data)=>{resolve({"stdout":data,"stderr":""})});
                })
                break;
            case 'py':
                const docker_py = spawn('docker', [
                    'run', '--rm',
                    '--volume', full_dirname+':/my',
                    'run-python',
                    '/bin/sh',
                    '-c', 'python3 /my/main.py < /my/in'
                ]);
                docker_py.on('exit', ()=>{
                    docker_py.stdout.setEncoding('utf-8');
                    docker_py.stderr.setEncoding('utf-8');
                    docker_py.stderr.on('data', (data)=>resolve({"stdout":"","stderr":data}));
                    docker_py.stdout.on('data', (data)=>resolve({"stdout":data,"stderr":""}));
                })
                break;
        }
    });
}

module.exports = docker_run;