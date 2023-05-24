import mysql from "mysql";

/**储存科技资讯的数据库 */
export const int2pNewsSql = mysql.createConnection({
    host: "rm-wz9949ft8e8iy626kfo.mysql.rds.aliyuncs.com",
    connectTimeout: 5000,
    user: "root",
    password: "Xxb13981101105",
    port: 3306,
    database: "int2p",
});

/**储存可视化数据的数据库，包括专家、机构和资讯所属学科分类等 */
export const int2pVisSql = mysql.createConnection({
    host: "rm-wz9949ft8e8iy626kfo.mysql.rds.aliyuncs.com",
    // connectionLimit: 10,
    connectTimeout: 5000,
    user: "root",
    password: "Xxb13981101105",
    port: 3306,
    database: "int2p_vis",
});

/**结束所有mysql连接 */
export const disconnectAllMysql=()=>{
    int2pNewsSql.end();
    int2pVisSql.end();
}

// 程序退出时释放mysql连接
process.on("SIGINT", () => {
    disconnectAllMysql();
    // let databaseEndFlag = false;
    // int2pNewsSql.end(() => {
    //     databaseEndFlag && process.exit();
    //     databaseEndFlag = true;
    // });

    // int2pVisSql.end(() => {
    //     databaseEndFlag && process.exit();
    //     databaseEndFlag = true;
    // });
});