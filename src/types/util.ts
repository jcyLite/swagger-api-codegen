/**
 * @desc
 *
 * @使用场景
 *
 * @Date    2019/5/31
 **/
import {SchemaProps} from "./api";
import {IAction, IActorItem, IFileSaveOptions, ISubComp} from "./page";

export interface IHandlePageParam {
  saveFilePath: string;
  subComp?: ISubComp;
  actor?: IActorItem;
  action?: IAction
}

export interface IFileSaveOpt {
  beforeSave?: (options: IFileSaveOptions, context: any) => Promise<IFileSaveOptions>;
  afterSave?: (options: IFileSaveOptions, context: any) => Promise<void>;
}

export interface IHandleFile {
  outDir: string;
  tplBase: string;
  context: IFileSaveOpt;
  prettiesConfig?: object;
}

export interface IInsertOption {
  mark: string|RegExp;
  isBefore?: boolean;
  content: string;
  /**
   *
   * @param content
   * @returns {boolean}   验证是否需要做 true  继续,false 中断
   */
  check?: (content, rawContent) => boolean;
}

export interface IJsonTsGenResult extends ITsGenResult {
  typeName: string;
  tsContent: string;
  schema: SchemaProps;
}

export interface ITsGenResult {
  typeName: string;
  tsContent: string
}