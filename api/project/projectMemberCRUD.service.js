const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')


const projectMemberOptions = {
    tableName: 'projectMember',
    entityName: 'member',
    createFields: ['projectId', 'userId'],
    updateFields: [],
    getOutputThing: _getJsMember
}
const projectMemberCRUDService = new EntityCRUDService(projectMemberOptions, DBService)
module.exports = projectMemberCRUDService


function _getJsMember(sqlMember) {
    return {
        ...sqlMember,
        createdAt: sqlUtilService.getJsTimestamp(sqlMember.createdAt)
    }
}

