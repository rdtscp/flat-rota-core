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
        const filteredMembers = flat.members.filter(member => member.id === user.id);
        if (filteredMembers.length > 0) {
          return res.json({
            error: false,
            warning: false,
            message: null,
            content: flat,
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
    }).populateAll()
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error:    false,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  err
        });
      }
      const filteredMembers = flat.members.filter(member => member.id === user.id);
      if (filteredMembers.length > 0) {
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
          const filteredMembers = flat.members.filter(member => member.id === user.id);
          if (filteredMembers.length > 0) {
            Flat.addToCollection(flatID, 'members')
            .members(newMemberID)
            .exec((err, updatedFlat) => {
              if (err) { return res.json(Utils.returnJsonError(err)); }
              const itemRotasUpdated = flat.items.map((item) => {
                new Promise((resolve, reject) => {
                  Item.findOne({
                    id: item.id
                  })
                  .exec((err, item) => {
                    if (err) { reject(); }
                    const rota = JSON.stringify(item.rota);
                    rota.unshift(newMember.id);
                    Item.update({id: item.id}, {rota: rota}).fetch()
                    .exec((err, updatedItem) => {
                      if (err) { reject(); }
                      resolve(updatedItem);
                    });
                  });
                });    
              });
        
              Promise.all(itemRotasUpdated)
              .then((items) => {
                return res.json({
                  error: false,
                  warning: false,
                  message: 'Added User to Flat',
                  content: null
                }); 
              })
              .catch(error => {
                return res.json({
                  error: false,
                  warning: true,
                  message: 'Error Adding User to Item Rotas',
                  content: null
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
      }
      else {
        return res.json({
          error: false,
          warning: true,
          message: 'The user requested does not exist.',
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
    }).populateAll()
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error:    false,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  err
        });
      }

      const itemRotasUpdated = flat.items.map((item) => {
        new Promise((resolve, reject) => {
          Item.findOne({
            id: item.id
          })
          .exec((err, item) => {
            if (err) { reject(); }
            const oldRota = JSON.stringify(item.rota);
            const newRota = oldRota.filter(elem => elem !== user.id);
            Item.update({id: item.id}, {rota: newRota}).fetch()
            .exec((err, updatedItem) => {
              if (err) { reject(); }
              resolve(updatedItem);
            });
          });
        });    
      });

      Promise.all(itemRotasUpdated)
      .then((items) => {
        Flat.removeFromCollection(flat.id, 'members')
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
      })
      .catch(error => {
        return res.json({
          error:    true,
          warning:  false,
          message:  'Error Leaving Flat',
          content:  null
        });
      });
    });
  },

};

