/**
 * A mongoose schema plugin that:
 * - Removes `__v` field
 * - Removes any schema paths marked with `{ private: true }`
 * - Preserves custom toJSON transforms
 */

const deleteAtPath = (obj, path, index) => {
    if (!obj) return;
    if (index === path.length - 1) {
        delete obj[path[index]];
        return;
    }
    deleteAtPath(obj[path[index]], path, index + 1);
};

const privateFieldsPlugin = (schema) => {
    // Store original transform if any
    const originalTransform = schema.options.toJSON?.transform;

    schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
        transform(doc, ret, options) {
            // Remove private fields
            Object.keys(schema.paths).forEach((path) => {
                const pathOptions = schema.paths[path]?.options || {};
                if (pathOptions.private) {
                    deleteAtPath(ret, path.split('.'), 0);
                }
            });

            // Remove __v field
            delete ret.__v;

            // Apply original transform if defined
            if (originalTransform) {
                return originalTransform(doc, ret, options);
            }

            return ret;
        },
    });
};

module.exports = privateFieldsPlugin;
