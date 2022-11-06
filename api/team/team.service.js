const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')

const teamOptions = {
    tableName: 'team',
    entityName: 'team',
    createFields: ['name', 'description', 'projectId', 'creatorId'],
    updateFields: ['name', 'description', 'projectId'],
    txtFields: ['name', 'description'],
    // getOutputEntity: _convertToJsTeam  
}

const teamCRUDService = new EntityCRUDService(teamOptions)

const teamMemberOptions = {
    tableName: 'teamMember',
    entityName: 'member',
    createFields: ['userId', 'invited', 'interested'],
    updateFields: ['invited', 'interested'],
    getOutputThing: _getJsMember
}
const teamMemberCRUDService = new EntityCRUDService(teamMemberOptions)

const teamService = new EntitiesRelationshipService(
    teamCRUDService,
    teamMemberCRUDService,
    'members',
    'teamId'
)

module.exports = teamService

function _getJsMember(member) {
    return {
        ...member,
        invited: !!member.invited,
        interested: !!member.interested,
    }
}
