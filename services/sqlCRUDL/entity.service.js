// const relationshipService = require('./entityRelationship.service')
const DBService = require('../DBService')
const sqlUtilService = require('../sqlUtil.service')

function createEntityService(entityOptions, relatedThingsOptions) {
    const { tableName, entityName, createFields, updateFields, txtFields, getOutputEntity = _getOutputEntity } = entityOptions
    const { relatedThingName, relationshipService } = relatedThingsOptions
    const relatedThingNamePlural = relatedThingName + 's'

    const entityIdField = entityName + 'Id'

    return {
        async query(criteria) {
            let sql = `SELECT * 
               FROM ${tableName}
               `
            sql += sqlUtilService.getWhereSql(criteria, txtFields)

            try {
                const entitys = await DBService.runSQL(sql)
                if (entitys.length) {
                    for (const entity of entitys) {
                        entity[relatedThingNamePlural] = await relationshipService.query({ [entityIdField]: entity.id })
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
                    entity[relatedThingNamePlural] = await relationshipService.query({ [entityIdField]: entity.id })
                    return getOutputEntity(entity)
                }
                return null
            } catch (error) {
                throw error
            }
        },

        async add(entity) {
            const { fieldStrNames, entityFieldsStrs } = _getFieldsStrs(entity, createFields, txtFields)

            const sql = `INSERT INTO entity (${fieldStrNames.join()}) 
                 VALUES (${entityFieldsStrs.join()});`

            const { insertId } = await DBService.runSQL(sql)
            if (!insertId) throw new Error(`Cannot add entity: ${entityFieldsStrs.join()}`)
            entity.id = insertId
            if (entity[relatedThingNamePlural].length) {
                console.log('set members: ', entity[relatedThingNamePlural]);
                await relationshipService.addMulti(entity.id, entity[relatedThingNamePlural])
                entity[relatedThingNamePlural] = await relationshipService.query({ [entityIdField]: entity.id })
            }
            return entity
        },

        async update(entity) {
            const { fieldStrNames, entityFieldsStrs } = _getFieldsStrs(entity, updateFields, txtFields)
            const setFieldsStrs = fieldStrNames.map(fieldName => `${fieldName} = ${entityFieldsStrs[fieldName]}`)
            const query = `UPDATE entity SET
                        ${setFieldsStrs.join()}
                    WHERE id = ${entity.id};
                    `
            try {
                const okPacket = await DBService.runSQL(query)
                if (okPacket.affectedRows < 1) throw new Error(`No entity updated - entity id ${entity.id}`)
                entity[relatedThingNamePlural] = await relationshipService.updateEntityMembers(entity.id, entity[relatedThingNamePlural])
                return entity

            } catch (error) {
                throw error
            }
        },

        async remove(entityId) {
            const query = `DELETE FROM ${tableName}
                 WHERE id = ${entityId}`
            try {
                const okPacket = await DBService.runSQL(query)
                if (okPacket.affectedRows === 1) return okPacket
                else throw new Error(`No entity deleted - entity id ${entityId}`)
            } catch (error) {
                throw new Error(`No entity deleted - entity id ${entityId}`)
            }
        },
    }
}

function _getFieldsStrs(entity, fieldNames, txtFields) {
    const fieldStrNames = []
    const entityFieldsStrs = fieldNames.map(fieldName => {
        const isTxt = txtFields.includes(fieldName)
        fieldStrNames.push(isTxt ? `"${fieldName}"` : fieldName)
        return isTxt ? `"${entity[fieldName]}"` : entity[fieldName]
    })
    return { fieldStrNames, entityFieldsStrs }
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

