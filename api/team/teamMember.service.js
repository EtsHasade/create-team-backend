const { createRelationshipService } = require('../../services/sqlCRUDL/entityRelationship.service')

const teamMemberOptions = {
    tableName: 'teamMember',
    relationName: 'member',
    entityAKey: 'teamId',
    entityBKey: 'userId',
    createFields:['userId', 'invited', 'interested'],
    updateFields:['invited', 'interested'],
    getOutputThing: _getJsMember
}
const teamMemberService = createRelationshipService(teamMemberOptions)

module.exports = teamMemberService


function _getJsMember(member) {
    return {
        ...member,
        invited: !!member.invited,
        interested: !!member.interested,
    }
}


