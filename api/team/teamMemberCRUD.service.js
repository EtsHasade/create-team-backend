const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')
const DBService = require('../../services/DBService')

const teamMemberOptions = {
    tableName: 'teamMember',
    entityName: 'member',
    createFields: ['teamId', 'userId', 'invited', 'interested'],
    updateFields: ['invited', 'interested'],
    getOutputEntity: _getJsMember
}
const teamMemberCRUDService = new EntityCRUDService(teamMemberOptions, DBService)
module.exports = teamMemberCRUDService


function _getJsMember(sqlMember) {
    return {
        ...sqlMember,
        invited: !!sqlMember.invited,
        interested: !!sqlMember.interested,
        createdAt: sqlUtilService.getJsTimestamp(sqlMember.createdAt)
    }
}
