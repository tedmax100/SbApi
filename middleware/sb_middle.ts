import {NextFunction, Request, RequestHandler, Response} from "express";

let SbVerify = async(req: Request, res: Response, next: NextFunction) => { 
    console.log(req);
    try{
        domainVerify(req);
        GetMethodVerify(req);
        PostPutMethodVerify(req);
        DeleteMethodVerify(req);
        AddSbAgentHeader(req);
        return next();
    }
    catch(err) {
        return res.sendStatus(400);
    }
} 

let domainVerify = (req: Request) =>  req.hostname === "www.shopback.com" ? true : new Error("wrong domain"); 


export = SbVerify;