/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
    const AuditTrail = require('../AuditTrail.model');
    const ActivityLog = require('../ActivityLog.model');
    const AccessLog = require('../AccessLog.model');

const auditTrailPlugin = (schema, options = {}) => {
    const { modelName } = schema;

    const trackUpdate = async function (doc, originalDoc, userId, ip, ua) {
        const changes = {};
        const updatedDoc = doc.toObject();
        const oldDoc = originalDoc?.toObject?.() || {};

        Object.keys(updatedDoc).forEach((key) => {
            if (key === '__v' || key === 'updatedAt' || key === 'createdAt') return;
            if (JSON.stringify(updatedDoc[key]) !== JSON.stringify(oldDoc[key])) {
                changes[key] = {
                    from: oldDoc[key],
                    to: updatedDoc[key]
                };
            }
        });

        if (Object.keys(changes).length > 0) {
            await AuditTrail.create({
                userId,
                entityType: modelName,
                entityId: doc._id,
                action: 'updated',
                changes,
                timestamp: new Date()
            });
            await ActivityLog.create({
                userId,
                action: `updated ${modelName}`,
                targetType: modelName,
                targetId: doc._id,
                timestamp: new Date()
            });
            if (ip || ua)
                await AccessLog.create({
                    userId,
                    ipAddress: ip,
                    userAgent: ua,
                    successful: true
                });
        }
    };

    const updateHooks = [
        'findOneAndUpdate',
        'findByIdAndUpdate',
        'updateOne',
        'updateMany'
    ];

    updateHooks.forEach((hook) => {
        schema.pre(hook, async function (next) {
            this._auditAction = 'updated';
            this._originalDoc = await this.model.findOne(this.getQuery());
            next();
        });

        schema.post(hook, async function (result) {
            const userId = this.options?.userId;
            const ip = this.options?.ipAddress;
            const ua = this.options?.userAgent;
            if (!result || !this._originalDoc || !userId) return;
            await trackUpdate(result, this._originalDoc, userId, ip, ua);
        });
    });

    const deleteHooks = [
        'findOneAndDelete',
        'findByIdAndDelete',
        'deleteOne',
        'deleteMany'
    ];

    deleteHooks.forEach((hook) => {
        schema.post(hook, async function (result) {
            const userId = this.options?.userId;
            const ip = this.options?.ipAddress;
            const ua = this.options?.userAgent;
            if (!result || !userId) return;

            await AuditTrail.create({
                userId,
                entityType: modelName,
                entityId: result._id,
                action: 'deleted',
                changes: {},
                timestamp: new Date()
            });
            await ActivityLog.create({
                userId,
                action: `deleted ${modelName}`,
                targetType: modelName,
                targetId: result._id,
                timestamp: new Date()
            });
            if (ip || ua) await AccessLog.create({ userId, ipAddress: ip, userAgent: ua, successful: true });
        });
    });

    schema.post('save', async function (doc) {
        if (!this._auditUserId) return;
        await AuditTrail.create({
            userId: this._auditUserId,
            entityType: modelName,
            entityId: doc._id,
            action: 'created',
            changes: {},
            timestamp: new Date()
        });
        await ActivityLog.create({
            userId: this._auditUserId,
            action: `created ${modelName}`,
            targetType: modelName,
            targetId: doc._id,
            timestamp: new Date()
        });
    });

    schema.methods.setAuditUser = function (userId) {
        this._auditUserId = userId;
    };
};

module.exports = auditTrailPlugin;
