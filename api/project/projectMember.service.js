const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function addMulti(projectId, members) {
    const membersFields = members.map(_getMemberFields)
    const fieldsStrs = membersFields.map(fields => `(${projectId}, ${fields.join()})`)
    const sql = `
            INSERT INTO projectMember (projectId, userId)
            VALUES ${fieldsStrs.join()};
        `
    try {
        const okPacket = await DBService.runSQL(sql)
        return okPacket
    } catch (error) {
        throw error
    }
}

async function updateProjectMembers(projectId, members) {
    if (!members.length) return members
    const { membersToUpdate, membersToAdd } = members.reduce((memberForActions, member) => {
        if (member.id) memberForActions.membersToUpdate.push(member)
        else memberForActions.membersToAdd.push(member)
        return memberForActions
    }, { membersToUpdate: [], membersToAdd: [] })

    try {
        for (const member of membersToUpdate) {
            await update(projectId, member)
        }
        await removeMultiExceptIds(projectId, membersToUpdate.map(member => member.id))
        await addMulti(projectId, membersToAdd)
        return await query({projectId})
        
    } catch (error) {
        throw error
    }
}

async function resetProjectMembers(projectId, members) {
    try {
        console.log('setMembers 1> start removing');
        await sqlUtilService.removeMultiWhere('projectMember', 'projectId', projectId)

        console.log('setMembers 2> start adding');
        await addMulti(projectId, members)
        return await query({projectId})
    } catch (error) {
        throw error
    }
}


async function getByProjectAndUserIds(projectId, userId) {
    const query = `SELECT * 
                 FROM projectMember
                 WHERE userId = ${userId} AND projectId = ${projectId};`

    try {
        const [member] = await DBService.runSQL(query)
        if (member) return _getJsMember(member)
        throw new Error(`member id ${userId, projectId} not found`)
    } catch (error) {
        throw error
    }
}

async function add(projectId, member) {
    const memberFields = _getMemberFields(member)
    const query = `INSERT INTO projectMember (projectId, userId) 
                 VALUES (${projectId}, ${memberFields.join()});`
    try {
        const { insertId } = await DBService.runSQL(query)
        member = await getById(insertId)
        return _getJsMember(member)
    } catch (error) {
        throw new Error(`Cannot add member to projectId:${projectId}:(${memberFields.join()})`)
    }
}


async function update(projectId, member) {
    const query = `UPDATE projectMember SET
                        invited = ${member.invited},
                        interested = ${member.interested}
                 WHERE projectId = ${projectId} AND userId = ${member.userId};`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows !== 0) return okPacket
        throw new Error(`No member updated - member id ${member.id}`)
    } catch (error) {
        throw error
    }
}

async function remove(projectId, userId) {
    const query = `DELETE FROM projectMember
                 WHERE projectId = ${projectId} AND userId = ${userId};`
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
                 FROM projectMember
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
                 FROM projectMember
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
    const query = `UPDATE projectMember SET
                        projectId = ${member.projectId},
                        userId = ${member.userId},
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
    const query = `DELETE FROM projectMember
                 WHERE id = ${memberId};`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No member deleted - member id ${memberId}`)
    } catch (error) {
        throw new Error(`No member deleted - member id ${memberId}`)
    }
}

async function removeMultiExceptIds(projectId, exceptIds) {
    return await sqlUtilService.removeMultiWhere('projectMember', 'projectId', projectId, {exceptFieldName:'id', exceptValues: exceptIds})
}

function _getJsMember(member) {
    return { ...member }
}

function _getMemberFields({ userId}) {
    return [userId]
}

module.exports = {
    query,
    getById,
    updateById,
    removeById,
    add,
    update,
    remove,
    getByProjectAndUserIds,
    updateProjectMembers,
    resetProjectMembers,
    addMulti
}

