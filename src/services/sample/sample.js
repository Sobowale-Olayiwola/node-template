/**
 *
 * This handles the business logic for the Sample Model
 * @module SERVICE:Sample
 */

const RootService = require('../_root');
const { buildQuery, buildWildcardOptions } = require('../../utilities/query');
const { createSchema, updateSchema } = require('../../validators/sample');
const DatabaseCaching = require('../../utilities/caching');

/**
 *
 * This is the integration of the Sample model routes with the Sample model controller bridging by holding core business logic.
 * @class
 */
class SampleService extends RootService {
    constructor() {
        super();
        this.sampleController = SampleController;
        this.serviceName = 'SampleService';
    }

    async createRecord({ request, next }) {
        try {
            const { body } = request;

            const { error } = createSchema.validate(body);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));

            const result = await this.sampleController.createRecord({ ...body });

            if (result.failed) throw new CustomControllerError(result.error);
            DatabaseCaching.insertRecord('id', result.id, result, this.serviceName);
            return this.processSingleRead(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'createRecord',
            });

            return next(processedError);
        }
    }

    async readRecordById({ request, next }) {
        try {
            const { params } = request;
            const { id } = params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');
            const cachedResult = await DatabaseCaching.getRecord('id', id, this.serviceName);
            if (cachedResult) {
                return this.processSingleRead(cachedResult);
            }
            const [result] = await this.sampleController.readRecords({
                conditions: { id, isActive: true },
            });
            if (result && result.failed) throw new CustomControllerError(result.error);
            if (!cachedResult && result)
                DatabaseCaching.insertRecord('id', result.id, result, this.serviceName);
            return this.processSingleRead(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordById',
            });

            return next(processedError);
        }
    }
    async readRecords({ next }) {
        try {
            const result = await this.sampleController.readRecords({
                conditions: {},
            });
            if (result.failed) throw new CustomControllerError(result.error);
            return this.processMultipleReadResults(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByFilter',
            });

            return next(processedError);
        }
    }

    async readRecordsByFilter({ request, next }) {
        try {
            const { query } = request;
            if (Object.keys(query).length === 0)
                throw new CustomValidationError('Query is required to filter.');

            const result = await this.handleDatabaseRead({
                Controller: this.sampleController,
                queryOptions: query,
            });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByFilter',
            });

            return next(processedError);
        }
    }

    async readRecordsByWildcard(request, next) {
        try {
            const { params, query } = request;
            if (!params || !query) throw new CustomValidationError('Invalid key/keyword');
            if (Object.keys(params).length === 0) {
                throw new CustomValidationError('Keys are required to read');
            }
            if (Object.keys(query).length === 0) {
                throw new CustomValidationError('Keywords are required to read');
            }

            const wildcardConditions = buildWildcardOptions(params.keys, params.keyword);
            const result = await this.handleDatabaseRead(
                this.sampleController,
                query,
                wildcardConditions
            );
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processMultipleReadResults(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'readRecordsByWildcard',
            });

            return next(processedError);
        }
    }

    async updateRecordById({ request, next }) {
        try {
            const { params, body } = request;
            const { id } = params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const { data } = body;
            if (Object.keys(data).length === 0)
                throw new CustomValidationError('Update requires a field.');

            const { error } = updateSchema.validate(data);
            if (error) throw new CustomValidationError(this.filterJOIValidation(error.message));
            const result = await this.sampleController.updateRecords({
                conditions: { id },
                data,
            });
            if (result && result.failed) throw new CustomControllerError(result.error);
            DatabaseCaching.deleteRecord('id', id, this.serviceName);
            return this.processUpdateResult({ result });
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'updateRecordById',
            });

            return next(processedError);
        }
    }

    async updateRecords(request, next) {
        try {
            const { options, data } = request.body;
            if (!options || !data) throw new CustomValidationError('Invalid options/data');
            if (Object.keys(options).length === 0) {
                throw new CustomValidationError('Options are required to update');
            }
            if (Object.keys(data).length === 0)
                throw new CustomValidationError('Data is required to update');

            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.updateRecords(
                { ...seekConditions },
                { ...data }
            );
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processUpdateResult({ ...data, ...result });
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'updateRecords',
            });

            return next(processedError);
        }
    }

    async deleteRecordById({ request, next }) {
        try {
            const { id } = request.params;
            if (!id) throw new CustomValidationError('Invalid ID supplied.');

            const result = await this.sampleController.deleteRecords({ conditions: { id } });
            if (result.failed) throw new CustomControllerError(result.error);
            DatabaseCaching.deleteRecord('id', id, this.serviceName);
            return this.processDeleteResult(result);
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'deleteRecordById',
            });

            return next(processedError);
        }
    }

    async deleteRecords(request, next) {
        try {
            const { options } = request.body;
            if (Object.keys(options).length === 0)
                throw new CustomValidationError('Options are required');

            const { seekConditions } = buildQuery(options);

            const result = await this.sampleController.deleteRecords({ ...seekConditions });
            if (result.failed) throw new CustomControllerError(result.error);

            return this.processDeleteResult({ ...result });
        } catch (e) {
            let processedError = this.formatError({
                service: this.serviceName,
                error: e,
                functionName: 'deleteRecords',
            });

            return next(processedError);
        }
    }
}

module.exports = SampleService;
