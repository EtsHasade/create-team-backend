const memberService = require('./projectMember.service')
const sqlUtilService = require('../../services/sqlUtil.service')
const { createEntityService } = require('../../services/sqlCRUDL/entity.service')


const projectOptions = {
    tableName: 'project',
    entityName: 'project',
    createFields: ['name', 'description', 'creatorId'],
    updateFields: ['name', 'description', 'isActive'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsProject  
}
const membersOptions = {
    relationKey: 'members',
    relationshipService: memberService
}
const projectService = createEntityService(projectOptions, membersOptions)

module.exports = projectService


function _convertToJsProject(sqlProject) {
    return {
        ...sqlProject,
        isActive: !!sqlProject.isActive,
        createdAt: sqlUtilService.getJsTimestamp(sqlProject.createdAt),
    }
}
