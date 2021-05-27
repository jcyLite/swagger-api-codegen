
import { join } from "path";
import * as fse from "fs-extra";
import { IMoonConfig ,IBackendConfig} from "../typings/config";


export async function loadMoonConfig(
  projectDir = process.cwd()
): Promise<IMoonConfig | IBackendConfig> {
  let defaulltMoonConfig: IMoonConfig;

  let JSONconfigFilePath = join(projectDir, ".moon.json");
  let jsConfigFilePath = join(projectDir, "moon-config.js");
  try {
    if (fse.existsSync(JSONconfigFilePath)) {
      console.log("读取配置文件", JSONconfigFilePath);
      defaulltMoonConfig = await fse.readJSON(JSONconfigFilePath);
    } else if (fse.existsSync(jsConfigFilePath)) {
      console.log("读取配置文件", jsConfigFilePath);
      defaulltMoonConfig = require(jsConfigFilePath);
    } else {
      throw new Error("配置不存在:" + JSONconfigFilePath);
    }
  } catch (err) {
    console.error(err);
    throw new Error("配置读取失败:" + JSONconfigFilePath);
  }

  return defaulltMoonConfig;
}
