import type { DeepseekAPIEntry, DeepseekOption } from "../../../RequestFormat";
import type { DeepseekRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
/**传统OpenAI系统提示模式的Formater */
export declare const DeepseekChatTaskFormatter: ChatTaskFormatter<DeepseekAPIEntry[], DeepseekOption, DeepseekRespFormat>;
