// import fetch from "node-fetch";
import { logger } from "./logger";
// import { getExportMap, insertExpert } from "./expertMap";
// import { getInstitutionMap, insertInstitution } from "./institutionMap";
import { getNewsClassification } from "./newsClassification";
import { ESiteType, getNewsArr, getNewsNum } from "./newsReader";
import { disconnectAllMysql, int2pNewsSql } from "./database";
import { MAX_FETCH_ROWS } from "./config";
import { getEntityRelationGenerator } from "./entityRelation";
import { getKeywordArrGenerator } from "./extractKeyword";
import { createAndWriteFile } from "./utils/fileUtil";
// import {httpsOverHttp} from 'tunnel'

// createAndWriteFile('./data/person.json',JSON.stringify([...personMap.values()]));
//       createAndWriteFile('./data/personRelation.json',JSON.stringify(personPair));

const processData = async (beginRow:number,itemNum: number, siteType: ESiteType[]) => {
  let maxRowNum = await getNewsNum(int2pNewsSql, siteType);
  logger.info(`数据库总包含${maxRowNum}条数据`)
  maxRowNum = Math.min(beginRow+itemNum, maxRowNum);
  logger.info(`即将读取${itemNum}条数据转换为前端格式`);

  const getEntityRelation=getEntityRelationGenerator()
  const getKeywordArr=getKeywordArrGenerator()
  for (let i = beginRow; i < maxRowNum; i += MAX_FETCH_ROWS) {
    const endRowNum = Math.min(i + MAX_FETCH_ROWS, maxRowNum);
    const newsArr = await getNewsArr(int2pNewsSql, i, endRowNum, siteType, [
      "id",
      "zh_title",
      "language",
      "zh_keywords",
      "zh_organization",
      "assignee",
      "author",
      "crawl_time",
      "public_time",
      "person",
      "site_type",
      "org_keywords",
      "org_organization",
      'url'
    ]);
    logger.info( `读取到第${i}到${endRowNum}行，本次读取了${newsArr.length}条数据`);
    logger.info(`数据时间开始时间${newsArr[0].public_time.toLocaleDateString()}\n`);
    const pickedNewsArr=[newsArr[0]]
    if(newsArr.length>166){
      pickedNewsArr.push(newsArr[166])
    }
    if(newsArr.length>333){
      pickedNewsArr.push(newsArr[333])
    }
    getEntityRelation(pickedNewsArr);
    getKeywordArr(pickedNewsArr);
  }

  const {institutionMap,institutionPair,personMap,personPair}=getEntityRelation()
  
  const processedData={
    institution: {
      nodes: [...institutionMap.values()],
      links: institutionPair.map(([s,t])=>({source:s,target:t}))
    },
    person: {
      nodes: [...personMap.values()],
      links: personPair.map(([s,t])=>({source:s,target:t}))
    },
    keyword: {
      list: [...getKeywordArr().values()]
    }
  }
  disconnectAllMysql();
  createAndWriteFile(`./data/row_${beginRow}_${maxRowNum}.json`,JSON.stringify(processedData));
  logger.info('处理完成');
};

processData(
  160000,
  60000,
  [ESiteType.TechnicalMonopoly],
)