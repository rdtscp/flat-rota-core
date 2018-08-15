/**
 * DeviceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require('bcrypt');

let getFailureMessage = 'Invalid username or password.';

module.exports = {

  /*' post /device/get'
   * Query to check and see if a device auth token is still valid.
   *
   */
  get: function (req, res) {
    // Parse POST for User params.
    var authToken   = req.param('authToken');
    // Check the request is authenticted.
    Device.findOne({
      authToken: authToken
    }).exec((err, registeredDevice) => {
      if (err) { return res.json(Utils.returnJsonError(err)); }
      if (registeredDevice) {
        return res.json({
          error: false,
          warning: false,
          message: null,
          content: {
            authStatus: true,
            authToken: authToken,
          }
        });
      } else {
        return res.json({
          error: false,
          warning: false,
          message: null,
          content: {
            authStatus: false,
            authToken: authToken,
          }
        });
      }
    });
  },

  /* 'post /device/create'
   * Submit User credentils to create a Device authenticated to the supplied credentials.
   *
   */
  create: function (req, res) {
    // Parse POST for User params.
    var requestUsername  = req.param('username');
    var requestPassword  = req.param('password');

    if (requestUsername === null || requestUsername === undefined || requestPassword === null || requestPassword === undefined) {
      return res.json({
        error: true,
        warning: false,
        message: 'Invalid Request',
        content: null
      });
    }

    // Look up User.
    User.findOne({
      username: requestUsername
    }).exec((err, existingUser) => {
      if (err) { return res.json(Utils.returnJsonError(err)); }
      if (existingUser) {
        // Check Password matches database password.
        bcrypt.compare(requestPassword, existingUser.password, (err, match) => {
          if (err) { return res.json(Utils.returnJsonError(err)); }
          if (match === true) {
            // Create a new Device for this account to be authenticate to.
            Device.create({
              owner: existingUser.id,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            })
            .fetch()
            .exec((err, newDevice) => {
              if (err) { return res.json(Utils.returnJsonError(err)); }
              if (newDevice) {
                return res.json({
                  error: false,
                  warning: false,
                  message: null,
                  content: {
                    authStatus: true,
                    authToken: newDevice.authToken
                  }
                });
              } else {
                return res.json({
                  error: false,
                  warning: true,
                  message: '500 Server Error: Unable to authenticate device, please try again.',
                  content: null
                });
              }
            });
          } else {
            return res.json({
              error: false,
              warning: true,
              message: getFailureMessage,
              content: null
            });
          }
        });
      } else {
        return res.json({
          error: false,
          warning: true,
          message: getFailureMessage,
          content: null
        });
      }
    });
  },

  /*' post /device/destroy'
   * Query to de-authorise/delete a Device from a User.
   *
   */
  destroy: function (req, res) {
    let deviceId        = req.param('deviceID');
    let deviceAuthToken = req.param('deviceAuthToken');

    // Check the request is authenticted.
    Device.destroy({
      id: deviceId,
      authToken: deviceAuthToken
    })
    .exec((err) => {
      if (err) {
        return res.json(Utils.returnJsonError(err));
      }
      else {
        return res.json({
          error: false,
          warning: false,
          message: 'Device De-Authorised',
          content: null
        });
      }
    });
  },

};

