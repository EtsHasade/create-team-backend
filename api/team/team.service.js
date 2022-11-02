const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function query(criteria = {}) {
    const namePart = criteria.txt || ''
    const txtFieldsList = ['name', 'description'].join('+')
    const query = `SELECT * 
                 FROM team
                 WHERE (${txtFieldsList}) LIKE '%${namePart}%'`
    try {
        const teams = await DBService.runSQL(query)
        return teams.map(team => _getJsTeam(team))
    } catch (error) {
        throw error
    }
}

async function getById(teamId) {
    const query = `SELECT * 
                 FROM team
                 WHERE id = ${teamId}`

    const [team] = await DBService.runSQL(query)
    if (team) return _getJsTeam(team)
    throw new Error(`team id ${teamId} not found`)
}


 async function add(team) {
    const query = `INSERT INTO team (name, description, projectId, creatorId) 
                 VALUES ("${team.name}",
                         "${team.desc}",
                         "${team.projectId}",
                         "${team.creatorId}")`

    return await DBService.runSQL(query)
}


async function update(team) {
    const query = `UPDATE team SET
                        name = "${team.name}",
                        description = "${team.description}",
                        isActive = "${team.isActive}",
                 WHERE id = ${team.id}`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows !== 0) return okPacket
        throw new Error(`No team updated - team id ${team.id}`)
    } catch (error) {
        throw error
    }
}


async function remove(teamId) {
    const query = `DELETE FROM team
                 WHERE id = ${teamId}`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No team deleted - team id ${teamId}`)
    } catch (error) {
        throw new Error(`No team deleted - team id ${teamId}`)
    }
}

function _getJsTeam(team) {
    return {
        ...team,
        createdAt: sqlUtilService.getJsTimestamp(team.createdAt),
        isActive: !!team.isActive,
        isAdmin: !!team.isAdmin,
    }
}

module.exports = {
    query,
    getById,
    add,
    update,
    remove
}

