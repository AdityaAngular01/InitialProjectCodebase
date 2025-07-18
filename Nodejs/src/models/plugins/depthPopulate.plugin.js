// const mongoose = require('mongoose');
//
// function getPopulateTree(model, depth, visited = new Set()) {
//   if (!depth || depth <= 0 || visited.has(model.modelName)) return [];
//
//   visited.add(model.modelName);
//   const paths = [];
//
//   model.schema.eachPath((path, schemaType) => {
//     let refModelName = null;
//
//     // Handle normal ref
//     if (schemaType.options?.ref) {
//       refModelName = schemaType.options.ref;
//     }
//
//     // Handle array of refs (e.g. [{ type: ObjectId, ref: 'User' }])
//     if (!refModelName && schemaType.options?.type) {
//       const typeOption = schemaType.options.type;
//
//       if (
//         Array.isArray(typeOption) &&
//         typeOption.length > 0 &&
//         typeOption[0]?.ref
//       ) {
//         refModelName = typeOption[0].ref;
//       }
//     }
//
//     if (refModelName) {
//       try {
//         const refModel = mongoose.model(refModelName);
//         const nested = getPopulateTree(refModel, depth - 1, new Set(visited));
//
//         paths.push({
//           path,
//           populate: nested.length > 0 ? nested : undefined,
//         });
//       } catch (err) {
//         console.warn(`Unable to load model ${refModelName} for path ${path}:`, err.message);
//       }
//     }
//   });
//
//   return paths;
// }
//
//
// module.exports = function depthPopulatePlugin(schema) {
//   const methods = ['find', 'findOne', 'findOneAndUpdate', 'findById', 'findByIdAndUpdate'];
//
//   methods.forEach((method) => {
//     schema.pre(method, function (next) {
//       const options = this.getOptions?.() || {};
//       const depth = options.depth;
//
//       if (typeof depth === 'number' && depth > 0) {
//         const populateTree = getPopulateTree(this.model, depth);
//         if (populateTree.length > 0) {
//           this.populate(populateTree);
//         }
//       }
//
//       next();
//     });
//   });
// };
