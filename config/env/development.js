module.exports = {

  // Any configuration settings may be overridden below, whether it's built-in Sails
  // options or custom configuration specifically for your app (e.g. Stripe, Mailgun, etc.)
  datastores: {
    default: {

      /***************************************************************************
      *                                                                          *
      * Want to use a different database during development?                     *
      *                                                                          *
      * 1. Choose an adapter:                                                    *
      *    https://sailsjs.com/plugins/databases                                 *
      *                                                                          *
      * 2. Install it as a dependency of your Sails app.                         *
      *    (For example:  npm install sails-mysql --save)                        *
      *                                                                          *
      * 3. Then pass it in, along with a connection URL.                         *
      *    (See https://sailsjs.com/config/datastores for help.)                 *
      *                                                                          *
      ***************************************************************************/

      adapter: 'sails-mongo',
      url: 'mongodb://root@localhost/flat-rota',

    },
  },

  routes: {
    'GET /csrfToken': {
      action: 'security/grant-csrf-token',
      cors: {
        allowOrigins: [ 'http://localhost:3000' ]
      }
    },
  },

  security: {
    cors: {
      allRoutes: true,
      allowOrigins: [ 'http://localhost:3000' ],
      allowCredentials: true,
    },
  }

};
