import type { GeminiRequest } from "RequestFormat";
import type { GeminiResponse } from "ResponseFormat";
import { GeminiResponseExample } from "ResponseFormat";

import { LaMManagerMockTool } from "Mock/Utils";




export const procGemini3Pro = (data:GeminiRequest)=>{
    const msg = data.contents[0].parts[0].text;
    return {
        ...GeminiResponseExample,
        candidates: [
        {
            content: {
                parts: [
                    {
                        text: LaMManagerMockTool.buildResp('Gemini3Pro', msg),
                    },
                ],
                role: "model",
            },
            finishReason: "STOP",
            avgLogprobs: -0.20637991370224371,
        },
    ],
    modelVersion: "gemini-3-pro-preview",
    } satisfies GeminiResponse;
};