import { logger } from "./logger";
import { ESiteType } from "./newsReader";

/**储存id、中文名和英文名 */
type TMapValue = { id: number; zhName: string; enName: string; count: number };

type TEntityRelationArr = Array<{
  author: string;
  id: number;
  site_type: ESiteType;
  public_time: Date;
  crawl_time: Date;
  zh_title: string;
  url: string;
  zh_keywords: string;
  org_organization: string;
  zh_organization: string;
  person: string;
  language: string;
}>;

const addToMap = (m: Map<string, TMapValue>, arr: string[]) => {
  const idArr: number[] = [];
  for (const s of arr) {
    let person = m.get(s);
    if (person) {
      person.count++;
    } else {
      const personInfo = {
        zhName: "",
        enName: s,
        id: m.size,
        count: 1,
      };
      idArr.push(personInfo.id);
      m.set(s, personInfo);
    }
  }
  return idArr;
};

export const getEntityRelationGenerator = () => {
  logger.info(`记录人员名和机构名相关MAP已经初始化`);
  const institutionMap = new Map<string, TMapValue>(),
    personMap = new Map<string, TMapValue>();
  const personPair: Array<[number, number]> = [],
    institutionPair: Array<[number, number]> = [];

  return (newsArr?: TEntityRelationArr) => {
    if (!newsArr || newsArr.length < 1) {
      return {
        institutionMap,
        institutionPair,
        personMap,
        personPair,
      };
    }
    newsArr.forEach((news, index) => {
      /**作者列表 */
      const authorArr = news.author
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s);

      let idArr = addToMap(personMap, authorArr);
      // 建立作者之间的关系
      for (let j = 1; j < idArr.length; j++) {
        for (let k = 0; k < j; k++) {
          personPair.push([idArr[j], idArr[k]]);
        }
        // if (j + 1 === idArr.length) {
        //   personPair.push([idArr[j], idArr[0]]);
        // } else {
        //   personPair.push([idArr[j-1], idArr[j]]);
        // }
      }

      const institutionArr = (eval(news.org_organization) as string[]).filter(
        (name) => {
          return (
            typeof name === "string" &&
            /^[A-Z]/.test(name) &&
            /^(?:\w| )+$/.test(name)
          );
        }
      );
      idArr = addToMap(institutionMap, institutionArr);

      for (let j = 1; j < idArr.length; j++) {
        for (let k = 0; k < j; k++) {
          institutionPair.push([idArr[j], idArr[k]]);
        }
        // if (j + 1 === idArr.length) {
        //   institutionPair.push([idArr[j], idArr[0]]);
        // } else {
        //   institutionPair.push([idArr[j-1], idArr[j]]);
        // }
      }
    });
    return {
      institutionMap,
      institutionPair,
      personMap,
      personPair,
    };
  };
};
