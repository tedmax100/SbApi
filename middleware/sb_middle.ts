import {NextFunction, Request, RequestHandler, Response} from "express";
import { isNullOrUndefined } from "util";
import { runInNewContext } from "vm";

let SbVerify = async(req: Request, res: Response, next: NextFunction) => { 
    console.log(req);
    try{
        if(domainVerify(req) === false) throw new Error("wrong domain");
        if(req.method.toLocaleLowerCase() === "get") 
            GetMethodVerify(req, res);

        if(req.method.toLocaleLowerCase() === "post" || req.method.toLocaleLowerCase() === "put" ) 
            PostPutMethodVerify(req);

        if(req.method.toLocaleLowerCase() === "delete") 
            DeleteMethodVerify(req);

        AddSbTsHeader(req);
        return next();
    }
    catch(err) {
        return res.sendStatus(400);
    }
} 

let domainVerify = (req: Request) =>  req.hostname === "www.shopback.com" ? true : false; 

let GetMethodVerify = (req: Request, res: Response) => {
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

    // rule 2
    if (req.path.toLocaleLowerCase() === '/shopback/me') {
        console.log(req.cookies);
        if(isNullOrUndefined(req.cookies.sbcookie)) throw new Error("cookie not existing");
    }

    // rule 4
    const sbApiRegex = new RegExp('\/shopback\/api(\/.*)?$', 'i');
    if(sbApiRegex.test(req.path)) {
        console.log("rulke 4 path :" + req.path);
        res.setHeader("FROM", "hello@shopback.com");
        req.headers["FROM"] = "hello@shopback.com";
    }
}

let PostPutMethodVerify = (req: Request) => {
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

// rule 10
let AddSbTsHeader = (req: Request) => {
    req.headers["X-SHOPBACK-TIMESTAMP"] = Date.now().toString();
}

export = SbVerify;