import type { DeepseekAPIEntry, DeepseekOption } from "../../../RequestFormat";
import type { DeepseekRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from "../../Chat/Adapter";
/**前缀续写模式的Formater */
export declare const DeepseekBetaChatTaskFormatter: ChatTaskFormatter<DeepseekAPIEntry[], DeepseekOption, DeepseekRespFormat>;
