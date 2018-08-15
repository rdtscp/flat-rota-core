/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require('bcrypt');

// create messages.
var usernameRegexp        = /^[a-zA-Z0-9_-]{3,26}$/;
var passwordRegexp        = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,50})$/;
var usernameInvalidMsg    = 'Username must be between 3 and 26 characters long, and can only contain alphanumerical, \'-\' and \'_\'';
var passwordInvalidMsg    = 'Password must contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';
var userExistsMsg         = 'User already exists with that username.';
var userCreatedMsg        = 'Succesfully Created Account';

// Destroy/Update messages.
var accountUpdatedMsg     = 'Account succesfully updated. If you changed your password, you will need to re-login on your devices.';

module.exports = {

  /* 'post /user/get'
   * Retrieves a User Model if authenticated.
   *
   * Returns json:
   * {
   *     error: [ true | false ],
   *     warning: [ true | false ],
   *     content: Error, Warning or Success message,
   *     user: The User model of this requester
   * }
   *
   */
  get: function (req, res) {
    /* Input Validation */
    if (req.options.user === null || req.options.user === undefined) {
      return res.json({
        error: true,
        warning: false,
        message: 'Unknown Server Error, Please Refresh & Try Again',
        content: null
      });
    }
    return res.json({
      error: false,
      warning: false,
      message: null,
      content: _.omit(req.options.user, ['password'])
    });
  },

  /* 'post /user/create'
   * Check if a user exists under post param "username". If not, creates a new one.
   *
   * Returns json:
   * {
   *     error: [ true | false ],
   *     warning: [ true | false ],
   *     content: Error, Warning or Success message; E.G. [ 'User already exists' | 'Password must contain 1 uppercase' ],
   * }
   */
  create: function (req, res) {

    // Parse POST for User params.
    var submitUsername  = req.param('username');
    var submitPassword  = req.param('password');

    if (submitUsername === null || submitUsername === undefined) {
      return res.json({
        error: false,
        warning: true,
        message: usernameInvalidMsg,
        content: null
      });
    }

    if (submitPassword === null || submitPassword === undefined) {
      return res.json({
        error: false,
        warning: true,
        message: usernameInvalidMsg,
        content: null
      });
    }

    // Check username is valid.
    if (submitUsername.search(usernameRegexp) === -1) {
      return res.json({
        error: false,
        warning: true,
        message: usernameInvalidMsg,
        content: null
      });
    }

    // Check password is valid.
    if (submitPassword.search(passwordRegexp) === -1) {
      return res.json({
        error: false,
        warning: true,
        message: passwordInvalidMsg,
        content: null
      });
    }

    // Check if a User exists under this username already.
    User.findOne({
      username: submitUsername
    }).exec((err, searchedUser) => {
      // Error: return error to client app.
      if (err) { return res.json(Utils.returnJsonError(err)); }
      // If the user exists.
      if (searchedUser) {
        // Return a warning that the user exists.
        return res.json({
          error: false,
          warning: true,
          message: userExistsMsg,
          content: null
        });
      } else {
        User.create({
          username: submitUsername,
          password: submitPassword
        }).exec((err) => {
          if (err) { return res.json(Utils.returnJsonError(err)); }
          return res.json({
            error: false,
            warning: false,
            message: userCreatedMsg,
            content: null
          });
        });
      }
    });
  },

  /* 'post /user/destroy'
   * Destroys a User model if requested is authenticated.
   *
   * Returns json:
   * {
   *     error: [ true | false ],
   *     warning: [ true | false ],
   *     message: Error, Warning or Success message; E.G. [ 'Account Deleted.' ],
   *     exists: [ true | false ],
   *     user: User.js model
   * }
   *
   */
  destroy: function (req, res) {
    // Parse POST for User params.
    let user      = req.options.user;
    if (user === null || user === undefined) {
      return res.json({
        error: true,
        warning: false,
        message: 'Unknown Server Error, Please Refresh & Try Again',
        content: null
      });
    }

    // Remove the User model from the table. User model will delete its dependent children.
    User.destroy({
      id: user.id
    })
    .fetch()
    .exec((err) => {
      if (err) { return res.json(Utils.returnJsonError(err)); }
      return res.json({
        error: false,
        warning: false,
        message: 'Account Deleted.',
        content: null
      });
    });
  },

  /* 'post /user/update'
   * Updates info on a User model if request is authenticated.
   *
   * Returns json:
   * {
   *     error: [ true | false ],
   *     warning: [ true | false ],
   *     message: Error, Warning or Success message; E.G. [ 'Account Updated', 'Invalid new Password' ],
   *     exists: [ true | false ],
   *     user: User.js model
   * }
   */
  update: function (req, res) {
    // Parse POST for User params.
    var valuesToUpdate      = {};
    valuesToUpdate.password = req.param('password');
    var user                = req.options.user;

    /* Input Validation */
    if (user === null || user === undefined) {
      return res.json({
        error: true,
        warning: false,
        message: 'Unknown Server Error, Please Refresh & Try Again',
        content: null
      });
    }
    if (valuesToUpdate.password === null || valuesToUpdate.password === undefined) {
      return res.json({
        error: false,
        warning: warning,
        message: 'New Password Cannot be Empty',
        content: null
      });
    }

    // Check new password is valid.
    if (valuesToUpdate.password.search(passwordRegexp) === -1) {
      return res.json({
        error: false,
        warning: true,
        message: passwordInvalidMsg,
        content: null
      });
    } else {
      // Hash the password.
      bcrypt.hash(valuesToUpdate.password, 10, (err, hash) => {
        if(err) { return res.json(Utils.returnJsonError(err)); }
        // Update desired User model with new data.
        User.update(
            {id: user.id},
            {password: hash}
        )
        .fetch()
        .exec((err) => {
          if (err) { return res.json(Utils.returnJsonError(err)); }
          else {
            return res.json({
              error: false,
              warning: false,
              message: accountUpdatedMsg,
              content: null
            });
          }
        });
      });
    }
  }

};

