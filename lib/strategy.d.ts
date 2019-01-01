
import {Strategy as BaseStrategy} from 'passport-strategy'
import {Request} from  'express'
import * as crypto from 'crypto'
import config from '../config';

interface IStrategyOptions {
	secret?: string;
	disableVerification?: boolean;
	verbose?: boolean;
	logFunction?: Function;
	name?: string;
}

interface IUser {
	id: number;
	first_name: string;
	last_name: string;
}

interface IGroup {
	id: number;
	is_closed: number;
	name: string;
	photo_50: string;
	photo_100: string;
	photo_200: string;
	screen_name: string;
	type: string;
}

interface IApiResult {
	response: [
		[IUser],
		[IGroup]
	];
}

class Strategy extends BaseStrategy {
	static readonly DEFAULT_NAME = 'vk_app_sign';

	readonly name: string;
	protected done: Function;
	protected secret?: string;
	protected fromReferrer: boolean;
	protected disableVerification: boolean;
	protected verbose: boolean;
	protected logFunction: Function;

	constructor (options: IStrategyOptions = {}, done: Function);

	authenticate (req: Request): void;

	static parseApiResult (apiResult: string) : {userInfo?: IUser, groupInfo?: IGroup};

	static getUrlHash (urlString: string) : any;

	verifySign (params: any) : boolean;
}

export = Strategy;
