/**
 * Device.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const crypto = require('crypto');

module.exports = {

  attributes: {

    lastUsed:  {
      type: 'number'
    },

    authToken: {
      type: 'string',
    },

    ip: {
      type: 'string',
      required: true
    },

    userAgent: {
      type: 'string'
    },

    owner: {
      model: 'User'
    },

  },

  // Called before a Device model is created.
  beforeCreate: (valuesToSet, cb) => {
    // Generate random token.
    crypto.randomBytes(256, (err, buf) => {
      if (err) { return cb(err); }
      valuesToSet.authToken = buf.toString('hex');
      valuesToSet.createdAt = Math.round(+new Date()/1000);
      valuesToSet.lastUsed  = Math.round(+new Date()/1000);
      cb();
    });
  },

};

