/**
 * @desc
 *
 * @使用场景
 *
 
 * @Date    2020/5/12
 **/
import Method from "./method";
import { SchemaProps } from "@/types/api";

export default class ApiGroup {
  apis: Method[] = [];

  definitions: { [name: string]: SchemaProps } = {};

  constructor(
    public options: {
      name: string;
      serverInfo: any;
    }
  ) {}

  get name() {
    return this.options.name;
  }

  get serverInfo() {
    return this.options.serverInfo;
  }

  addApis(apis: Method[]) {
    this.apis = this.apis.concat(apis);
  }

  /**
   * 添加一个api
   * @param api
   */
  addApi(api: Method) {
    this.apis.push(api);
  }

  /**
   * 是否已经存在方法;
   * @param methodName
   */
  isMethodNameExist(methodName: string) {
    return !this.apis.every((method) => method.name !== methodName);
  }
}
