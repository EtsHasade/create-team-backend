
const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

const TEAM_COLLECTION = 'team';

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
        const collection = await dbService.getCollection(TEAM_COLLECTION)
        const teams = await collection.find(criteria).toArray();
        return teams
    } catch (err) {
        console.log('ERROR: cannot find teams')
        throw err;
    }
}

async function getById(teamId) {
    try {
        const collection = await dbService.getCollection(TEAM_COLLECTION)
        const team = await collection.findOne({ '_id': ObjectId(teamId) })
        return team

    } catch (err) {
        console.log(`ERROR: while finding team ${teamId}`)
        throw err;
    }
}

async function getByEmail(email) {
    try {
        const collection = await dbService.getCollection(TEAM_COLLECTION)
        const team = await collection.findOne({ email })
        return team
    } catch (err) {
        console.log(`ERROR: while finding team ${email}`)
        throw err;
    }
}

async function remove(teamId) {
    try {
        const collection = await dbService.getCollection(TEAM_COLLECTION)
        await collection.deleteOne({ '_id': ObjectId(teamId) })
    } catch (err) {
        console.log(`ERROR: cannot remove team ${teamId}`)
        throw err;
    }
}

async function update(team) {
    team._id = ObjectId(team._id);
    try {
        const collection = await dbService.getCollection(TEAM_COLLECTION)
        await collection.replaceOne({ _id: team._id }, { $set: team })
        return team
    } catch (err) {
        console.log(`ERROR: cannot update team ${team._id}`)
        throw err;
    }
}

async function add(team) {
    team.createdAt = Date.now()
    const collection = await dbService.getCollection(TEAM_COLLECTION)
    try {
        await collection.insertOne(team);
        return team;
    } catch (err) {
        console.log(`ERROR: cannot insert team`)
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.userId) {
        if (filterBy.status) {
            criteria.members = { _id: filterBy.userId, status: filterBy.status }
        } else {
            criteria['members._id'] = filterBy.userId
        }
    }
    if (filterBy.creatorId) {
        criteria.members = { _id: filterBy.creatorId, status: 'creator' }
    }
    if (filterBy.invitedId) {
        criteria.members = { _id: filterBy.invitedId, status: 'invited' }
    }
    if (filterBy.status) {
        criteria['members.status'] = filterBy.status
    }

    return criteria;
}


