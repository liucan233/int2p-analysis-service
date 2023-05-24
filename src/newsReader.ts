/**
 * 从int2p数据库读取int2p_temporary表技术条目标题和关键词等
 */

import { Connection, Pool } from "mysql";

/**int2p_temporary表site_type枚举 */
export enum ESiteType {
  /**创新政策 */
  InnovationPolicy = 3,
  /**外站新闻 */
  ForeignNews = 4,
  /**外语期刊 */
  ForeignJournal = 5,
  /**技术专利 */
  TechnicalMonopoly = 6,
}

/**int2p_temporary表字段 */
export type TInt2pTemporary = {
  id: number;
  site_name: string;
  site_type: ESiteType;
  public_time: Date;
  crawl_time: Date;
  org_title: string;
  zh_title: string;
  url: string;
  author: string;
  org_content: string;
  zh_content: string;
  org_keywords: string;
  zh_keywords: string;
  org_organization: string;
  zh_organization: string;
  person: string;
  location: string;
  language: string;
  periodicals_num: string;
  publication_num: string;
  description: string;
  assignee: string;
  status: 0 | 1;
  remarks: string;
};

const getSiteTypeQueryString = (siteType: ESiteType[]) => {
  return siteType
    .reduce((acc, cur) => acc + ` OR site_type=${cur} `, "")
    .substring(3);
};

/**获取技术条目数量 */
export const getNewsNum = (
  database: Connection | Pool,
  siteType: ESiteType[]
) =>
  new Promise<number>((r) => {
    database.query(
      "SELECT COUNT(*) FROM int2p_temporary WHERE " +
        getSiteTypeQueryString(siteType),
      (error, result) => {
        if (error) {
          throw error;
        }
        r(result[0]["COUNT(*)"]);
      }
    );
  });

/**获取技术条目表指定开始和结束行 */
export const getNewsArr = <T extends Array<keyof TInt2pTemporary>>(
  database: Connection | Pool,
  start: number,
  end: number,
  siteType: ESiteType[],
  keyArr: T
) =>
  new Promise<Array<{ [K in T[number]]: TInt2pTemporary[K] }>>((r) => {
    const handleCallback = (
      error: Error,
      result: Array<{ [K in T[number]]: TInt2pTemporary[K] }>
    ) => {
      if (error || !result) {
        throw error;
      }
      r(result);
    };
    database.query(
      `SELECT ${keyArr.join(",")} FROM int2p_temporary
             WHERE ${getSiteTypeQueryString(
               siteType
             )} ORDER BY public_time ASC LIMIT ${start},${end - start};`,
      handleCallback
    );
    // console.log(`SELECT ${keyArr.join(",")} FROM int2p_temporary
    //     WHERE ${getSiteTypeQueryString(
    //       siteType
    //     )} ORDER BY public_time ASC LIMIT ${start},${end - start};`);
  });
