const memberService = require('./teamMember.service')
const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function query(criteria) {
    let sql = `SELECT * 
               FROM team
               `

    sql += sqlUtilService.getWhereSql(criteria)

    try {
        const teams = await DBService.runSQL(sql)
        if (teams.length) {
            for (const team of teams) {
                team.members = await memberService.query({ teamId: team.id })

            }
            return teams.map(team => _getJsTeam(team))
        }
        return []
    } catch (error) {
        throw error
    }
}


async function getById(teamId) {
    const query = `SELECT * 
                 FROM team
                 WHERE id = ${teamId}`

    const [team] = await DBService.runSQL(query)
    if (team) {
        team.members = await memberService.query({ teamId: team.id })
        return _getJsTeam(team)
    }
    throw new Error(`team id ${teamId} not found`)
}


async function add(team) {
    const teamFieldsStr = `("${team.name}","${team.desc}",${team.projectId},${team.creatorId})`
    const sql = `INSERT INTO team (name, description, projectId, creatorId) 
                 VALUES ${teamFieldsStr};`

    const { insertId } = await DBService.runSQL(sql)
    if (!insertId) throw new Error(`Cannot add team: ${teamFieldsStr}`)
    team.id = insertId
    if (team.members.length) {
        console.log('set members: ', team.members);
        await memberService.addMulti(team.id, team.members)
        team.members = await memberService.query({teamId: team.id})
    }
    return team
}


async function update(team) {
    const query = `UPDATE team SET
                        name = "${team.name}",
                        description = "${team.description}",
                        projectId = ${team.projectId}
                    WHERE id = ${team.id};
                    `
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows < 1) throw new Error(`No team updated - team id ${team.id}`)
        team.members = await memberService.updateTeamMembers(team.id, team.members)
        return team

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
    console.log("🚀 ~ file: team.service.js ~ line 84 ~ _getJsTeam ~ team", team)

    return {
        ...team,
        createdAt: sqlUtilService.getJsTimestamp(team.createdAt),
    }
}

module.exports = {
    query,
    getById,
    add,
    update,
    remove
}

