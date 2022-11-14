const teamCRUDService = require('./teamCRUD.service')
const teamMemberCRUDService = require('./teamMemberCRUD.service')
const userCRUDService = require('../user/userCRUD.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')



const membersWithUserService = new EntitiesRelationshipService(
    teamMemberCRUDService,
    userCRUDService,
    'user',
    'id'
)


const teamService = new EntitiesRelationshipService(
    teamCRUDService,
    membersWithUserService,
    'members',
    'teamId'
)

module.exports = teamService
