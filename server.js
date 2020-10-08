const fs = require('fs');
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;

// in order for our server to accept incoming data the way we need it to, we need to tell our Express.js app to intercept our POST request before it gets to the callback function. First declare the app variable then parse.
const app = express();
// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());

const { animals } = require('./data/animals');

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;

    // add personalityTraits case below:
    if (query.personalityTraits) {
        // save personalityTraits as a dedicated array
        // if personalityTraits is a string, place it into a new array and save
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        // loop through each trait in the personalityTraits array:
        personalityTraitsArray.forEach(trait => {
            // check the trait against each animal in the filteredResults array. Remember, it is initially a copy of the animalsArray, but here we are updating it for each trait in the .forEach() loop. For each trait being targeted by the filter, the filteredResults array will then contain only the entires that contain the trait, so at the end we will have an array of animals that have every one of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        })
    }
    // retain diet, species and name queries here
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'), 
        JSON.stringify({ animals: animalsArray }, null, 2)
    );

    // return finished code to post route for response
    return body;
}

function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

app.post('/api/animals', (req, res) => {
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString();

    //if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
    // add animal to json file and animals array in this function
    const animal = createNewAnimal(req.body, animals);

    res.json(req.body);
    }
});

app.listen(PORT, () => {
    console.log(`:: API server now on port ${PORT}`);
});