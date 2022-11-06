const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')

const projectOptions = {
    tableName: 'project',
    entityName: 'project',
    createFields: ['name', 'description', 'creatorId', 'isActive'],
    updateFields: ['name', 'description', 'isActive'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsProject  
}
const projectCRUDService = new EntityCRUDService(projectOptions, DBService)
module.exports = projectCRUDService


function _convertToJsProject(sqlProject) {
    return {
        ...sqlProject,
        isActive: !!sqlProject.isActive,
        createdAt: sqlUtilService.getJsTimestamp(sqlProject.createdAt),
    }
}

