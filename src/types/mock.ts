export interface IMockConfig{
    url?:string,
    exclude?:string[];
    include?:string[];
    prefix?:string;
    dir?:string;
    dataLength?:string;
    fileName?:string;
    workDir?:string
}