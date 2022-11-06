const EntityCRUDService = require('../../services/sqlCRUDL/entity.service')
const DBService = require('../../services/DBService')

const teamOptions = {
    tableName: 'team',
    entityName: 'team',
    createFields: ['name', 'description', 'projectId', 'creatorId'],
    updateFields: ['name', 'description', 'projectId'],
    txtFields: ['name', 'description'],
    // getOutputEntity: _convertToJsTeam  
}

const teamCRUDService = new EntityCRUDService(teamOptions, DBService)
module.exports = teamCRUDService
