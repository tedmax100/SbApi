import {NextFunction, Request, Response, Router} from "express";
import express from 'express';

export default class ShopBackRoute {
    public router = express.Router();

    constructor() {
        this.router.get('/', this.GetDefault);
        this.router.get('/static/assets', this.GetAssets);
        this.router.get('/me', this.GetWithMe);
        this.router.get('/api/:apiParams', this.GetApiWithParams);
    }

    private GetDefault = async (req: Request, res: Response) => {
        return res.sendStatus(200);
    }

    private GetAssets = async (req: Request, res: Response) => {
        return res.sendStatus(200);
    }

    private GetWithMe = async(req: Request, res: Response) => {
        return res.sendStatus(200);
    }

    private GetApiWithParams = async(req: Request, res: Response) => {
        return res.sendStatus(200);
    }
}