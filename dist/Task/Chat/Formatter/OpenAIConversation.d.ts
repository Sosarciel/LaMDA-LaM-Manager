import type { OpenAIConversationAPIEntry, OpenAIConversationOption } from "../../../RequestFormat";
import type { AnyOpenAIConversationLikeRespFormat } from "../../../ResponseFormat";
import type { ChatTaskFormatter } from '../../Chat/Adapter';
export declare const OpenAIConversationChatTaskFormatter: ChatTaskFormatter<OpenAIConversationAPIEntry[], OpenAIConversationOption, AnyOpenAIConversationLikeRespFormat>;
