const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const mongoose = require('mongoose');

// Connect to Mongoose.
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/flatrota', {useMongoClient: true});

const { Topup, TopupType } = require('../models/topup.js');

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        topups: {
            type: new GraphQLList(TopupType),
            args: {
                resource: { type: GraphQLString },
                name: { type: GraphQLString },
                date: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                return new Promise((resolve, reject) => {
                    var count = 0;
                    for(var prop in args)
                    {
                        count++;
                    }
                    if (count > 0) {
                        console.log(args);
                        Topup.find(args).then((topups) => {
                            console.log(topups);
                            resolve(topups);
                        });
                    }
                    else {
                        console.log('No args');
                        Topup.find().then((topups) => {
                            console.log(topups);
                            resolve(topups);
                        });
                    }
                }).then(topups => topups);
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});