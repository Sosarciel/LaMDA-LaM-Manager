import type { GeminiOption, GeminiApiData } from "../../../RequestFormat";
import type { GeminiRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
export declare const GeminiChatTaskFormatter: ChatTaskFormatter<GeminiApiData, GeminiOption, GeminiRespFormat>;
