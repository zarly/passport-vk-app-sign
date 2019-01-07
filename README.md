[![Build Status](https://travis-ci.org/zarly/passport-vk-app-sign.svg?branch=master)](https://travis-ci.org/zarly/passport-vk-app-sign)

# passport-vk-app-sign

[Passport](http://passportjs.org/) strategy for authenticating [VK applications](https://vk.com/dev/manuals).

## Install

```bash
$ npm install passport-vk-app-sign
```

## Usage

```js
passport.use(new VkAppSignStrategy({
    secret: 'FgTxNdMzp7dgj2NPnEPv',
    verbose: true,
  },
  function(signedParams, req, done) {
    User.findOne({ userId: signedParams.viewer_id }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }
));
```
