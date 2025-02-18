


const resap = {
    candidates: [
        {
            content: {
                parts: [
                    {
                        text: '你好！ 你好吗？ (Nǐ hǎo! Nǐ hǎo ma?)  \n \nThis means "Hello! How are you?"  How can I help you today?\n',
                    },
                ],
                role: "model",
            },
            finishReason: "STOP",
            avgLogprobs: -0.20637991370224371,
        },
    ],
    usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 41,
        totalTokenCount: 46,
        promptTokensDetails: [
            {
                modality: "TEXT",
                tokenCount: 5,
            },
        ],
        candidatesTokensDetails: [
            {
                modality: "TEXT",
                tokenCount: 41,
            },
        ],
    },
    modelVersion: "gemini-1.5-flash",
};

type Candidate = {
    content: {
        parts: [{text: string,},],
        role: "model",
    },
    finishReason: string,
    avgLogprobs: number,
}
type UsageMetadata = {
    promptTokenCount: number,
    candidatesTokenCount: number,
    totalTokenCount: number,
    promptTokensDetails: [
        {
            modality: "TEXT",
            tokenCount: 5,
        },
    ],
    candidatesTokensDetails: [
        {
            modality: "TEXT",
            tokenCount: 41,
        },
    ],
}

type GoogleChatRespFormat = {
    candidates:Candidate[],
    usageMetadata:UsageMetadata,
    modelVersion:string,
}

export type AnyGoogleChatRespFormat = GoogleChatRespFormat;