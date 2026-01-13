import { runRuleEngine } from "../engine/ruleEngine.js";


function routeContext(context){
    runRuleEngine(context);
}

export function createRequestContext(normalizedRequest, res){
    const context = {
        id: normalizedRequest.id, 
        request: Object.freeze(normalizedRequest),

        decision: {
            action: 'allow',
            reason: null
        }, 

        metadata: {
            createdAt: Date.now(), 
            anomalies: normalizedRequest.anomalies || []
        }, 

        response: res
    };

    routeContext(context);
    return context;
}