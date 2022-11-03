const memberService = require('./projectMember.service')
const sqlUtilService = require('../../services/sqlUtil.service')
const { createEntityService } = require('../../services/sqlCRUDL/entity.service.js')

const projectOptions = {
    tableName: 'project',
    entityName: 'project',
    createFields: ['name', 'description', 'creatorId'],
    updateFields: ['name', 'description', 'isActive'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsProject  
}
const membersOptions = {
    relatedThingName: 'member',
    relationshipService: memberService
}
const projectService = createEntityService(projectOptions, membersOptions)

module.exports = {
    query: projectService.query,
    getById: projectService.getById,
    add: projectService.add,
    update: projectService.update,
    remove: projectService.remove
}


function _convertToJsProject(sqlProject) {
    return {
        ...sqlProject,
        isActive: !!sqlProject.isActive,
        createdAt: sqlUtilService.getJsTimestamp(sqlProject.createdAt),
    }
}
