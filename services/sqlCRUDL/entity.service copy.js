/*### USES EXAMPLE:

const memberService = require('./teamMember.service')
const { createEntityService } = require('/src/services/sqlCRUDL/entity.service')

const teamOptions = {
    tableName: 'team',
    entityName: 'team',
    createFields: ['name', 'description', 'projectId', 'creatorId'],
    updateFields: ['name', 'description', 'projectId'],
    txtFields: ['name', 'description'],  
    getOutputEntity: _convertToJsTeam  
}
const membersOptions = {
    relationKey: 'members',
    relationshipService: memberService
}
const teamService = createEntityService(teamOptions, membersOptions)
module.exports = teamService

function _convertToJsTeam(sqlTeam) {
    return {
        ...sqlTeam,
        isActive: !!sqlTeam.isActive,
        createdAt: sqlUtilService.getJsTimestamp(sqlTeam.createdAt),
    }
}
*/

const DBService = require('../DBService')
const sqlUtilService = require('../sqlUtil.service')

function createEntityService(entityOptions, relationsOptions = {}) {
    const { tableName, entityName, createFields, updateFields, txtFields, getOutputEntity = _getOutputEntity } = entityOptions
    const { relationKey, relationshipService } = relationsOptions
    const isRelated = (relationKey && relationshipService)
    const entityIdField = entityName + 'Id'

    return {
        async query(criteria) {
            let sql = `SELECT * 
                       FROM ${tableName}
                      `
            sql += sqlUtilService.getWhereSql(criteria, txtFields)

            try {
                const entitys = await DBService.runSQL(sql)
                if (entitys?.length) {
                    if (isRelated) {
                        for (const entity of entitys) {
                            entity[relationKey] = await this._queryRelations(entity.id)
                        }
                    }
                    return entitys.map(entity => getOutputEntity(entity))
                }
                return []
            } catch (error) {
                throw error
            }
        },

        async getById(entityId) {
            const query = `SELECT * 
                 FROM ${tableName}
                 WHERE id = ${entityId}`
            try {
                const [entity] = await DBService.runSQL(query)
                if (entity) {
                    if (isRelated) {
                        entity[relationKey] = await this._queryRelations(entity.id)
                    }
                    return getOutputEntity(entity)
                }
                return null
            } catch (error) {
                throw error
            }
        },

        async add(entity) {
            const entityValuesStrs = sqlUtilService.getValueStrs(entity, createFields, txtFields)
            const sql = `INSERT INTO ${tableName} (${createFields.join()}) 
                         VALUES (${entityValuesStrs.join()});
                         `
            try {
                const { insertId } = await DBService.runSQL(sql)
                if (!insertId) throw new Error(`Cannot add entity: ${entityValuesStrs.join()}`)
                entity.id = insertId
                if (isRelated && entity[relationKey]?.length) {
                    await relationshipService?.addMulti(entity.id, entity[relationKey])
                    entity[relationKey] = await this._queryRelations(entity.id)
                }
                return entity
            } catch (error) {
                throw error
            }
        },

        async update(entity) {
            const entityValuesStrs = sqlUtilService.getValueStrs(entity, updateFields, txtFields)
            const setFieldsStrs = updateFields.map((fieldName, idx) => `${fieldName} = ${entityValuesStrs[idx]}`)
            const sql = `UPDATE ${tableName} SET
                         ${setFieldsStrs.join()}
                         WHERE id = ${entity.id};
                        `
            try {
                const okPacket = await DBService.runSQL(sql)
                if (okPacket.affectedRows < 1) throw new Error(`No entity updated - entity id ${entity.id}`)
                if (isRelated) {
                    entity[relationKey] = await relationshipService?.updateAll(entity.id, entity[relationKey]) || []
                }
                return entity
            } catch (error) {
                throw error
            }
        },
        async remove(entityId) {
            const query = `DELETE FROM ${tableName}
            WHERE id = ${entityId}
            `
            try {
                const okPacket = await DBService.runSQL(query)
                if (okPacket.affectedRows === 1) return okPacket
                else throw new Error(`No entity deleted - entity id ${entityId}`)
                // on remove, there is no need to delete relations if the sql db set the foreign key as DELETE CASCADE
            } catch (error) {
                throw new Error(`No entity deleted - entity id ${entityId}`)
            }
        },

        async _queryRelations(entityId) {
            return await relationshipService?.query({ [entityIdField]: entityId }) || []
        },

    }
}


function _getOutputEntity(entity) {
    const outputEntity = {
        ...entity
    }
    if (entity.createdAt) {
        outputEntity.createdAt = sqlUtilService.getJsTimestamp(entity.createdAt)
    }
    return outputEntity
}

module.exports = {
    createEntityService
}

