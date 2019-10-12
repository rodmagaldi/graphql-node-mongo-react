const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking")

const eventsf = async eventIds => {
    try {
        const events = await Event.find({
            _id: {
                $in: eventIds
            }
        })
        events.map(event => {
            return {
                ...event._doc,
                creator: user.bind(this, event.creator),
                date: new Date(event._doc.date).toISOString()
            };
        })
        return events;
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return {
            ...user._doc,
            createdEvents: eventsf.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            creator: user.bind(this, event.creator)
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => {
                return {
                    ...event._doc,
                    creator: user.bind(this, event._doc.creator),
                    date: new Date(event._doc.date).toISOString()
                };
            })
        } catch (err) {
            throw err
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find()
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                };
            })
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5d9f90008efe12e1e051ccc7'
        })
        let createdEvent;
        try {
            const result = await event.save()
            createdEvent = {
                ...result._doc,
                creator: user.bind(this, result._doc.creator),
                date: new Date(event._doc.date).toISOString()
            }
            const creator = await User.findById('5d9f90008efe12e1e051ccc7')

            if (!creator) {
                throw new Error("User not found.")
            }
            creator.createdEvents.push(event)
            await creator.save()

            return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        };
    },
    createUser: async (args) => {
        try {
            const existingUser = await User.findOne({
                email: args.userInput.email
            })
            if (existingUser) {
                throw new Error("User already exists.")
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12)


            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const result = await user.save();

            return {
                ...result._doc,
                password: null
            }
        } catch (err) {
            throw err;
        }

    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({_id: args.eventId})
        const booking = new Booking({
            user: '5d9f90008efe12e1e051ccc7',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {...booking.event._doc, creator: user.bind(this, booking.event._doc.creator)}
            await Booking.deleteOne({_id: args.bookingId})
            return event;
        } catch (err) {
            throw err;
        }
    }
}