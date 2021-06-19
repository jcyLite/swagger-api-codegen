#!/usr/bin/env node


 import { genApi, loadJson } from "./index";
 import { createSwaggerConfig, loadMoonConfig } from "./util/config";
 import { IConfig } from "./typings/config";
import {synchronizeSwagger} from "./mock";
import * as program  from "commander"
import * as chalk from "chalk"
import * as path from "path"
import * as express from "express"
import { getFreePort } from "./util/getFreePort";
import { genTpl } from "./util/genTpl";
 (async () => { 
    program
      .version(require("../package.json").version)
      .option("-h, --help")
      .action(async (d, otherD,cmd) => {
        if(d.help){
          console.log(`
            ${chalk.rgb(0,255,243).bold("Usage: swagger-cli [options]")}
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("-V")} : 显示版本号;
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("init")} : 初始化项目配置文件;
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("v api")} : 查看api的ui;
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("g mock")} : 根据swagger数据生成mock数据;
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("g api")}  : 根据swagger数据生成api层代码;
              ${chalk.rgb(255,141,0).bold("swagger")} ${chalk.green("g fetch")} : 生成fetch层的代码（每个api都会引入的文件）;
          `)
        }
        class clis{
          async v(){
            return await this.view();
          }
          async view(){
            let config = (await loadMoonConfig()) as IConfig;
            ({
              async api(){
                const app = express();
                app.use(express.static(path.resolve(__dirname,'../webview/petstore.swagger.io')))
                app.get("/v2/api-doc",async (req,res)=>{
                  let data = await loadJson(config.swaggerUrl)
                  res.send(data)
                })
                let port = await getFreePort(3333);
                app.listen(port,()=>{
                  console.log(`${chalk.green(`INFO:`)} the swagger ui run at  http://localhost:${port} successful`)
                })
              },
            })[otherD.args[1]]?.();
          }
          async g(){
            return await this.generate();
          }
          async generate(){
            let config = (await loadMoonConfig()) as IConfig;
            ({
              async fetch(){
                await genTpl(config,"fetch.ts.ejs","fetch.ts")
              },
              async api(){
                await genApi({
                  workDir: process.cwd(),
                  config: {...config.api,swaggerUrl:config.swaggerUrl,swaggerUrls:config.swaggerUrls},
                });
              },
              async serverInfo(){
                await genTpl(config,"serverInfo.ts.ejs","serverInfo.ts")
              },
              async mock(){
                synchronizeSwagger.init({...config.mock,url:config.swaggerUrl}).then((item:any) => {
                  if (item.state === 'success') {
                    console.log(chalk.green('生成mock成功！'))
                  }
                }).catch((err:any) => {
                  console.log(chalk.red('生成mock失败！'))
                })
              },
            })[otherD.args[1]]?.();
          }
          async i(){
            return this.init();
          }
          async init(){
            createSwaggerConfig()
          }
        }
        (new clis)[otherD.args[0]]?.()
      })
    program.parse(process.argv)
 })();
 