/**
 * 从数据库读取机构列表生成js map，同时，向map插入数据时将插入的数据写入数据库
 */

import { Connection, Pool } from "mysql";
import { logger } from "./logger";

/**获取机构表行数 */
const getInstitutionNum = (database: Connection | Pool) =>
    new Promise<number>((r) => {
        database.query("SELECT COUNT(*) FROM institution", (error, result) => {
            if (error) {
                throw error;
            }
            r(result[0]["COUNT(*)"]);
        });
    });

/**获取机构表指定开始和结束行 */
const getInstitutionArr = (database: Connection | Pool, start: number, end: number) =>
    new Promise<{ zh_name: string, en_name: string, id: number }[]>((r) => {
        database.query(`SELECT id,zh_name,en_name FROM institution LIMIT ${start},${end}`, (error, result) => {
            if (error) {
                throw error;
            }
            r(result);
        });
    });

/**插入一行到机构表 */
export const insertInstitution = (database: Connection | Pool, zh_name: string, en_name: string) =>
    new Promise<number>((r) => {
        database.query(`INSERT INTO institution (zh_name, en_name) VALUES ('${zh_name}', '${en_name}');`, (error, result) => {
            if (error) {
                throw error;
            }
            r(result);
        });
    });

/**遍历数据库机构生成map */
export const getInstitutionMap = async (database: Connection | Pool) => {
    const institutionNum = await getInstitutionNum(database);
    logger.info(`开始构建机构MAP，机构表行数：${institutionNum}行`);

    const enInstitutionMap = new Map<string, number>();
    const zhInstitutionMap = new Map<string, number>();

    const MAX_FETCH_ROWS = 500

    for (let i = 0; i < institutionNum; i += MAX_FETCH_ROWS) {
        logger.info(`读取第${i}到${i + MAX_FETCH_ROWS}行专家数据`)
        const result = await getInstitutionArr(database, i, i + MAX_FETCH_ROWS);
        for (const { zh_name, en_name, id } of result) {
            enInstitutionMap.set(en_name, id);
            zhInstitutionMap.set(zh_name, id);
        }

    }
    logger.info('机构信息读取完成');
    return {
        zhInstitutionMap, enInstitutionMap
    }
};
