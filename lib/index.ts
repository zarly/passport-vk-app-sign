
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

export class Strategy extends BaseStrategy {
	static readonly DEFAULT_NAME = 'vk_app_sign';

	readonly name: string;
	protected done: Function;
	protected secret?: string;
	protected disableVerification: boolean;
	protected verbose: boolean;
	protected logFunction: Function;

	constructor (options: IStrategyOptions = {}, done: Function) {
		super();
		this.name = options.name || Strategy.DEFAULT_NAME;
		this.secret = options.secret;
		this.disableVerification = options.disableVerification;
		this.verbose = options.verbose;
		this.logFunction = options.logFunction || console.log.bind(console);
		this.done = done;
	}

	authenticate (req: Request, options?: any): void {
		const vkUrl = req.get('referrer');
		const params = vkUrl ? Strategy.getUrlHash(vkUrl) : {};

		const isAuth = this.disableVerification || this.verifySign(params);
		if (isAuth) {
			const viewer_id = parseInt(params.viewer_id, 10);
			const user_id = parseInt(params.user_id, 10);
			const group_id = parseInt(params.group_id, 10);
			const api_id = parseInt(params.api_id, 10);

			const {userInfo, groupInfo} = Strategy.parseApiResult(params.api_result);
			if (viewer_id && userInfo && userInfo.id !== viewer_id) {
				console.warn('[401] Wrong viewer info', viewer_id, userInfo);
				return this.fail(401);
			}
			if (group_id && groupInfo && groupInfo.id !== group_id) {
				console.warn('[401] Wrong group info', group_id, groupInfo);
				return this.fail(401);
			}

			const realmApp = `${api_id}` || 'common';
			const realmOwner = (group_id && `g${group_id}`) || (user_id && `u${user_id}`) || 'common';
			const realmName = `vk:${realmApp}:${realmOwner}`;
			this.done(viewer_id, realmName, userInfo, (error: any, user: any, realm: any) => {
				(req as any).vkParams = params;
				(req as any).vkUserInfo = userInfo;
				(req as any).vkGroupInfo = groupInfo;
				(req as any).realm = realmName;
				(req as any).realmEnt = realm;

				user.role = group_id ? parseInt(params.viewer_type, 10) :
							user_id === viewer_id ? 4 :
							config.admins.indexOf(viewer_id) !== -1 ? 4 :
							0;

				this.success(user);
			});
		} else {
			console.warn('[401] Wrong sign check');
			this.fail(401);
		}
	}

	static parseApiResult (apiResult: string) : {userInfo?: IUser, groupInfo?: IGroup} {
		try {
			const obj: IApiResult = JSON.parse(apiResult);
			const userInfo = obj.response[0][0] || null;
			const groupInfo = obj.response[1][0] || null;
			return {userInfo, groupInfo};
		} catch (e) {
			return {userInfo: null, groupInfo: null};
		}
	}

	static getUrlHash (urlString: string) : any {
		const url = new URL(urlString);
		const entries = [...url.searchParams.entries()];
		return entries.reduce((r: any, c: [string, string]) => {
			r[c[0]] = c[1];
			return r;
		}, {});
	}

	verifySign (params: any) {
		let str = '';
		for (let name in params) {
			if (!params.hasOwnProperty(name)) continue;
			if (['sign', 'hash', 'api_result'].indexOf(name) !== -1) continue;
			str += params[name];
		}
		const sign = crypto.createHmac('sha256', this.secret)
			.update(str)
			.digest('hex');

		if (this.verbose) {
			this.logFunction('Verify sign:', str, sign, params.sign);
		}

		return sign === params.sign;
	}
}
