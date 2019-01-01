
const {Strategy: BaseStrategy} = require('passport-strategy');
const crypto = require('crypto');

class Strategy extends BaseStrategy {
	constructor (options, done) {
		if ('object' !== typeof options) throw new TypeError('VkAppSignStrategy requires an options object');
		if ('function' !== typeof done) throw new TypeError('VkAppSignStrategy requires a verify callback');

		super();

		this.name = options.name || Strategy.DEFAULT_NAME;
		this.secret = options.secret;
		this.disableVerification = options.disableVerification;
		this.verbose = options.verbose;
		this.logFunction = options.logFunction || console.log.bind(console);
		this.done = done;
	}

	authenticate (req, options) {
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
			this.done(viewer_id, realmName, userInfo, (error, user, realm) => {
				req.vkParams = params;
				req.vkUserInfo = userInfo;
				req.vkGroupInfo = groupInfo;
				req.realm = realmName;
				req.realmEnt = realm;

				user.role = group_id ? parseInt(params.viewer_type, 10) :
							user_id === viewer_id ? 4 :
							0;

				this.success(user);
			});
		} else {
			console.warn('[401] Wrong sign check');
			this.fail(401);
		}
	}

	static parseApiResult (apiResult) {
		try {
			const obj = JSON.parse(apiResult);
			const userInfo = obj.response[0][0] || null;
			const groupInfo = obj.response[1][0] || null;
			return {userInfo, groupInfo};
		} catch (e) {
			return {userInfo: null, groupInfo: null};
		}
	}

	static getUrlHash (urlString) {
		const url = new URL(urlString);
		const entries = [...url.searchParams.entries()];
		return entries.reduce((r, c) => {
			r[c[0]] = c[1];
			return r;
		}, {});
	}

	verifySign (params) {
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

Strategy.DEFAULT_NAME = 'vk_app_sign';

module.exports = Strategy;
