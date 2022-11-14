const projectCRUDService = require('./projectCRUD.service')
const projectMemberCRUDService = require('./projectMemberCRUD.service')
const teamCRUDService = require('../team/teamCRUD.service')
const userCRUDService = require('../user/userCRUD.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')



const membersWithUserService = new EntitiesRelationshipService(
    projectMemberCRUDService,
    userCRUDService,
    'user',
    'id'
)

const projectWithMemberService = new EntitiesRelationshipService(
    projectCRUDService,
    membersWithUserService,
    'members',
    'projectId'
)

const projectService = new EntitiesRelationshipService(
    projectWithMemberService,
    teamCRUDService,
    'teams',
    'projectId'
)

module.exports = projectService

