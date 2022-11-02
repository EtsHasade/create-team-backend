const memberService = require('./projectMember.service')
const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


async function query(criteria) {
    let sql = `SELECT * 
               FROM project
               `
    sql += sqlUtilService.getWhereSql(criteria)

    try {
        const projects = await DBService.runSQL(sql)
        if (projects.length) {
            for (const project of projects) {
                project.members = await memberService.query({ projectId: project.id })

            }
            return projects.map(project => _getJsProject(project))
        }
        return []
    } catch (error) {
        throw error
    }
}




async function getById(projectId) {
    const query = `SELECT * 
                 FROM project
                 WHERE id = ${projectId}`

    const [project] = await DBService.runSQL(query)
    if (project) {
        project.members = await memberService.query({ projectId: project.id })
        return _getJsProject(project)
    }
    throw new Error(`project id ${projectId} not found`)
}


async function add(project) {
    const projectFieldsStr = `("${project.name}","${project.desc}",${project.creatorId})`
    const sql = `INSERT INTO project (name, description, creatorId) 
                 VALUES ${projectFieldsStr};`

    const { insertId } = await DBService.runSQL(sql)
    if (!insertId) throw new Error(`Cannot add project: ${projectFieldsStr}`)
    project.id = insertId
    if (project.members.length) {
        console.log('set members: ', project.members);
        project.members = await memberService.addMulti(project.id, project.members)
    }
    return project
}


async function update(project) {
    const query = `UPDATE project SET
                        name = "${project.name}",
                        description = "${project.description}",
                        isActive = ${project.isActive}
                    WHERE id = ${project.id};
                    `
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows < 1) throw new Error(`No project updated - project id ${project.id}`)
        await memberService.updateProjectMembers(project.id, project.members)
        return okPacket

    } catch (error) {
        throw error
    }
}


async function remove(projectId) {
    const query = `DELETE FROM project
                   WHERE id = ${projectId}`
    try {
        const okPacket = await DBService.runSQL(query)
        if (okPacket.affectedRows === 1) return okPacket
        else throw new Error(`No project deleted - project id ${projectId}`)
    } catch (error) {
        throw new Error(`No project deleted - project id ${projectId}`)
    }
}

function _getJsProject(project) {
    console.log("🚀 ~ file: project.service.js ~ line 84 ~ _getJsProject ~ project", project)

    return {
        ...project,
        createdAt: sqlUtilService.getJsTimestamp(project.createdAt),
        isActive: !!project.isActive,
    }
}

module.exports = {
    query,
    getById,
    add,
    update,
    remove
}

