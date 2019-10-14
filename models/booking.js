// Here, we create the Schema for the Booking type object.
// It works like a subclass of Schema

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: "Event"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    // adds createdAt and updatedAt timestamps
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema)