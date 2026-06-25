import { asyncHandler } from "../../utils/asyncHandler"; import { created, ok } from "../../utils/apiResponse"; import * as s from "./repairs.service";
export const list=asyncHandler(async(req,res)=>ok(res,await s.list(req)));
export const get=asyncHandler(async(req,res)=>ok(res,await s.get(String(req.params.id))));
export const create=asyncHandler(async(req,res)=>created(res,await s.create(req)));
export const createFromActiveSession=asyncHandler(async(req,res)=>created(res,await s.createFromActiveSession(req)));
export const close=asyncHandler(async(req,res)=>ok(res,await s.close(req)));
export const review=asyncHandler(async(req,res)=>ok(res,await s.review(req)));
