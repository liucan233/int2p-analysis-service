/**
 * 从数据库读取专家信息生成js map，同时，向map插入数据时将插入的数据写入数据库
 */

import { Connection, Pool } from "mysql";
import { logger } from "./logger";

/**获取专家表行数 */
const getExpertNum = (database: Connection | Pool) =>
    new Promise<number>((r) => {
        database.query("SELECT COUNT(*) FROM EXPERT", (error, result) => {
            if (error) {
                throw error;
            }
            r(result[0]["COUNT(*)"]);
        });
    });

/**获取专家表指定开始和结束行 */
const getExpertArr = (database: Connection | Pool, start: number, end: number) =>
    new Promise<{ zh_name: string, en_name: string, id: number }[]>((r) => {
        database.query(`SELECT id,zh_name,en_name FROM EXPERT LIMIT ${start},${end}`, (error, result) => {
            if (error) {
                throw error;
            }
            r(result);
        });
    });

/**插入一行到专家表 */
export const insertExpert = (database: Connection | Pool, zh_name: string, en_name: string) =>
    new Promise<number>((r) => {
        database.query(`INSERT INTO expert (zh_name, en_name) VALUES ('${zh_name}', '${en_name}');`, (error, result) => {
            if (error) {
                throw error;
            }
            r(result);
        });
    });

/**遍历数据库专家生成map */
export const getExportMap = async (database: Connection | Pool) => {
    const expertNum = await getExpertNum(database);
    logger.info(`开始构建专家MAP，专家表行数：${expertNum}行`);

    const enExpertMap = new Map<string, number>();
    const zhExpertMap = new Map<string, number>();

    const MAX_FETCH_ROWS = 500

    for (let i = 0; i < expertNum; i += MAX_FETCH_ROWS) {
        logger.info(`读取第${i}到${i + MAX_FETCH_ROWS}行专家数据`)
        const result = await getExpertArr(database, i, i + MAX_FETCH_ROWS);
        for (const { zh_name, en_name, id } of result) {
            enExpertMap.set(en_name, id);
            zhExpertMap.set(zh_name, id);
        }
    }
    logger.info('专家信息读取完成');
    return {
        zhExpertMap, enExpertMap
    }
};
