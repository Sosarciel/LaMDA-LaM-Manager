import { OpenAIChatModel, OpenAIChatOption } from "./GPTChat";
import { OpenAITextModel, OpenAITextOption } from "./GPTText";


export type AnyOpenaiModel = OpenAIChatModel|OpenAITextModel;
export type AnyOpenaiOption = OpenAIChatOption|OpenAITextOption;