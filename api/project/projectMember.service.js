const { createRelationshipService } = require('../../services/sqlCRUDL/entityRelationship.service')

const projectMemberOptions = {
    tableName: 'projectMember',
    relationName: 'member',
    entityAKey: 'projectId',
    entityBKey: 'userId',
    createFields:['userId'],
    updateFields:[],
}
const projectMemberService = createRelationshipService(projectMemberOptions)

module.exports = projectMemberService
