/* ### USES EXAMPLE:
***** in the sql table set the foreign key as DELETE CASCADE!!
***** teamMember.service.js:
const { createRelationshipService } = require('/src/services/sqlCRUDL/entityRelationship.service')

const teamMemberOptions = {
    tableName: 'teamMember',
    relationName: 'member',
    entityAKey: 'teamId',
    entityBKey: 'userId',
    createFields:['userId', 'invited', 'interested'],
    updateFields:['invited', 'interested'],
    getOutputThing: _getJsMember
}
const teamMemberService = createRelationshipService(teamMemberOptions)

module.exports = teamMemberService
*/

const DBService = require('../../services/DBService')
const sqlUtilService = require('../../services/sqlUtil.service')


module.exports = {
    createRelationshipService
}


function createRelationshipService(relatedRelationsOptions) {
    const { tableName, relationName, entityAKey, entityBKey, createFields = [], updateFields = [], txtFields = [], getOutputRelation = _getOutputRelation } = relatedRelationsOptions
    return {
        async query(criteria = { 1: 1 }) {
            let sql = `SELECT * 
            FROM ${tableName}
            `
            sql += sqlUtilService.getWhereSql(criteria, txtFields)
            try {
                const relations = await DBService.runSQL(sql) || []
                return relations.map(relation => getOutputRelation(relation))
            } catch (error) {
                throw error
            }
        },

        async add(entityAId, relation) {
            const relationValuesStrs = sqlUtilService.getValueStrs(relation, createFields, txtFields)
            const query = `INSERT INTO ${tableName} (${[entityAKey, ...createFields].join()}) 
                         VALUES (${[entityAId, ...relationValuesStrs].join()});`
            try {
                const { insertId } = await DBService.runSQL(query)
                return await this.getById(insertId)
            } catch (error) {
                throw new Error(`Cannot add related relation to entityAId:${entityAId}:(${relationValuesStrs.join()})`)
            }
        },

        async addMulti(entityAId, relations) {
            const fieldsValuesStrs = relations.map(relation => {
                const fields = sqlUtilService.getValueStrs(relation, createFields, txtFields)
                return `(${[entityAId, ...fields].join()})`
            })
            const sql = `
                INSERT INTO ${tableName} (${[entityAKey, ...createFields].join()})
                VALUES ${fieldsValuesStrs.join()};
            `
            try {
                const okPacket = await DBService.runSQL(sql)
                return await this.query({ [entityAKey]: entityAId })
            } catch (error) {
                throw error
            }
        },

        async updateAll(entityAId, relations) {
            if (!relations.length) return relations
            const { relationsToUpdate, relationsToAdd } = relations.reduce((relationForActions, relation) => {
                if (relation.id) relationForActions.relationsToUpdate.push(relation)
                else relationForActions.relationsToAdd.push(relation)
                return relationForActions
            }, { relationsToUpdate: [], relationsToAdd: [] })

            try {
                for await (const relation of relationsToUpdate) {
                    await this.update(entityAId, relation)
                }
                const notRemoveIds = relationsToUpdate.map(relation => relation.id)
                await this.removeMultiExceptIds(entityAId, notRemoveIds)
                await this.addMulti(entityAId, relationsToAdd)
                return this.query({ [entityAKey]: entityAId })
            } catch (error) {
                throw error
            }
        },

        async resetAll(entityAId, relations) {
            try {
                console.log('setRelations 1> start removing');
                await sqlUtilService.removeMultiWhere(tableName, entityAKey, entityAId)

                console.log('setRelations 2> start adding');
                return await this.addMulti(entityAId, relations)
            } catch (error) {
                throw error
            }
        },

        async getByRelatedIds(entityAId, entityBId) {
            const sql = `SELECT * 
                         FROM ${tableName}
                         WHERE ${entityAKey} = ${entityAId} AND  ${entityBKey} = ${entityBId};
                        `
            try {
                const [relation] = await DBService.runSQL(sql)
                if (relation) return getOutputRelation(relation)
                return null
            } catch (error) {
                throw new Error(`${relationName} with ${entityAKey} ${entityAId} and ${entityBKey} ${entityBId} not found`)
            }
        },

        async update(entityAId, relation) {
            const relationValuesStrs = sqlUtilService.getValueStrs(relation, updateFields, txtFields)
            const setFieldsStrs = updateFields.map((fieldName, idx) => `${fieldName} = ${relationValuesStrs[idx]}`)

            const sql = `UPDATE ${tableName} SET
                                  ${setFieldsStrs.join()}
                            WHERE ${entityAKey} = ${entityAId} AND ${entityBKey} = ${relation[entityBKey]};
                            `
            try {
                const okPacket = await DBService.runSQL(sql)
                if (okPacket.affectedRows > 0) return okPacket
                throw new Error(`No ${relationName} updated - ${relationName} id ${relation.id} for ${entityAKey} ${entityAId}`)
            } catch (error) {
                throw error
            }
        },

        async remove(entityAId, entityBId) {
            const sql = `DELETE FROM ${tableName}
                         WHERE ${entityAKey} = ${entityAId} AND ${entityBKey} = ${entityBId};
                        `
            try {
                const okPacket = await DBService.runSQL(sql)
                if (okPacket.affectedRows > 0) return okPacket
                throw new Error(`No ${relationName} deleted - Where ${entityAKey} ${entityAId} and ${entityBKey} ${entityBId}`)
            } catch (error) {
                throw error
            }
        },

        async getById(relationId) {
            const query = `SELECT * 
                 FROM ${tableName}
                 WHERE id = ${relationId};`
            try {
                const [relation] = await DBService.runSQL(query)
                if (relation) return getOutputRelation(relation)
                return null
            } catch (error) {
                throw error
            }
        },

        async updateById(relationId, relation) {
            relation = {...relation}
            delete relation.id
            const fullUpdateFields = Object.keys(relation)
            const relationValuesStrs = sqlUtilService.getValueStrs(relation, fullUpdateFields, txtFields)
            const setFieldsStrs = fullUpdateFields.map((fieldName, idx) => `${fieldName} = ${relationValuesStrs[idx]}`)

            const sql = `UPDATE ${tableName} SET
                                ${setFieldsStrs.join()}
                           WHERE id = ${relationId};
                           `
            try {
                const okPacket = await DBService.runSQL(sql)
                if (okPacket.affectedRows !== 0) return okPacket
                throw new Error(`No ${relationName} updated - ${relationName} id ${relation.id}`)
            } catch (error) {
                throw error
            }
        },


        async removeById(relationId) {
            const sql = `DELETE FROM ${tableName}
                           WHERE id = ${relationId};`
            try {
                const okPacket = await DBService.runSQL(sql)
                if (okPacket.affectedRows === 1) return okPacket
                throw new Error(`No ${relationName} deleted - ${relationName} id ${relationId}`)
            } catch (error) {
                throw error
            }
        },

        async removeMultiExceptIds(entityAId, exceptIds) {
            return await sqlUtilService.removeMultiWhere(tableName, {[entityAKey]: entityAId}, { exceptFieldName: 'id', exceptValues: exceptIds })
        }
    }
}


function _getOutputRelation(sqlRelation) {
    const outputRelation = {
        ...sqlRelation
    }
    if (sqlRelation.createdAt) {
        outputRelation.createdAt = sqlUtilService.getJsTimestamp(sqlRelation.createdAt)
    }
    return outputRelation
}
