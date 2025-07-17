/**聊天API回复格式 */
export type OpenAIConversationRespFormat={
    "id":`chatcmpl-${string}`,
    "object":"chat.completion",
    "created":number,
    //"model":`gpt-3.5-turbo-${string}`,
    "model":string,
    "system_fingerprint":string,
    "usage":{
        "prompt_tokens":number,
        "completion_tokens":number,
        "total_tokens":number
    },
    "choices":ConversationChoiceFormat[]
}
/**聊天API选项格式 */
type ConversationChoiceFormat={
    "message":{
        "role":"assistant",
        "content"?:string,
    },
    "finish_reason":"stop"|"length"|"content_filter",
    "index":number
}