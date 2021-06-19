import { IConfig } from "../typings/config";
import * as ejs from "ejs"
import * as path from "path"
import * as fse from "fs-extra"
import * as chalk from "chalk"
import { formatTypescript } from "./prettier.common";
import { loadJson } from "..";
export async function genTpl(config:IConfig,tpl:string,file:string){
    return new Promise(async (resolve)=>{
        const fetchPath = path.resolve(process.cwd(),config.api.dir,file)
        fse.ensureFileSync(fetchPath)
        let apiInfo = await loadJson(config.swaggerUrl)
        ejs.renderFile(path.resolve(__dirname,"../../tpl/"+tpl),{config,apiInfo},{},(error,res)=>{
            fse.writeFileSync(fetchPath,formatTypescript(res))
            console.log(chalk.green(`生成${file}文件成功！`))
            resolve(file)
        })
    })
}