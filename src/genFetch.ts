import { IMoonConfig } from "./typings/config";
import * as ejs from "ejs"
import * as path from "path"
import * as fse from "fs-extra"
import { formatTypescript } from "./util/prettier.common";
export async function genFetch(config:IMoonConfig){
    return new Promise((resolve)=>{
        const fetchPath = path.resolve(process.cwd(),config.dir,"fetch.ts")
        fse.ensureFileSync(fetchPath)
        ejs.renderFile(path.resolve(__dirname,"../tpl/fetch.ts.ejs"),{config},{},(error,res)=>{
            fse.writeFileSync(fetchPath,formatTypescript(res))
            resolve(void 0)
        })
    })
}