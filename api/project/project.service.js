const projectCRUDService = require('./projectCRUD.service')
const projectMemberCRUDService = require('./projectMemberCRUD.service')
const teamCRUDService = require('../team/teamCRUD.service')
const EntitiesRelationshipService = require('../../services/sqlCRUDL/entityRelationship.service')



const projectWithMemberService = new EntitiesRelationshipService(
    projectCRUDService,
    projectMemberCRUDService,
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

