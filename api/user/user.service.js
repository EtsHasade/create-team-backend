const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function query(criteria = {}) {
    const namePart = criteria.txt || ''
    const txtFieldsList = ['username', 'email'].join('+')
    const query = `SELECT * 
                 FROM user
                 WHERE (${txtFieldsList}) LIKE '%${namePart}%'`
    try {
        const users = await DBService.runSQL(query)
        return users.map(user => _getJsUser(user))
    } catch (error) {
        throw error
    }
}

async function getById(userId) {
    const query = `SELECT * 
                 FROM user
                 WHERE id = ${userId}`

    const [user] = await DBService.runSQL(query)
    if (user) return _getJsUser(user)
    throw new Error(`user id ${userId} not found`)
}


 async function add(user) {
    const query = `INSERT INTO user (name, email, password) 
                 VALUES ("${user.name}",
                         "${user.email}",
                         "${user.password}")`

    return await DBService.runSQL(query)
}


async function update(user) {
    const query = `UPDATE user SET
                        name = "${user.name}",
                        email = "${user.email}",
                        isActive = "${user.isActive}",
                 WHERE id = ${user.id}`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows !== 0) return okPacket
        throw new Error(`No user updated - user id ${user.id}`)
    } catch (error) {
        throw error
    }
}


async function remove(userId) {
    const query = `DELETE FROM user
                 WHERE id = ${userId}`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No user deleted - user id ${userId}`)
    } catch (error) {
        throw new Error(`No user deleted - user id ${userId}`)
    }
}

function _getJsUser(user) {
    return {
        ...user,
        createdAt: sqlUtilService.getJsTimestamp(user.createdAt),
        isActive: !!user.isActive,
        isAdmin: !!user.isAdmin,
    }
}

module.exports = {
    query,
    getById,
    add,
    update,
    remove
}

