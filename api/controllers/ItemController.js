/**
 * ItemController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  /* post /item/get */
  get: function (req, res) {
    return res.json({
      error: false,
      warning: false,
      message: 'Get Item Route',
      content: null
    });
  },

  /* post /item/create */
  create: function (req, res) {
    const user    = req.options.user;
    const flatID  = req.param('flatID');

    // Find the Flat Requested
    Flat.findOne({ id: flatID }).populateAll()
    .exec((err, flat) => {
      if (err) {
        return res.json({
          error: true,
          warning: false,
          message: 'Unexpected Server Error',
          content: null
        });
      }
      // Check this User is Authorised on this Flat.
      const userFlatIDs = user.flats.map(flat => flat.id);
      if (userFlatIDs.indexOf(flatID) === -1) {
        return res.json({
          error: false,
          warning: true,
          message: 'You are not authorised to create Items on this Flat.',
          content: null
        });
      }
      else {
        // This User can create Items on this Flat.
        const name        = req.param('name');
        const description = req.param('description');
        const rota        = JSON.stringify(flat.members.map(member => member.id));

        Item.create({ name, description, rota, flat: flat.id }).fetch()
        .exec((err, item) => {
          if (err) {
            return res.json({
              error: true,
              warning: false,
              message: 'Unexpected Server Error',
              content: err
            });
          }
          return res.json({
            error: false,
            warning: false,
            message: 'Created Item ' + item.name,
            content: item
          });
        });
      }
    });
  },

  /* post /item/destroy */
  destroy: function (req, res) {
    return res.json({
      error: false,
      warning: false,
      message: 'Destroy Item Route',
      content: null
    });
  },

  /* post /item/update */
  update: function (req, res) {
    const user    = req.options.user;
    const flatID  = req.param('flatID');
    const itemID  = req.param('itemID');

    // Check this User is Authorised to Update this Item.
    Item.findOne({ id: itemID })
    .exec((err, item) => {
      if (err) {
        return res.json({
          error:    true,
          warning:  false,
          message:  'Unexpected Server Error',
          content:  null
        });
      }
      // Check that this User is able to update this Item.
      const userFlats = user.flats.map(flat => flat.id);
      if (userFlats.indexOf(item.flat) === -1) {
        return res.json({
          error: false,
          warning: true,
          message: 'You are not authorised to update Items on this Flat.',
          content: null
        });
      }
      else {
        // Parse and Update Rota
        const rota      = JSON.parse(item.rota);
        const userIndex = rota.indexOf(user.id);
        rota.splice(userIndex, 1);
        rota.push(user.id);
        
        // Save Changes
        Item.update({id: itemID}, {rota: JSON.stringify(rota)}).fetch()
        .exec((err, updatedItem) => {
          if (err) {
            console.log(err);
            return res.json({
              error:    false,
              warning:  false,
              message:  'Unexpected Server Error',
              content:  err
            });
          }
          console.log(updatedItem);
          return res.json({
            error:    false,
            warning:  false,
            message:  'Test Complete',
            content:  updatedItem
          });
        })
      }
    });
  }

};

