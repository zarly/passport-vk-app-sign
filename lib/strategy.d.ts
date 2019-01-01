
import {Strategy as BaseStrategy} from 'passport-strategy'
import {Request} from  'express'
import * as crypto from 'crypto'
import config from '../config';

interface IStrategyOptions {
	secret?: string;
	fromReferrer?: boolean;
	disableVerification?: boolean;
	verbose?: boolean;
	logFunction?: Function;
	name?: string;
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

	authenticate (req: Request, options?: any): void;

	static getUrlHash (urlString: string) : any;

	verifySign (params: any) : boolean;
}

export = Strategy;
