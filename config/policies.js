/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  // '*': true,

  UserController: {
    get:      'SessionAuth',
    update:   'SessionAuth',
    destroy:  'SessionAuth'
  },

  DeviceController: {
    destroy:  'SessionAuth'
  },

  FlatController: {
    get:      'SessionAuth',
    create:   'SessionAuth',
    update:   'SessionAuth',
    destroy:  'SessionAuth',
    leave:    'SessionAuth',
  },

  ItemController: {
    get:      'SessionAuth',
    create:   'SessionAuth',
    destroy:  'SessionAuth',
    update:   'SessionAuth',
    setstatus:'SessionAuth',
  }

};
