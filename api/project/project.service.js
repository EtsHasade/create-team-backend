const sqlUtilService = require('../../services/sqlUtil.service')
const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')

const projectOptions = {
    tableName: 'project',
    entityName: 'project',
    createFields: ['name', 'description', 'creatorId'],
    updateFields: ['name', 'description', 'isActive'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsProject  
}
const projectCRUDService = new EntityCRUDService(projectOptions)


const projectMemberOptions = {
    tableName: 'projectMember',
    entityName: 'member',
    createFields: ['userId', 'invited', 'interested'],
    updateFields: ['invited', 'interested'],
    getOutputThing: _getJsMember
}
const projectMemberCRUDService = new EntityCRUDService(projectMemberOptions)

const projectService = new EntitiesRelationshipService(
    projectCRUDService,
    projectMemberCRUDService,
    'members',
    'projectId'
)

module.exports = projectService


function _convertToJsProject(sqlProject) {
    return {
        ...sqlProject,
        isActive: !!sqlProject.isActive,
        createdAt: sqlUtilService.getJsTimestamp(sqlProject.createdAt),
    }
}


function _getJsMember(member) {
    return {
        ...member,
        invited: !!member.invited,
        interested: !!member.interested,
    }
}

