import { IConfig } from "../types/config";
import * as ejs from "ejs"
import * as path from "path"
import * as fse from "fs-extra"
import * as chalk from "chalk"
import { formatTypescript } from "./prettier.common";
import { loadJson } from "..";
export function genTpl(config:IConfig,tpl:string,file:string,workDir:string){
    return new Promise(async (resolve)=>{
        const filePath = path.resolve(workDir,config.api.dir,file)
        fse.ensureDir(path.resolve(workDir,config.api.dir))
        fse.ensureFileSync(filePath)
        let apiInfo = await loadJson(config.swaggerUrl,workDir)
        ejs.renderFile(path.resolve(__dirname,"../../tpl/"+tpl),{config,apiInfo},{},(error,res)=>{
            fse.writeFileSync(filePath,formatTypescript(res))
            console.log(chalk.green(`生成${file}文件成功！`))
            resolve(file)
        })
    })
}