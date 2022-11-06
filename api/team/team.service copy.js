const memberService = require('./teamMember.service')
const sqlUtilService = require('../../services/sqlUtil.service')
const { createEntityService } = require('../../services/sqlCRUDL/entity.service')

const teamOptions = {
    tableName: 'team',
    entityName: 'team',
    createFields: ['name', 'description', 'projectId', 'creatorId'],
    updateFields: ['name', 'description', 'projectId'],
    txtFields: ['name', 'description'],  
    // getOutputEntity: _convertToJsTeam  
}
const membersOptions = {
    relationKey: 'members',
    relationshipService: memberService
}
const teamService = createEntityService(teamOptions, membersOptions)

module.exports = teamService
