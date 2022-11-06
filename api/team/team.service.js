const teamCRUDService = require('./teamCRUD.service')
const teamMemberCRUDService = require('./teamMemberCRUD.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')



const teamService = new EntitiesRelationshipService(
    teamCRUDService,
    teamMemberCRUDService,
    'members',
    'teamId'
)

module.exports = teamService
