require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

// Morgan to show POST data
app.use(
    morgan(function (tokens, req, res) {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            tokens.method(req, res) === 'POST' ? JSON.stringify(req.body) : ''
        ].join(' ')
    }))

// Info page
app.get('/info', (request, response) => {
    let personsCount = 0;
    Person.find({}).then(persons => {
        personsCount = persons.length;
        const currentDate = new Date();
        const html = `<p>Phonebook has info for ${personsCount} people <br/> ${currentDate}</p>`;
        response.send(html);
    })
})

// Get all persons
app.get('/api/persons/', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// Search by id
app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
})

// Update by id
app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body
    Person.findByIdAndUpdate(
        request.params.id,
        {name, number},
        {new: true, runValidators: true, context: 'query'}
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

// Delete by id
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

// Add new person
app.post('/api/persons', (request, response, next) => {
        const {name, number} = request.body

        // Check if name is missing
        if (name === undefined) {
            return response.status(400).json({
                error: 'content missing'
            })
        }

        const person = new Person({
            name: name,
            number: number,
        })

        person.save().then(savedPerson => {
            response.json(savedPerson)
        }).catch(error => next(error))

        morgan(':method :url :status :res[content-length] - :response-time ms')
    })

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }
    next(error)
}

app.use(errorHandler)