import { TInt2pTemporary } from "./newsReader";

type TKeyword = { zhName: string; enName: string; timeArr: number[] };

const keywordFilter = (k: string) => {
  if (k.startsWith("本")) {
    return false;
  }
  return true;
};

export const getKeywordArrGenerator = () => {
  const keywordMap = new Map<string, TKeyword>();

  return (
    newsArr?: Pick<
      TInt2pTemporary,
      "crawl_time" | "zh_keywords" | "org_keywords" | "language" | "public_time"
    >[]
  ) => {
    if (!newsArr || newsArr.length < 1) {
      for (const { timeArr } of keywordMap.values()) {
        timeArr.sort((a, b) => (a < b ? -1 : 1));
      }
      return keywordMap;
    }
    for (const {
      zh_keywords,
      org_keywords,
      language,
      public_time,
    } of newsArr) {
      const orgKeywordArr = eval(org_keywords) as string[];
      const zhKeywordArr =
        language === "zh"
          ? orgKeywordArr
          : (
              zh_keywords
                .replace(/’|‘|“|”|\[|\]|'/g, "")
                .replace(/，/g, "、")
                .split("、") as string[]
            ).filter(keywordFilter);
      for (let j = 0; j < org_keywords.length; j++) {
        if(language==='zh'){
          zhKeywordArr[j]=org_keywords[j];
        }
        if(!zhKeywordArr[j] || !keywordFilter(zhKeywordArr[j]) || !orgKeywordArr[j]){
          continue;
        }
        const tmp = keywordMap.get(zhKeywordArr[j]);
        if (tmp) {
          tmp.timeArr.push(public_time.valueOf());
        } else {
          keywordMap.set(zhKeywordArr[j], {
            zhName: zhKeywordArr[j],
            enName: orgKeywordArr[j],
            timeArr: [public_time.valueOf()],
          });
        }
      }
    }
    return keywordMap;
  };
};
