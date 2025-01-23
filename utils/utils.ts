import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

type FulfillmentMessage = {
    text: {
        text: string[];
    };
};

type OutputContext = {
    name: string;
    lifespanCount?: number;
    parameters: Record<string, any>;
};

export type ResponseObject = {
    fulfillmentMessages: FulfillmentMessage[];
    outputContexts?: OutputContext[];
};

type ContextTypes = {
    name: string;
    lifespanCount?: number;
    parameters?: { [key: string]: any };
};

type QueryResultTypes = {
    queryText: string;
    action: string;
    parameters: { [key: string]: any };
    allRequiredParamsPresent: boolean;
    fulfillmentMessages: any[];
    outputContexts: ContextTypes[];
    intent: {
        name: string;
        displayName: string;
    };
    intentDetectionConfidence: number;
    languageCode: string;
};

type DialogflowRequestTypes = {
    responseId: string;
    queryResult: QueryResultTypes;
    originalDetectIntentRequest: { source: string; payload: any };
    session: string;
};

export const loadEnvVariables=(envPath: string= '.env'): Record<string,string> => {
    if(!fs.existsSync(envPath)){
        throw new Error(`.env file not found at ${envPath}`);
    }
    const result=dotenv.config({ path: envPath});
    if(result.error){
        throw result.error;
    }
    const envVariables: Record<string, string> = {};
    for(const key in process.env) {
        if(Object.prototype.hasOwnProperty.call(process.env,key)) {
            envVariables[key] = process.env[key] || '';
        }
    }
    return envVariables;
};
export const generateResponseObject = (
    messages: string[],
    outputContexts: OutputContext[] = []
): ResponseObject => {
    const fulfillmentMessages: FulfillmentMessage[] = messages.map(message => ({
        text: {
            text: [message]
        }
    }));
    const response: ResponseObject = {
        fulfillmentMessages
    };
    if (outputContexts.length > 0) {
        response.outputContexts = outputContexts;
    }
    return response;
};

export const extractSessionVars = (response: DialogflowRequestTypes): { [key: string]: any } | undefined => {
    const sessionVarsContext = response.queryResult.outputContexts.find(
        (context) => context.name.endsWith('/contexts/session-vars')
    );
    return sessionVarsContext?.parameters;
};