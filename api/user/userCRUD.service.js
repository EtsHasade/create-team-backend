const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlCRUDL/sqlUtil.service')

const userOptions = {
    tableName: 'user',
    entityName: 'user',
    createFields: ['username', 'email', 'phone', 'isActive', 'isAdmin'],
    updateFields: ['username', 'email', 'phone', 'isActive', 'isAdmin'],
    txtFields: ['username', 'email', 'phone'],  
    getOutputEntity: _convertToJsUser  
}
const userCRUDService = new EntityCRUDService(userOptions, DBService)
module.exports = userCRUDService

function _convertToJsUser(sqlUser) {
    return {
        ...sqlUser,
        isActive: !!sqlUser.isActive,
        isAdmin: !!sqlUser.isAdmin,
        createdAt: sqlUtilService.getJsTimestamp(sqlUser.createdAt),
    }
}

