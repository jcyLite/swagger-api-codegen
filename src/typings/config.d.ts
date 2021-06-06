import { IMockConfig } from "./mock";
export interface IMoonConfig{
    swaggerUrl?: string;
    swaggerUrls?: string[];
    genFetch?:boolean;
    dir:string;
    plugins?:any[];
    wrapper?:string;
    exclude?: string[];
    include?: string[];
    mock?:IMockConfig
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