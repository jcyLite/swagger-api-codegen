#!/usr/bin/env node


 import { genApi } from "./index";
 import { loadMoonConfig } from "./util/config";
 import { IMoonConfig } from "./typings/config";
 
 (async () => {
   let projectPath = process.cwd();
   let config = (await loadMoonConfig()) as IMoonConfig;
   await genApi({
     workDir: projectPath,
     config: config.api,
   });
 })();
 