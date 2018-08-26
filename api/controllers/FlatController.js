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
    const user      = req.options.user;
    const id        = req.param('flatID');

    if (user.flats.some(flat => (flat.id === id))) {
      Flat.findOne({ id })
      .populateAll()
      .then((flat) => {
        return res.json({
          error: false,
          warning: false,
          message: null,
          content: flat,
        });
      });
    }
    else {
      return res.json({
        error: true,
        warning: false,
        message: 'You do not have permission to view this Flat.',
        content: null
      });
    }
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
        let messageExtra = '';
        if (members.length !== flatMembers.length) {
          messageExtra = ', however some users did not exist. You can always add them to the Flat later.';
        }
        return res.json({
          error: false,
          warning: false,
          message: 'Created Flat ' + newFlat.name + messageExtra,
          content: newFlat,
        });
      });
    })
    .catch(error => {
      return res.json({
        error: true,
        warning: false,
        message: 'Unexpected Server Error',
        content: null
      });
    });
  },


  /* post /user/destroy */
  destroy: function (req, res) {
    const user    = req.options.user;
    const flatID  = req.param('flatID');

    Flat.findOne({
      id: flatID
    })
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error:    false,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  err
        });
      }
      const rota = JSON.stringify(flat.rota);
      if (rota.indexOf(user.id) !== -1) {
        Flat.destroy({
          id: flatID
        })
        .fetch()
        .exec((err) => {
          if (err) { return res.json(Utils.returnJsonError(err)); }
          return res.json({
            error: false,
            warning: false,
            message: 'Flat Deleted.',
            content: null
          });
        });
      }
      else {
        return res.json({
          error: false,
          warning: true,
          message: 'You are not authorised to perform this action.',
          content: null
        });
      }
    });
  },

  /* post /user/update */
  update: function (req, res) {
    const user              = req.options.user;
    const flatID            = req.param('flatID');
    const newMemberUsername = req.param('newMemberUsername');

    User.findOne({
      username: newMemberUsername
    })
    .exec((err, newMember) => {
      if (err) { return res.json(Utils.returnJsonError(err)); }
      if (newMember) {

      }
      else {
        return res.json({
          error: false,
          warning: true,
          message: 'The user requested does not exist.',
          content: updatedFlat
        });
      }
    });
    Flat.findOne({
      id: flatID
    })
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error:    false,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  err
        });
      }
      const rota = JSON.stringify(flat.rota);
      if (oldRota.indexOf(user.id) !== -1) {
        rota.unshift(newMemberID);
        Flat.update({ id: flatID }, { rota })
        .fetch()
        .exec((err) => {
          if (err) { return res.json(Utils.returnJsonError(err)); }
          Flat.addToCollection(flatID, 'members')
          .members(newMemberID)
          .exec((err, updatedFlat) => {
            if (err) { return res.json(Utils.returnJsonError(err)); }
            return res.json({
              error: false,
              warning: false,
              message: 'Member Added',
              content: updatedFlat
            });
          });
        });
      }
      else {
        return res.json({
          error: false,
          warning: true,
          message: 'You are not authorised to perform this action.',
          content: null
        });
      }
    });
  },

  /* post /user/destroy */
  leave: function (req, res) {
    const user    = req.options.user;
    const flatID  = req.param('flatID');

    // Save Changes
    Flat.findOne({
      id: flatID
    })
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error:    false,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  err
        });
      }
      const oldRota = JSON.stringify(flat.rota);
      Flat.update({ id: flat.id }, { rota: oldRota.filter(elem => elem !== user.id)}).fetch()
      .exec((err, intermediateFlat) => {
        if (err) {
          return res.json({
            error:    false,
            warning:  false,
            message:  'Unexpected Server Error',
            content:  err
          });
        }
        Flat.removeFromCollection(intermediateFlat.id, 'members')
        .members(user.id)
        .exec((err, updatedFlat) => {
          if (err) {
            return res.json({
              error:    false,
              warning:  false,
              message:  'Unexpected Server Error',
              content:  err
            });
          }
          return res.json({
            error:    false,
            warning:  false,
            message:  'Updated Flat',
            content:  updatedFlat
          });
        });
      });
    });
    

    return res.json({
      error: true,
      warning: false,
      message: 'Unknown Server Error, Please Refresh & Try Again',
      content: null
    });
  },

};

