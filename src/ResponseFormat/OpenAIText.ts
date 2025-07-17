/**文本API回复格式 */
export type OpenAITextRespFormat={
    "id":`cmpl-${string}`,
    "object":"text_completion",
    "created":number,
    "model":"text-davinci-003",
    "choices":TextChoiceFormat[],
    "usage":{
        "prompt_tokens":number,
        "completion_tokens":number,
        "total_tokens":number
    }
}
/**文本API选项格式 */
type TextChoiceFormat={
    "text":string,
    "index":number,
    "logprobs":any,
    "finish_reason":"stop"|"length"
}