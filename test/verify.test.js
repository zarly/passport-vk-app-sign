
const expect = require('expect');
const {Strategy} = require('../lib/strategy');

const url = 'https://frontgrade.ru/vkapp/?api_url=https://api.vk.com/api.php&api_id=6747875&api_settings=1&viewer_id=36906447&viewer_type=2&sid=d2e8504984ea20432d97fe7eefc8b3fb8a3149b54e77ae9d8618136ba7c005cdfc5e8563d5cfbdd3621b0&secret=b3bad823fa&access_token=b831d5815196c90f0606bd827381494dcc8f90aa7b3b41bb49397a605187cf65f2249269799b846f540a4&user_id=36906447&is_app_user=1&auth_key=53a9058926617fa5f11cb56606cd6cf6&language=0&parent_language=0&is_secure=1&stats_hash=86878289e2010616c9&ads_app_id=6747875_fafa5baf061f7e8d1a&api_result=%7B%22response%22%3A%5B%5B%7B%22id%22%3A36906447%2C%22first_name%22%3A%22%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%22%2C%22last_name%22%3A%22%D0%90%D0%B1%D1%80%D0%B0%D0%BC%D0%BE%D0%B2%22%7D%5D%2Cfalse%5D%7D&referrer=unknown&lc_name=3a98ca09&sign=8d6c28990ea6c50757d217b403868a3d4f27af079ab1889bd628c8f9eb8b4df0&hash=';
const secret = 'FgTxNdMzp7dgj2NPnEPv';

describe('verify', function() {
	it('getUrlHash', async () => {
		const hash = Strategy.getUrlHash(url);
		expect(hash.api_id).toBe('6747875');
		expect(hash.viewer_id).toBe('36906447');
		expect(hash.auth_key).toBe('53a9058926617fa5f11cb56606cd6cf6');
	});

	it('verifySign success', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign(hash);
		expect(result).toBeTruthy();
	});

	it('verifySign wrong secret', async () => {
		const strategy = new Strategy({secret: 'wrong_secret'}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign(hash);
		expect(result).toBeFalsy();
	});

	it('verifySign wrong api_id', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, api_id: '5'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong viewer_id', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, viewer_id: '11'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong viewer_type', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, user_id: '1'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong user_id', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, user_id: '11'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong group_id', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, group_id: '11'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong referrer', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, referrer: 'catalog_popular'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong api_settings', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, referrer: '7'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong api_url', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, api_url: 'https://wrong.com'});
		expect(result).toBeFalsy();
	});

	it('verifySign wrong sign', async () => {
		const strategy = new Strategy({secret}, () => {});
		const hash = Strategy.getUrlHash(url);
		const result = strategy.verifySign({...hash, sign: '2d6c28990ea6c50757d217b403868a3d4f27af079ab1889bd628c8f9eb8b4df1'});
		expect(result).toBeFalsy();
	});
});