import * as prettier from "prettier"
export function formatJSON(json:{[k:string]:any}){
    return prettier.format(JSON.stringify(json),{
        parser:"json"
    })
}
export function formatTypescript(str:string){
    return prettier.format(str,{
        parser:"typescript"
    })
}