/**
 * 新闻资讯分类
 * 调用API：https://github.com/AMinerOpen/prediction_api/blob/master/doc/NSFC_Subject_Classifier.md
 */

import fetch from "node-fetch";

type TPredictedSubject={
    code: string,
    name:string,
    p:number
}

type TAminerPredictRes={
    status: 0|-1,
    message: string,
    data: {
        level1: TPredictedSubject[],
        level2: TPredictedSubject[],
        level3: TPredictedSubject[]
    }
}

/**根据标题判断资讯学科 */
export const getNewsClassification = async (title: string[]) => {
    const res = await fetch('https://innovaapi.aminer.cn/tools/v1/predict/nsfc', {
        method: 'POST',
        body: JSON.stringify({
            titles: [title.join(',')],
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const subjectInfo= await (res.json() as Promise<TAminerPredictRes>);
    if(subjectInfo.status!==0){
        throw new Error(subjectInfo.message);
    }
    // console.log(subjectInfo)
    return subjectInfo.data;
}