export let Rules = {
    actions: [
        {
            header: "set",
            key: ['X-SHOPBACK-TIMESTAMP'],
            value: ['Date.now()']
        }
    ],
    rule: [
        {
            name: "SbDomainValidator",
            method: ["*"],
            type: "check",
            target: "request",
            hostname: "www.shopback.com"
        },
        {
            name: "SbCookieValidator",
            method: ["get"],
            type: "check",
            target: "request",
            path: "shopback/me",
            exist: true,
            cookieValues : []
        },
        {
            name: "SbApiFromSetter",
            method: ["get"],
            type: "set",
            path : "\/shopback\/api(\/.*)?$",
            target: "header",
            key: "From",
            value: "hello@shopback.com"
        },
        {
            name: "SbResourceRedirect",
            method: ["get"],
            path: "/shopback/resource",
            value: " /shopback/static/assets"
        },
        {
            name: "SbQueryStringDeleter",
            method: ["post", "put"],
            queryString: true,
            delete: true
        },
        {
            method: ["post", "put"],
            header: "check",
            key: ['x-shopback-agent'],
            values: []
        },
        {
            name: "SbContentTypeValidator",
            method: ["post", "put"],
            header: "check",
            key: ['content-type'],
            values: ['application/json']
        },
        {
            name: "SbAgentValidator",
            method: ["delete"],
            key: ['x-shopback-agent'],
            values: ['AGENT_1', 'AGENT_2']
        }
    ]    
};