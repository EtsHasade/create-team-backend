const userCRUDService = require('./userCRUD.service')
const projectMemberCRUDService = require('../project/projectMemberCRUD.service')
const teamMemberCRUDService = require('../team/teamMemberCRUD.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')







const userWithProjectMemberService = new EntitiesRelationshipService(
    userCRUDService,
    projectMemberCRUDService,
    'projects',
    'userId'
)


const userService = new EntitiesRelationshipService(
    userWithProjectMemberService,
    teamMemberCRUDService,
    'teams',
    'userId'
)

module.exports = userService


