#!/usr/bin/env node

import * as program  from "commander"
import * as chalk from "chalk"
import { Clis } from ".";
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
        const clis = new Clis();
        const cli0 = await clis[otherD.args[0]]?.();
        await cli0?.[otherD.args[1]]?.()
      })
    program.parse(process.argv)
 })();
 