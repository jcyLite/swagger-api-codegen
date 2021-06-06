#!/usr/bin/env node


 import { genApi } from "./index";
 import { loadMoonConfig } from "./util/config";
 import { IMoonConfig } from "./typings/config";
import {synchronizeSwagger} from "./mock";
import * as program  from "commander"
 import {genFetch} from "./genFetch"
 async function init(){
  let projectPath = process.cwd();
   let config = (await loadMoonConfig()) as IMoonConfig;
   await genApi({
     workDir: projectPath,
     config: config,
   });
   await genFetch(config)
   if(config.mock){
    synchronizeSwagger.init({...config.mock,url:config.swaggerUrl}).then((item:any) => {
      console.log('0%')
      if (item.state === 'success') {
        console.log('100%')
        console.log('生成mock成功！')
      }
    }).catch((err:any) => {
      console.log('生成mock失败！')
      console.error(err)
    })
   }
 }
 (async () => { 
   let config ;
    program
      .version(require("../package.json").version)
      .option("-init")
      .action(async (d, otherD,cmd) => {
        config = (await loadMoonConfig()) as IMoonConfig;
      })
      .option("-api")
      .action(async ()=>{
        await genApi({
          workDir: process.cwd(),
          config: config,
        });
      })
    program.parse(process.argv)
   
 })();
 