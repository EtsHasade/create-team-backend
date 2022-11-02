
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
        // const teams = await collection.find(criteria).toArray();
        const teams = var reviews = await collection.aggregate([
            {
                // Filter inside aggregation
                $match: criteria
            },
            {
                $lookup://go fetch
                {
                    //Specify the field name inside each local item (review)
                    //to search for in the foreign collection (user)
                    localField: '_id',

                    //The "foreign" collection name to fetch from
                    from: 'user',


                    //Specify the field name in the foriegn (user) collection ->
                    //only the matching ones will be inserted to the review.
                    foreignField: 'members._id',

                    //Specify the field name that will be inserted 
                    //and passing a value of the matching user obj.(AS AN ARRAY)
                    as: 'byUser'
                }
            },
            {
                //Flatten array to an object -!!!
                //(done ONLY when WE KNOW there's only one item found to be found)
                $unwind: '$byUser'

            },
            {
                $lookup:
                {
                    localField: 'toyId',
                    from: 'toy',
                    foreignField: '_id',
                    as: 'aboutToy'
                },
            },
            {
                $unwind: '$aboutToy'
            }
        ]).toArray()
        // Clean up unneeded feilds from toy, user and review
        reviews = reviews.map(review => {
            review.byUser = { _id: review.byUser._id, username: review.byUser.username }
            review.aboutToy = { _id: review.aboutToy._id, toyname: review.aboutToy.name }
            review.createdAt = ObjectId(review._id).getTimestamp()
            delete review.userId;
            delete review.toyId;
            return review;
        })
        return reviews
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


// [
//     {
//         // Filter inside aggregation
//         $match: { _id: ObjectId("61f9595a845b265f8429d0e3") }
//     },
//     {
//         $lookup:{
//             localField: 'members._id',
//             from: 'user',
//             foreignField: 'projects.teams._id',
//             as: 'users'
//         },
//     },
//     {
//         $project: {
//             _id: 1,
//             email: 1,
//             username: 1,
//             members: {status: "$projects.teams.status"}
//         }
//     },
//     {
//         $unwind: "$members.status"
//     }

// ]