/**
 * Item.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    flat: {
      model: 'Flat',
    },

    name: {
      type:       'string',
      required:   true
    },

    description: {
      type:       'string'
    },

    rota: {
      type:       'string'
    },

    notification: {
      type:       'boolean'
    },

    lastBumped: {
      type:       'number'
    }

  },

};

