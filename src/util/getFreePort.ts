
import * as chalk from "chalk"
import * as net from "net";
function portInUse(port:number){
    return new Promise((resolve, reject)=>{
        let server = net.createServer().listen(port);
        server.on('listening',function(){
            server.close();
            resolve(port);
        });
        server.on('error',function(err:any){
            if(err.code == 'EADDRINUSE'){
                resolve(err);
            }
        });             
    });
}
 
const tryUsePort = async function<T extends number>(port:T, portAvailableCallback:(port:T)=>void){
    let res = await portInUse(port);
    if(res instanceof Error){
        console.log(`${chalk.yellow(`WARN:`)} 端口${port}被占用,正在尝试其他端口号...`);
        port++;
        tryUsePort(port, portAvailableCallback);
    }else{
        portAvailableCallback(port);
    }
}
 
export function getFreePort(port:number){
    return new Promise((resolve,reject)=>{
        tryUsePort(port,(p)=>{
            resolve(p)
        })
    })
}