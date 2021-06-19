
import { join } from "path";
import * as fse from "fs-extra";
import { IConfig ,IBackendConfig} from "../typings/config";
import * as inquirer from "inquirer"
import { formatJSON } from "./prettier.common";
import chalk = require("chalk");
async function createConfig(){
  return await inquirer.prompt([
    {
      type: "input",
      name: "swaggerUrl",
      default:"https://petstore.swagger.io/v2/swagger.json",
      message: "请输入能够直接获取到swaggerData的url路径"
    },
    {
      type:"input",
      name:"dir",
      default:"./src/api",
      message:"请输入你存放生成的api层的目录路径"
    },
    {
      type:"input",
      name:"wrapper",
      default:"data",
      message:"请输入返回值的包裹层"
    },{
      type:"confirm",
      name:"isMock",
      default:false,
      message:"是否同时生成mock数据"
    }
  ])

}
async function createMock(){
  return await inquirer.prompt([
    {
      type:"input",
      name:"dir",
      default:"mock",
      message:"请输入mock数据存放的目录"
    },
    {
      type:"input",
      name:"fileName",
      default:"index.ts",
      message:"请输入文件名称"
    }
  ])
}
export async function createSwaggerConfig(){
  const {wrapper,dir,swaggerUrl,isMock} = await createConfig()
    const options:IConfig = {
      swaggerUrl,api:{
        dir,wrapper
      }
    }
    if(isMock){
      let {dir,fileName} = await createMock()
      options.mock={
        dir,fileName
      }
    }
    
    await fse.writeFile(join( process.cwd(),"swaggerConfig.json"),formatJSON(options))
}
export async function loadMoonConfig(
  projectDir = process.cwd()
): Promise<IConfig | IBackendConfig> {
  let defaulltMoonConfig: IConfig;

  let JSONconfigFilePath = join(projectDir, "swaggerConfig.json");
  try {
    if (fse.existsSync(JSONconfigFilePath)) {
      console.log(chalk.green("正在读取配置文件"), JSONconfigFilePath);
      defaulltMoonConfig = await fse.readJSON(JSONconfigFilePath);
    } else {
      createSwaggerConfig()
      return loadMoonConfig(projectDir)
    }
  } catch (err) {
    console.error(err);
    throw new Error("配置读取失败:" + JSONconfigFilePath);
  }

  return defaulltMoonConfig;
}
