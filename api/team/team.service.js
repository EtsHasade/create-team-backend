const memberService = require('./teamMember.service')
const sqlUtilService = require('../../services/sqlUtil.service')
const { createEntityService } = require('../../services/sqlCRUDL/entity.service.js')

const teamOptions = {
    tableName: 'team',
    entityName: 'team',
    createFields: ['name', 'description', 'projectId', 'creatorId'],
    updateFields: ['name', 'description', 'projectId'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsTeam  
}
const membersOptions = {
    relatedThingName: 'member',
    relationshipService: memberService
}
const teamService = createEntityService(teamOptions, membersOptions)

module.exports = {
    query: teamService.query,
    getById: teamService.getById,
    add: teamService.add,
    update: teamService.update,
    remove: teamService.remove
}


function _convertToJsTeam(sqlTeam) {
    return {
        ...sqlTeam,
        createdAt: sqlUtilService.getJsTimestamp(sqlTeam.createdAt),
    }
}
