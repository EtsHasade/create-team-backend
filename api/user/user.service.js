
const dbService = require('../../services/db.service')
// const teamService = require('../team/team.service')
// const ObjectId = require('mongodb').ObjectId

const USER_COLLECTION = 'user';

module.exports = {
    query,
    getById,
    getByEmail,
    remove,
    update,
    add
}


async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection(USER_COLLECTION)
        const users = await collection.find(criteria).toArray();
        return users
    } catch (err) {
        console.log('ERROR: cannot find users')
        throw err;
    }
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION)
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password

        user.teams = await teamService.query({ userId: ObjectId(user._id) })
        // user.teams = user.teams.map(team => {
        //  // good place to map the teams in user for display
        //     return team
        // })

        return user
    } catch (err) {
        console.log(`ERROR: while finding user ${userId}`)
        throw err;
    }
}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION)
        const user = await collection.findOne({ email })
        return user
    } catch (err) {
        console.log(`ERROR: while finding user ${email}`)
        throw err;
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION)
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        console.log(`ERROR: cannot remove user ${userId}`)
        throw err;
    }
}

async function update(user) {
    user._id = ObjectId(user._id);
    try {
        const collection = await dbService.getCollection(USER_COLLECTION)
        await collection.replaceOne({ _id: user._id }, { $set: user })
        return user
    } catch (err) {
        console.log(`ERROR: cannot update user ${user._id}`)
        throw err;
    }
}

async function add(user) {
    const collection = await dbService.getCollection(USER_COLLECTION)
    try {
        await collection.insertOne(user);
        return user;
    } catch (err) {
        console.log(`ERROR: cannot insert user`)
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.txt) {
        criteria.username = filterBy.txt
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: +filterBy.minBalance }
    }
    return criteria;
}


