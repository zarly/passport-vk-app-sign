
const {Strategy: BaseStrategy} = require('passport-strategy');
const crypto = require('crypto');

class Strategy extends BaseStrategy {
	constructor (options, done) {
		if ('object' !== typeof options) throw new TypeError('VkAppSignStrategy requires an options object');
		if ('function' !== typeof done) throw new TypeError('VkAppSignStrategy requires a verify callback');

		super();

		this.name = options.name || Strategy.DEFAULT_NAME;
		this.secret = options.secret;
		this.fromReferrer = !!options.fromReferrer;
		this.disableVerification = !!options.disableVerification;
		this.verbose = !!options.verbose;
		this.logFunction = options.logFunction || console.log.bind(console);
		this.done = done;
	}

	authenticate (req, options) {
		const params = this.fromReferrer ? Strategy.getUrlHash(req.get('referrer')) : req.query;

		const isAuth = this.disableVerification || this.verifySign(params);
		if (isAuth) {
			this.done(params, req, (error, user) => {
				if (error) {
					this.logFunction('[401] Error while authentication', error);
					return this.fail(401);
				}
				if (!user) {
					this.logFunction('[401] User not found');
					return this.fail(401);
				}
				this.success(user);
			});
		} else {
			this.logFunction('[401] Wrong sign check');
			return this.fail(401);
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

exports.Strategy = Strategy;
