import {NextFunction, Request, RequestHandler, Response} from "express";
import { isNullOrUndefined } from "util";

class SbRuleContainer {
    public rules: Function[];

    private SbCookievalidatorMethods: string[];
    private SbCookieValidatorPath: string;
    private SbCookieValidatorValues: string[];

    private SbRefererValidatorMethods: string[];
    private SbRefererValidatorDomain: string;

    private SbApiFromSetterMethods: string[];
    private SbApiFromSetterPath: string;
    private SbApiFromSetterValue: string;

    private SbQueryStringDeleterMethods: string[];

    private SbAgentValidatorMethods: string[];
    private SbAgentValidatorHeader: string;
    private SbAgentValidatorValues: string[];

    private SbContentTypeValidatorMethods: string[];
    private SbContentTypeValidatorValue: string;

    private SbDomainValidatorMethods: string[];
    private SbDomainValue: string;

    private SbResourceRedirectMethods: string[];
    private SbResourceRedirectPath: string;
    private SbResourceRedirectValue: string;

    constructor(){
        this.rules = [];
        this.SbCookievalidatorMethods = [];
        this.SbCookieValidatorPath = "";
        this.SbCookieValidatorValues = [];

        this.SbRefererValidatorMethods = [];
        this.SbRefererValidatorDomain = "";

        this.SbApiFromSetterMethods = [];
        this.SbApiFromSetterPath = "";
        this.SbApiFromSetterValue = "";

        this.SbQueryStringDeleterMethods = ["post", "put"];

        this.SbAgentValidatorMethods = [];
        this.SbAgentValidatorValues = [];
        this.SbAgentValidatorHeader = "x-shopback-agent";

        this.SbContentTypeValidatorMethods = [];
        this.SbContentTypeValidatorValue = "application/json";

        this.SbDomainValidatorMethods = ["*"];
        this.SbDomainValue = "www.shopback.com";

        this.SbResourceRedirectMethods = [];
        this.SbResourceRedirectPath = "";
        this.SbResourceRedirectValue = "";
    }

    public AddRule = () => {
        this.rules.push(this.SbDomainValidator);
    }

    public SbResourceRedirect = (req: Request) => {
        if(req.path.toLocaleLowerCase() === '/shopback/resource' ) {
            req.url = "/shopback/static/assets";
        }
    }

    public SbDomainValidator = (req: Request) => {
        if(this.SbDomainValidatorMethods.indexOf("*") === -1 
            && this.SbDomainValidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        if(req.hostname !== this.SbDomainValue) throw new Error("wrong domain");
    }

    public SbContentTypeValidator = (req: Request) => {
        if(this.SbContentTypeValidatorMethods.indexOf("*") === -1 
        && this.SbContentTypeValidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        if (req.headers["content-type"] !== this.SbContentTypeValidatorValue) {
            throw new Error("contect-type is invalid");
        }
    }

    public SbAgentExistValidator = (req: Request) => {
        if(this.SbAgentValidatorMethods.indexOf("*") === -1 
            && this.SbAgentValidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        // check any value in array or pass when array is null 
        if (this.SbAgentValidatorValues.length > 0  
        ) {
            throw new Error("agent is invalid");
        }
    }

    public SbAgentValueValidator = (req: Request) => {
        if(this.SbAgentValidatorMethods.indexOf("*") === -1 
            && this.SbAgentValidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        // check any value in array or pass when array is null 
        if (this.SbAgentValidatorValues.length > 0 
            &&  this.SbAgentValidatorValues.indexOf(req.headers[this.SbAgentValidatorHeader]! as string) === -1 
        ) {
            throw new Error("agent is invalid");
        }
    }

    public SbQueryStringDeleter = (req: Request) => {
        if(this.SbQueryStringDeleterMethods.indexOf("*") === -1 
            && this.SbQueryStringDeleterMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        req.url = req.url.slice(0, req.url.indexOf('?'));
        delete req.query;
    }
    public SbApiFromSetter = (req: Request) => {
        if(this.SbApiFromSetterMethods.indexOf("*") === -1 
            && this.SbApiFromSetterMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        const sbApiRegex = new RegExp(this.SbApiFromSetterPath + '(\/.*)?$', 'i');
        if(sbApiRegex.test(req.path)) {
            req.headers["From"] = this.SbApiFromSetterValue;
        }
    }
    public SbCookieValidator = (req: Request) => {
        if(this.SbCookievalidatorMethods.indexOf("*") === -1 
            && this.SbCookievalidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        if (req.path.toLocaleLowerCase() === this.SbCookieValidatorPath) {
            if(this.SbCookieValidatorValues.length > 0 
                && isNullOrUndefined(req.cookies.sbcookie)) 
                throw new Error("cookie not existing");
        }
    }

    public SbRefererValidator = (req: Request) => {
        if(this.SbRefererValidatorMethods.indexOf("*") === -1 
            && this.SbRefererValidatorMethods.includes(req.method.toLocaleLowerCase()) === false) return;

        const referRegex = new RegExp(this.SbRefererValidatorDomain+'+(\/.*)?$', 'i');
        if(isNullOrUndefined(req.headers.referer) || referRegex.test(req.headers.referer) === false) {
            throw new Error("invalid referer domain")
        }
    }
}

const ruleValidators = new SbRuleContainer();
let SbVerify = async(req: Request, res: Response, next: NextFunction) => {
    ruleValidators.AddRule(); 
    try{
        ruleValidators.rules.map(v => v(req));
        // if(ruleValidators.SbDomainValidator(req) === false) throw new Error("wrong domain");
        if(req.method.toLocaleLowerCase() === "get") 
            GetMethodVerify(req);

        if(req.method.toLocaleLowerCase() === "post" ) 
            PostMethodVerify(req);

        if(req.method.toLocaleLowerCase() === "put" ) 
            PutMethodVerify(req);

        if(req.method.toLocaleLowerCase() === "delete") 
            DeleteMethodVerify(req);

        if(req.method.toLocaleLowerCase() === "patch") 
            PatchMethodVerify(req);

        AddSbTsHeader(req);
        return next();
    }
    catch(err) {
        return res.sendStatus(400);
    }
} 

let domainVerify = (req: Request) =>  req.hostname === "www.shopback.com" ? true : false; 

let GetMethodVerify = (req: Request) => {
    // rule 3
    const referRegex = new RegExp('www.shopback.com+(\/.*)?$', 'i');
    if(isNullOrUndefined(req.headers.referer) || referRegex.test(req.headers.referer) === false) {
        throw new Error("invalid referer domain")
    }

    // rule 1
    if(req.path.toLocaleLowerCase() === '/shopback/resource' ) {
        req.url = "/shopback/static/assets";
        console.log(req.url);
    }

    const cookieValues = [];
    // rule 2
    if (req.path.toLocaleLowerCase() === '/shopback/me') {
        if(cookieValues.length > 0 
            && isNullOrUndefined(req.cookies.sbcookie)) throw new Error("cookie not existing");
    }

    // rule 4
    const sbApiRegex = new RegExp('\/shopback\/api(\/.*)?$', 'i');
    if(sbApiRegex.test(req.path)) {
        req.headers["FROM"] = "hello@shopback.com";
    }
}

let PutMethodVerify = (req: Request) => {
    // rule 7
    if (req.headers["content-type"] !== "application/json") {
        throw new Error("contect-type is invalid");
    }

    // rule 6 
    if (isNullOrUndefined(req.headers["X-SHOPBACK-AGENT"])) {
        throw new Error("agent not exist");
    }

    // rule 5
    req.url = req.url.slice(0, req.url.indexOf('?'));
    delete req.query;
}

let PostMethodVerify = (req: Request) => {
    // rule 7
    if (req.headers["content-type"] !== "application/json") {
        throw new Error("contect-type is invalid");
    }

    // rule 6 
    if (isNullOrUndefined(req.headers["X-SHOPBACK-AGENT"])) {
        throw new Error("agent not exist");
    }

    // rule 5
    req.url = req.url.slice(0, req.url.indexOf('?'));
    delete req.query;
}

let DeleteMethodVerify = (req: Request) => {
    // rule 6 
    if (isNullOrUndefined(req.headers["X-SHOPBACK-AGENT".toLocaleLowerCase()])) {
        throw new Error("agent not exist");
    }
    const agentValues = ["AGENT_1", "AGENT_2"];
    // check any value in array or pass when array is null 
    if (agentValues.length > 0 
        &&  agentValues.indexOf(req.headers["X-SHOPBACK-AGENT".toLocaleLowerCase()]! as string) === -1 
    ) {
        throw new Error("agent is invalid");
    }
}

let PatchMethodVerify = (req: Request) => {
}

// rule 10
let AddSbTsHeader = (req: Request) => req.headers["X-SHOPBACK-TIMESTAMP"] = Date.now().toString();

export = SbVerify;

