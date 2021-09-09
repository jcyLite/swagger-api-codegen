import { IMockConfig } from "./mock";
export interface IApiConfig{
  genFetch?:boolean;
  dir:string;
  plugins?:any[];
  wrapper?:string;
  exclude?: string[];
  include?: string[];
}
export type IBaseConfig = {
  swaggerUrl?: string;
  swaggerUrls?: string[];
  /** 自定义api模板 */
  apiTpl?:string;
  type?:'js'|'ts';
  api?:IApiConfig;
  mock?:IMockConfig;
}
export type IApiGroup = {
  /** 用于拼接apiGroup中的api.dir路径 */
  apiBaseDir?:string;
  /** 用于拼接swaggerUrl的路径 */
  swaggerUrlBaseDir?:string;
  /** ts情况下直接生成，js的情况下生成后使用tsc编译一下 */
  type?:'js'|'ts';
  /** api配置组成的数组 */
  apiGroup?:IBaseConfig[];
}
/** 交叉类型 */
export type IConfig = IBaseConfig & IApiGroup


export type TargetType="h5-redux"|"taro-redux";

export interface IBackendConfig {
  db: {
    connect: {
      host: string;
      user: string;
      password: string;
      database: string;
    };
    //保存目录;
    saveDir: string;
    plugins?: any[];
  };
}