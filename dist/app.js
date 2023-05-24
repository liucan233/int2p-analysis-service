import { Configuration, OpenAIApi } from "openai";
const apiKey = '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';
const configuration = new Configuration({
    apiKey,
});
const openai = new OpenAIApi(configuration);
openai;
