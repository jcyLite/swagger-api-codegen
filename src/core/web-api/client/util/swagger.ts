import {
  IJSObjectProps,
  IWebApiContext,
  IWebApiDefinded,
  SchemaProps,
} from "@/types/api";
import { toLCamelize } from "../../../util/string-util";
import Method from "../domain/method";
import translate from "../google-translate-api";
import ApiGroup from "../domain/api-group";
import chalk = require("chalk");
import { camelCase } from "lodash";
export function resSchemaModify(
  schema: SchemaProps,
  apiItem: IWebApiDefinded,
  context: IWebApiContext,
  wrapper?: string
): SchemaProps {
  //api外了一层. 所有内容均把data提取出来d即可..
  if (!schema) {
    return schema;
  }

  if (apiItem.name === "sendSms_POST_4") {
  }

  if (!schema["originalRef"] && schema["$ref"]) {
    schema["originalRef"] = schema["$ref"].replace("#/definitions/", "");
  }

  //@ts-ignore;
  if (schema["originalRef"] === "BaseResponse") {
    return null;
  } else if (schema["$ref"]) {
    // console.log('schema[\'$ref\']',schema);
    let subSchema = JSON.parse(
      JSON.stringify(context.webapiGroup.definitions[
        schema["originalRef"]
      ] as IJSObjectProps)
    );

    if (!subSchema) {
      return null;
    }

    if (
      wrapper &&
      subSchema.type === "object" &&
      subSchema.properties &&
      subSchema.properties[wrapper]
    ) {
      if (subSchema.properties[wrapper]["$ref"]) {
        return context.webapiGroup.definitions[
          subSchema.properties[wrapper]["originalRef"] ||
            subSchema.properties[wrapper]["$ref"].replace("#/definitions/", "")
        ];
      } else if (subSchema.properties[wrapper]["type"] === "array") {
        //@ts-ignore
        if (
          !(
            subSchema.properties[wrapper].items.originalRef ||
            subSchema.properties[wrapper].items["$ref"]
          )
        ) {
          return null;
        }
        let arrayAschema = subSchema.properties[wrapper];
        arrayAschema.title =
          //@ts-ignore
          (subSchema.properties[wrapper].items.originalRef ||
            //@ts-ignore
            subSchema.properties[wrapper].items["$ref"].replace(
              "#/definitions/",
              ""
            )) + "Array";
        return arrayAschema;
      } else {
        return subSchema.properties[wrapper];
      }
    } else {
      return schema;
    }
  } else {
    return schema;
  }
}

export function addDef2List(
  definitions: {
    [defName: string]: SchemaProps;
  },
  schema: SchemaProps | SchemaProps[]
) {
  if (schema instanceof Array) {
    for (let i = 0, iLen = schema.length; i < iLen; i++) {
      let schemaItem = schema[i];

      if (!definitions[schemaItem.title]) {
        definitions[schemaItem.title] = schemaItem;
      }
    }
  } else {
    if (!definitions[schema.title]) {
      definitions[schema.title] = schema;
    }
  }
}

export function findAllRefType(
  definitions: {
    [defName: string]: SchemaProps;
  },
  obj: any,
  refs: string[] = []
): SchemaProps[] {
  if (!obj) {
    return [];
  }

  let refLeng = refs.length;
  traverseObj(obj, refs);

  let results = [];

  if (obj && !obj.$ref) {
    results.push(obj);
  }

  for (let i = refLeng, ilen = refs.length; i < ilen; i++) {
    let ref = refs[i].replace("#/definitions/", "");

    if (ref && definitions[ref]) {
      results.push(definitions[ref]);
      //遍历对象, 至到找到所有的引用内容为至;
      let jlen = refs.length;
      traverseObj(definitions[ref], refs);
      // console.log('子 traverseObj',refs);
      if (refs.length > jlen) {
        //有新的ref添加进来..

        for (let j = jlen, allen = refs.length; j < allen; j++) {
          results = results.concat(
            findAllRefType(
              definitions,
              definitions[refs[j].replace("#/definitions/", "")],
              refs
            )
          );
        }
      }
    }
  }

  return results;
}

/**
 * 遍历 对象 寻找 ref类型.
 */
function traverseObj(obj: object, refs: string[] = []) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && key === "$ref") {
      if (!refs.includes(obj[key])) {
        refs.push(obj[key]);
      }
    } else if (typeof obj[key] === "object") {
      traverseObj(obj[key], refs);
    }
  }
  return refs;
}

export interface ITag {
  name: string;
  description: string;
}

export interface IResponseDef {
  description: string;
  schema: SchemaProps;
}

export interface ISwaggerInfo {
  description: string;
  version: string;
  title: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
}

export interface IMethodDefinded {
  tags: string[];
  summary: string;
  operationId: string;
  produces: string[];
  parameters: any[];
  responses: {
    [status: string]: IResponseDef;
  };
  deprecated: boolean;
}

export interface IApiDefinded {
  get?: IMethodDefinded;
  post?: IMethodDefinded;
  [methodType: string]: IMethodDefinded;
}

export interface ISwaggerApisDocs {
  swagger: string;
  host: string;
  basePath: string;
  info: ISwaggerInfo;
  tags: ITag[];
  paths: {
    [apiUrl: string]: IApiDefinded;
  };
  definitions: {
    [defName: string]: SchemaProps;
  };
}

export interface OnError {
  (param: { level: "warn" | "error"; message: string }): void;
}

const nameCheckReg = /^[0-9a-zA-Z_\-«» ]*$/;
function isCheckable(content: string) {
  return nameCheckReg.test(content);
}
/** 创建在26个字母中的charCode */
function createChar(len:number):string{
  if(len>=26){
    len -= 26;
    return String.fromCharCode(90)+createChar(len)
  }else{
    return String.fromCharCode(len+65)
  }
}
/** 创建ids中不存在的id */
function genNoRepeatID(ids:string[],id:string,method:string):string{
  if(ids.includes(id)){
    let methodId = camelCase(method+' '+id)
    if(ids.includes(methodId)){
      let str = createChar(ids.length)
      return genNoRepeatID(ids,id+str,method)
    }else{
      return methodId
    }
  }else{
    return id
  }
}
/**
 * 转换项目
 * @param {ISwaggerApisDocs} apiDocs
 * @returns {ApiGroup[]}
 */
export async function transfer(
  apiDocs: ISwaggerApisDocs,
  onError: OnError = ({ message }) => console.error(message)
): Promise<ApiGroup[]> {
  //分组;
  let apiGroups: ApiGroup[] = [];
  let _apiDocs = apiDocs
  const mapper = new Map()
  /** 检查tags中的name description是否都存在 */
  for(let index in apiDocs.tags){
    const item =  apiDocs.tags[index]
    if(!item.name){
      console.log(chalk.yellow("检测到tags中不存在name字段，终止后续操作"))
    }
    if(!item.description){
      console.log(chalk.yellow("检测到tags中description为null,将name赋值给description"))
      item.description = item.name
    }
    if(/[\u4e00-\u9fa5]/.test(item.description)){
      console.log(chalk.yellow("检测到tags含有中文，正使用google翻译转换"))
      try{
        var description=(await translate(item.description,{to:'en'})).text;
      }catch(err){
        console.warn(chalk.yellow("使用谷歌翻译发生错误，请检查是否超过今日最大请求次数，下面将使用随机翻译"))
        var description = createChar(Number(index)+50)
      }
      
      const name =description.split(' ').join("-")
      mapper.set(item.name,name)
      _apiDocs.tags[index] = {
        name,
        description:description+' controller'
      }
    }
  }
  _apiDocs.definitions = apiDocs.definitions || {}
  /** operationId 不存在的情况处理 */
  const operationIds = [];
  Object.keys(apiDocs.paths).forEach((item)=>{
    Object.keys(apiDocs.paths[item]).forEach((_item)=>{
      _apiDocs.paths[item][_item] = {...apiDocs.paths[item][_item],tags:apiDocs.paths[item][_item].tags.map(item=>mapper.get(item)||item)}
      if(!_apiDocs.paths[item][_item].operationId){
        /** 优先使用ur最后两个作为operationId */
        let operationId =  genNoRepeatID(operationIds,camelCase(item.split("/").slice(-2).join(' ')),_item);
        _apiDocs.paths[item][_item].operationId = operationId
        operationIds.push(operationId);
      }  
    })
  })
  let tag2DescMap: { [name: string]: string } = (_apiDocs.tags || []).reduce(
    (acc, next) => {
      acc[next.name] = next.description
        .split(" ")
        .map(toLCamelize)
        .join("-");
      return acc;
    },
    {}
  );
  let checksContents = [
    ...Object.keys(_apiDocs.definitions),
    ...Object.values(tag2DescMap),
  ];

  //验证数据是否正确的.
  for (let i = 0, iLen = checksContents.length; i < iLen; i++) {
    let checksContent = checksContents[i];
    if (!isCheckable(checksContent)) {
      let message = `apiDocs.definitions或tags::包含非法字符,${checksContent},影响前端代码生成!`;
      onError && onError({ level: "warn", message });
    }
  }

  for (let defName in _apiDocs.definitions) {
    try {
      if (!_apiDocs.definitions[defName].title) {
        _apiDocs.definitions[defName].title = defName;
      }
    } catch (err) {}
  }

  let temp = {};
  let KeyMap: { [controllerName: string]: ApiGroup } = {};
  for (let url in _apiDocs.paths) {
    let apiItem: IApiDefinded = _apiDocs.paths[url];

    let groupKey = "";

    for (let method in apiItem) {
      let methodInfo: IMethodDefinded = apiItem[method];
      let apiDefItem: Method = new Method(methodInfo, { url, method }); //{url, method};

      if (tag2DescMap[methodInfo.tags[0]]) {
        groupKey = tag2DescMap[methodInfo.tags[0]];
        // 任何一个为非中文都可以 ;
        if (!isCheckable(groupKey) && isCheckable(methodInfo.tags[0])) {
          groupKey = methodInfo.tags[0];
        }
      } else {
        groupKey = methodInfo.tags[0];
      }

      if (!KeyMap[groupKey]) {
        KeyMap[groupKey] = new ApiGroup({
          name: groupKey,
          serverInfo: {
            host: _apiDocs.host,
            baseUrl: _apiDocs.basePath === "/" ? "" : _apiDocs.basePath,
            ..._apiDocs.info,
          },
        });
      }

      temp[url] = { url, methodName: methodInfo.operationId, group: groupKey };

      if (KeyMap[groupKey].isMethodNameExist(apiDefItem.name)) {
        console.warn("api名字相同::", groupKey, apiDefItem.name);
        continue;
      }

      apiDefItem.requestParam.map((item) => {
        if (item.schema) {
          addDef2List(
            KeyMap[groupKey].definitions,
            findAllRefType(apiDocs.definitions, item.schema)
          );
        }
      });

      addDef2List(
        KeyMap[groupKey].definitions,
        findAllRefType(apiDocs.definitions, apiDefItem.responseSchema)
      );
      KeyMap[groupKey].addApi(apiDefItem);
    }
  }

  for (let key in KeyMap) {
    apiGroups.push(KeyMap[key]);
  }
  return apiGroups;
}

let ParamNameExclude = ["function", "export", "delete"];

function getParamName(paramName: string) {
  if (ParamNameExclude.includes(paramName)) {
    return paramName + "_";
  } else if (paramName.includes("[]")) {
    return paramName.replace("[]", "");
  } else {
    return paramName;
  }
}
