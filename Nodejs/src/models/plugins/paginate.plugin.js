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


/**
 * Pagination plugin for Mongoose
 * @typedef {Object} QueryResult
 * @property {Document[]} results - Results found
 * @property {number} page - Current page
 * @property {number} limit - Maximum number of results per page
 * @property {number} totalPages - Total number of pages
 * @property {number} totalResults - Total number of documents
 */
const paginate = (schema) => {
  schema.statics.paginate = async function (filter = {}, options = {}) {
    let sort = 'createdAt';
    if (options.sortBy) {
      const sortingCriteria = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    }

    const select = (options.select || '').split(',').join(' ') || null;
    const limit = Math.max(parseInt(options.limit, 10) || 10, 1);
    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsQuery = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (select) {
      docsQuery = docsQuery.select(select);
    }

    // Population logic
    if (options.depth && typeof options.depth === 'number' && options.depth > 0) {
      const depthPopulate = getPopulateTree(this, options.depth);
      if (depthPopulate.length > 0) {
        docsQuery = docsQuery.populate(depthPopulate);
      }
    } else if (options.populate) {
      // fallback to explicit populate
      if (Array.isArray(options.populate)) {
        options.populate.forEach((p) => {
          docsQuery = docsQuery.populate(p.title, p.requiredFields);
        });
      } else if (typeof options.populate === 'string') {
        options.populate.split(',').forEach((field) => {
          docsQuery = docsQuery.populate(field.trim());
        });
      }
    }

    const docsPromise = docsQuery.exec();

    const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      metadata:{
        page,
        limit,
        totalPages,
        totalResults,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  };
};

module.exports = paginate;
