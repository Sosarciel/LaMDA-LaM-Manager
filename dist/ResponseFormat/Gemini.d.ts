type Quoya = {
    error: {
        code: 429;
        message: "Resource has been exhausted (e.g. check quota).";
        status: "RESOURCE_EXHAUSTED";
    };
};
export type AnyGoogleErrorRespFormat = Quoya;
type Candidate = {
    content: {
        parts: [{
            text: string;
        }];
        role: "model";
    };
    finishReason: string;
    avgLogprobs: number;
};
type UsageMetadata = {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: [
        {
            modality: "TEXT";
            tokenCount: 5;
        }
    ];
    candidatesTokensDetails: [
        {
            modality: "TEXT";
            tokenCount: 41;
        }
    ];
    thoughtsTokenCount: number;
};
export type GeminiRespFormat = {
    candidates: Candidate[];
    usageMetadata: UsageMetadata;
    modelVersion: string;
};
export {};
