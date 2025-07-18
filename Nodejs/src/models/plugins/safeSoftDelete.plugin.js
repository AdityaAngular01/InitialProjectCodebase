const mongoose = require('mongoose');

function getPopulateTree(model, depth, visited = new Set()) {
    if (!depth || depth <= 0 || visited.has(model.modelName)) return [];

    visited.add(model.modelName);
    const paths = [];

    model.schema.eachPath((path, schemaType) => {
        let refModelName = null;

        // Handle normal ref
        if (schemaType.options?.ref) {
            refModelName = schemaType.options.ref;
        }

        // Handle array of refs (e.g. [{ type: ObjectId, ref: 'User' }])
        if (!refModelName && schemaType.options?.type) {
            const typeOption = schemaType.options.type;

            if (
                Array.isArray(typeOption) &&
                typeOption.length > 0 &&
                typeOption[0]?.ref
            ) {
                refModelName = typeOption[0].ref;
            }
        }

        if (refModelName) {
            try {
                const refModel = mongoose.model(refModelName);
                const nested = getPopulateTree(refModel, depth - 1, new Set(visited));

                paths.push({
                    path,
                    populate: nested.length > 0 ? nested : undefined,
                });
            } catch (err) {
                console.warn(`Unable to load model ${refModelName} for path ${path}:`, err.message);
            }
        }
    });

    return paths;
}

module.exports = function safeSoftDeletePlugin(schema, options = {}) {
    const deletedAtField = options.deletedAtField || 'deletedAt';
    const refFields = options.refFields || [];

    // Add deletedAt field
    schema.add({
        [deletedAtField]: { type: Date, default: null, private: true },
    });

    // Utility to check references
    async function isReferenced(docId) {
        for (const { model, field } of refFields) {
            const exists = await model.exists({ [field]: docId });
            if (exists) return true;
        }
        return false;
    }

    // Utility to remove references
    async function removeReferences(docId) {
        for (const { model, field } of refFields) {
            const docs = await model.find({ [field]: docId });
            if (!docs.length) continue;

            const isArray = Array.isArray(docs[0][field]);
            const update = isArray
                ? { $pull: { [field]: docId } }
                : { $unset: { [field]: "" } };

            await model.updateMany({ [field]: docId }, update);
        }
    }

    // Intercept delete operations
    const interceptMethods = ['findOneAndDelete', 'findByIdAndDelete', 'deleteOne', 'deleteMany'];

    interceptMethods.forEach((method) => {
        schema.pre(method, async function (next) {
            const filter = this.getFilter?.() || {};
            const force = this.getOptions?.()?.force;

            let docs = [];
            if (method === 'deleteMany') {
                docs = await this.model.find(filter).setOptions({ withDeleted: true });
            } else {
                const singleDoc = await this.model.findOne(filter).setOptions({ withDeleted: true });
                if (singleDoc) docs.push(singleDoc);
            }

            const processedDocs = [];

            for (const doc of docs) {
                const referenced = await isReferenced(doc._id);

                if (referenced && !force) {
                    doc[deletedAtField] = new Date();
                    await doc.save();
                    processedDocs.push(doc);
                } else if (force) {
                    if (referenced) await removeReferences(doc._id);
                    await doc.deleteOne();
                    processedDocs.push(doc);
                } else {
                    doc[deletedAtField] = new Date();
                    await doc.save();
                    processedDocs.push(doc);
                }
            }

            // Store the deleted docs in the query for access later
            this._deletedDocs = processedDocs;

            // Prevent actual deletion if not forced
            this.findOneAndUpdate?.({}, {}, { skipModifiedPaths: true });

            next(null);
        });

        schema.post(method, function (_, next) {
            // Replace result with deleted docs
            this.result = this._deletedDocs?.length === 1 ? this._deletedDocs[0] : this._deletedDocs;
            next();
        });
    });

    // Apply default filtering to exclude soft-deleted docs
    const queryMethods = ['find', 'findOne', 'count', 'countDocuments', 'findOneAndUpdate'];
    queryMethods.forEach((method) => {
        schema.pre(method, function (next) {
            const options = this.getOptions?.() || {};

            // Filter out soft-deleted docs unless `withDeleted` is true
            if (!options.withDeleted) {
                this.where({ [deletedAtField]: null });
            }

            // ✅ Support depth-based population here
            if (typeof options.depth === 'number' && options.depth > 0) {
                const populateTree = getPopulateTree(this.model, options.depth);
                if (populateTree.length > 0) {
                    this.populate(populateTree);
                }
            }

            next();
        });
    });


    // Restore soft-deleted document
    schema.methods.restore = function () {
        this[deletedAtField] = null;
        return this.save();
    };

    // Static restore by ID
    schema.statics.restoreById = async function (id) {
        const doc = await this.findOne({ _id: id }).setOptions({ withDeleted: true });
        if (!doc || !doc[deletedAtField]) throw new Error("Document is not deleted");
        doc[deletedAtField] = null;
        return doc.save();
    };

    // Static queries
    schema.statics.findWithDeleted = function (filter = {}) {
        return this.find(filter).setOptions({ withDeleted: true });
    };

    schema.statics.findDeleted = function (filter = {}) {
        return this.find({ ...filter, [deletedAtField]: { $ne: null } }).setOptions({ withDeleted: true });
    };

    schema.statics.safeDeleteById = async function (id, options = {}) {
        const { force = false } = options;
        const doc = await this.findById(id).setOptions({ withDeleted: true });
        if (!doc) return null;

        const referenced = await isReferenced(doc._id);
        if (referenced && !force) {
            doc[deletedAtField] = new Date();
            await doc.save();
            return doc;
        }

        if (force) {
            if (referenced) await removeReferences(doc._id);
            await doc.deleteOne();
            return doc;
        }

        doc[deletedAtField] = new Date();
        await doc.save();
        return doc;
    };
};
