import { IMockConfig } from "./mock";
export interface IApiConfig{
  genFetch?:boolean;
  dir:string;
  plugins?:any[];
  wrapper?:string;
  exclude?: string[];
  include?: string[];
}
export interface IConfig{
    swaggerUrl?: string;
    swaggerUrls?: string[];
    api:IApiConfig;
    mock?:IMockConfig;
}


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