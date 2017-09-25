var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;

var topupSchema = mongoose.Schema ({
    resource: String,
    name: String,
    date: String
});

var Topup = mongoose.model('Topup', topupSchema);


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const TopupType = new GraphQLObjectType({
    name: 'Topup',
    fields: () => ({
        resource: { type: GraphQLString },
        name: { type: GraphQLString },
        date: { type: GraphQLString }
    }) 
});

module.exports = { Topup, TopupType };