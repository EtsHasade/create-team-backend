const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function addMulti(teamId, members) {
    const membersFields = members.map(_getMemberFields)
    const fieldsStrs = membersFields.map(fields => `(${teamId}, ${fields.join()})`)
    const sql = `
            INSERT INTO teamMember (teamId, userId, invited, interested)
            VALUES ${fieldsStrs.join()};
        `
    try {
        const okPacket = await DBService.runSQL(sql)
        return await query({teamId})
    } catch (error) {
        throw error
    }
}

async function updateTeamMembers(teamId, members) {
    if (!members.length) return members
    const { membersToUpdate, membersToAdd } = members.reduce((memberForActions, member) => {
        if (member.id) memberForActions.membersToUpdate.push(member)
        else memberForActions.membersToAdd.push(member)
        return memberForActions
    }, { membersToUpdate: [], membersToAdd: [] })

    try {
        for await (const member of membersToUpdate) {
            await update(teamId, member)
        }
        await removeMultiExceptIds(teamId, membersToUpdate.map(member => member.id))
        await addMulti(teamId, membersToAdd)
        return query({teamId})
    } catch (error) {
        throw error
    }
}

async function resetTeamMembers(teamId, members) {
    try {
        console.log('setMembers 1> start removing');
        await sqlUtilService.removeMultiWhere('teamMember', 'teamId', teamId)

        console.log('setMembers 2> start adding');
        return await addMulti(teamId, members)
    } catch (error) {
        throw error
    }
}


async function getByTeamAndUserIds(teamId, userId) {
    const query = `SELECT * 
                 FROM teamMember
                 WHERE userId = ${userId} AND teamId = ${teamId};`

    try {
        const [member] = await DBService.runSQL(query)
        if (member) return _getJsMember(member)
        throw new Error(`member id ${userId, teamId} not found`)
    } catch (error) {
        throw error
    }
}

async function add(teamId, member) {
    const memberFields = _getMemberFields(member)
    const query = `INSERT INTO teamMember (teamId, userId, invited, interested) 
                 VALUES (${teamId}, ${memberFields.join()});`
    try {
        const { insertId } = await DBService.runSQL(query)
        return await getById(insertId)
    } catch (error) {
        throw new Error(`Cannot add member to teamId:${teamId}:(${memberFields.join()})`)
    }
}


async function update(teamId, member) {
    const query = `UPDATE teamMember SET
                        invited = ${member.invited},
                        interested = ${member.interested}
                 WHERE teamId = ${teamId} AND userId = ${member.userId};`
    try {
        const okPacket = await DBService.runSQL(query)
        console.log("🚀 ~ file: teamMember.service.js ~ line 87 ~ update ~ okPacket", okPacket)
        
        if (okPacket.affectedRows !== 0) return okPacket
        // throw new Error(`No member updated - member id ${member.id}`)
    } catch (error) {
        throw error
    }
}

async function remove(teamId, userId) {
    const query = `DELETE FROM teamMember
                 WHERE teamId = ${teamId} AND userId = ${userId};`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No member deleted - member id ${memberId}`)
    } catch (error) {
        throw new Error(`No member deleted - member id ${memberId}`)
    }
}


async function query(criteria = { 1: 1 }) {
    const criteriaStr = Object.keys(criteria).map(key => `${key} = ${criteria[key]}`).join(' AND ')

    const query = `SELECT * 
                 FROM teamMember
                 WHERE ${criteriaStr};`
    try {
        const members = await DBService.runSQL(query) || []
        return members.map(member => _getJsMember(member))
    } catch (error) {
        throw error
    }
}

async function getById(memberId) {
    const query = `SELECT * 
                 FROM teamMember
                 WHERE id = ${memberId};`
    try {
        const [member] = await DBService.runSQL(query)
        if (member) return _getJsMember(member)
        throw new Error(`member id ${memberId} not found`)
    } catch (error) {
        throw error
    }
}



async function updateById(memberId, member) {
    const query = `UPDATE teamMember SET
                        teamId = ${member.teamId},
                        userId = ${member.userId},
                        invited = ${member.invited},
                        interested = ${member.interested},
                 WHERE id = ${memberId};`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows !== 0) return okPacket
        throw new Error(`No member updated - member id ${member.id}`)
    } catch (error) {
        throw error
    }
}


async function removeById(memberId) {
    const query = `DELETE FROM teamMember
                 WHERE id = ${memberId};`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No member deleted - member id ${memberId}`)
    } catch (error) {
        throw new Error(`No member deleted - member id ${memberId}`)
    }
}

async function removeMultiExceptIds(teamId, exceptIds) {
    return await sqlUtilService.removeMultiWhere('teamMember', 'teamId', teamId, {exceptFieldName:'id', exceptValues: exceptIds})
}

function _getJsMember(member) {
    return { ...member }
}

function _getMemberFields({ userId, invited, interested }) {
    return [userId, invited, interested]
}

module.exports = {
    query,
    getById,
    updateById,
    removeById,
    add,
    update,
    remove,
    getByTeamAndUserIds,
    updateTeamMembers,
    resetTeamMembers,
    addMulti
}

