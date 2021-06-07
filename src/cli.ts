#!/usr/bin/env node


 import { genApi } from "./index";
 import { createSwaggerConfig, loadMoonConfig } from "./util/config";
 import { IMoonConfig } from "./typings/config";
import {synchronizeSwagger} from "./mock";
import * as program  from "commander"
import * as chalk from "chalk"
 import {genFetch} from "./genFetch"
 (async () => { 
    program
      .version(require("../package.json").version)
      .option("-h, --help")
      .action(async (d, otherD,cmd) => {
        // if(otherD)
        if(d.help){
          console.log(`
          ${chalk.rgb(0,255,243).bold("Usage: swagger-cli [options]")}
            ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("-V")} : 显示版本号;
            ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("init")} : 初始化项目配置文件 ;
            ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("mock")} : 根据swagger数据生成mock数据;
            ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("api")}  : 根据swagger数据生成api层代码;
            ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("g fetch")} : 生成fetch层的代码（每个api都会引入的文件）;
          `)
        }
        ({
          async mock(){
            let config = (await loadMoonConfig()) as IMoonConfig;
            synchronizeSwagger.init({...config.mock,url:config.swaggerUrl}).then((item:any) => {
              if (item.state === 'success') {
                console.log(chalk.green('生成mock成功！'))
              }
            }).catch((err:any) => {
              console.log(chalk.red('生成mock失败！'))
            })
          },
          async api(){
            let config = (await loadMoonConfig()) as IMoonConfig;
            await genApi({
              workDir: process.cwd(),
              config: config,
            });
          },
          async g(){
            ({
              async fetch(){
                let config = (await loadMoonConfig()) as IMoonConfig;
                await genFetch(config)
              }
            })[otherD.args[1]]?.();
          },
          init(){
            createSwaggerConfig()
          }
        })[otherD.args[0]]?.()
      })
    program.parse(process.argv)
 })();
 