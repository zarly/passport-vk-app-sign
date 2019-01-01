/* global describe, it, expect */

var Strategy = require('../lib').Strategy;


describe('Strategy', function() {
    
  var strategy = new Strategy({}, function(){});
    
  it('should be named vk_app_sign', function() {
    expect(strategy.name).to.equal('vk_app_sign');
  });
  
  it('should throw if constructed without an options object', function() {
    expect(function() {
      var s = new Strategy();
    }).to.throw(TypeError, 'VkAppSignStrategy requires an options object');
  });
  
  it('should throw if constructed without a verify callback', function() {
    expect(function() {
      var s = new Strategy({});
    }).to.throw(TypeError, 'VkAppSignStrategy requires a verify callback');
  });
  
});
