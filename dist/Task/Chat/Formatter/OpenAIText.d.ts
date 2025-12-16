import type { OpenAITextOption } from "../../../RequestFormat";
import type { OpenAITextRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
export declare const OpenAITextChatTaskFormatter: ChatTaskFormatter<string, OpenAITextOption, OpenAITextRespFormat>;
