/**
 * FlatGroup.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true,
    },

    // A list of Users that are members of this group.
    members: {
      collection: 'User',
      via: 'flats'
    }

  },

};

