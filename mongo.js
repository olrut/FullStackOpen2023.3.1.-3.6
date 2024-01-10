const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const phoneNumber = process.argv[4]

const url =
    `mongodb+srv://FullStack:${password}@cluster0.athyjkq.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: String,
})
const Persons = mongoose.model('Persons', personSchema)

if (process.argv[3]) {
    const person = new Persons({
        name: name,
        number: phoneNumber,
    })
    person.save().then(result => {
        console.log(`added ${name} number ${phoneNumber} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Persons.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}