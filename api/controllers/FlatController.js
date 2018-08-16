/**
 * FlatGroupController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const flatNameRegexp        = /^[a-zA-Z0-9_-]{3,26}$/;

module.exports = {

  /* post /flat/get */
  get: function (req, res) {
    return res.json({
      error: true,
      warning: false,
      message: 'Unknown Server Error, Please Refresh & Try Again',
      content: null
    });
  },

  /* post /flat/create */
  create: function (req, res) {

    // Parse POST for Flat params.
    const name        = req.param('flatName');
    const flatMembers = req.param('flatMembers');

    if (name === null || name === undefined) {
      return res.json({
        error: false,
        warning: true,
        message: 'Invalid Flat Name',
        content: null
      });
    }

    /* Use Promises to get array of Users. */
    const flatUsers = flatMembers.map((member) => new Promise((resolve) => User.findOne({ username: member }).exec((err, user) => resolve(user))));

    Promise.all(flatUsers)
    .then(users => {
      let members = users.filter((member) => (member !== undefined)).map((user) => user.id);
      Flat.create({
        name,
        members,
      })
      .fetch()
      .then(newFlat => {
        return res.json({
          error: false,
          warning: false,
          message: 'Created New Flat',
          content: {
            newFlat,
          }
        })
      })
    })
    .catch(error => {
      return res.json({
        error: true,
        warning: false,
        message: 'Unexpected Server Error',
        content: null
      })
    });
  },


  /* post /user/destroy */
  destroy: function (req, res) {
    return res.json({
      error: true,
      warning: false,
      message: 'Unknown Server Error, Please Refresh & Try Again',
      content: null
    });
  },

  /* post /user/update */
  update: function (req, res) {
    return res.json({
      error: true,
      warning: false,
      message: 'Unknown Server Error, Please Refresh & Try Again',
      content: null
    });
  }

};

