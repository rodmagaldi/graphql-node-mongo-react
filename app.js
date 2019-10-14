// Here comes the main app info.

const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require('express-graphql');
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index")
const graphQlResolvers = require("./graphql/resolvers/index")
const isAuth = require("./middleware/is-auth")

// Begins executing express.js
const app = express();

// used to correctly parse json files
app.use(bodyParser.json());

// used for jwt authentication
app.use(isAuth);

// main graphqp info. Schema, resolvers, and using GraphiQL
app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

//connects to the DB via mongoose
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-seelp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
        .then(() => {
            app.listen(3000);
        })
        .catch(err => {
            console.log(err);
        })