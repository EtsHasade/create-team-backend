
module.exports = class EntitiesRelationshipService {
    constructor(mainEntityCRUDService, relatedEntityCRUDService, relationshipKeyInEntity, entityKeyInRelated) {
        this.entityCRUDService = mainEntityCRUDService
        this.entityName = mainEntityCRUDService.entityName
        this.relationshipKey = relationshipKeyInEntity

        this.relatedCRUDService = relatedEntityCRUDService
        this.relatedEntityName = relatedEntityCRUDService.entityName
        this.entityKey = entityKeyInRelated
    }

    query = async (criteria) => {
        try {
            const entities = await this.entityCRUDService.query(criteria)
            for await (const entity of entities) {
                entity[this.relationshipKey] = await this.relatedCRUDService.query({ [this.entityKey]: entity.id })
            }
            return entities
        } catch (error) {
            throw error
        }
    }

    getById = async (entityId) => {
        try {

            const entity = await this.entityCRUDService.getById(entityId)
            entity[this.relationshipKey] = await this.relatedCRUDService.query({ [this.entityKey]: entity.id })
            return entity
        } catch (error) {
            throw error
        }
    }
    add = async (entity) => {
        try {
            entity = await this.entityCRUDService.add(entity)
            entity[this.relationshipKey].forEach(relatedEntity => relatedEntity[this.entityKey] = entity.id);
            entity[this.relationshipKey] = await this.relatedCRUDService.addMany(entity[this.relationshipKey], { [this.entityKey]: entity.id })
            return entity
        } catch (error) {
            throw error
        }
    }
    update = async (entity) => {
        entity = await this.entityCRUDService.update(entity)
        if (!entity[this.relationshipKey]?.length) return entity

        const addRelatedEntities = []
        const updateRelatedEntities = entity[this.relationshipKey].filter(relatedEntity => {
            if (relatedEntity.id) return true
            addRelatedEntities.push(relatedEntity)
            return false
        })

        try {
            for await (const relatedEntity of updateRelatedEntities) {
                await this.relatedCRUDService.update(relatedEntity)
            }
            const notRemoveIds = updateRelatedEntities.map(relatedEntity => relatedEntity.id)
            await this.relatedCRUDService.removeByCriteria({ [this.entityKey]: entity.id }, notRemoveIds)
            await this.relatedCRUDService.addMany(addRelatedEntities)
            return await this.relatedCRUDService.query({ [this.entityKey]: entity.id })
        } catch (error) {
            throw error
        }
    }

    remove = async (entityId) => {
        try {
            return await this.entityCRUDService.remove(entityId)
        } catch (error) {
            throw error
        }
        // in the sql table set the foreign key as DELETE CASCADE - OR insert this:
        // await this.relatedCRUDService.removeByCriteria({ entityId: entity.id })
    }
}
