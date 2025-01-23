/**
 * @NApiVersion 2.1
 * @NScriptType restlet
 */
define(['N/search', 'N/runtime', 'N/task'], function (search, runtime, task) {
    function get(requestParams) {
        try {
            var savedSearchId = runtime.getCurrentScript().getParameter("custscript_dynamic_ss_id_param");
            var start = parseInt(requestParams.start) || 0; // Start index from request or default to 0
            var pageSize = 1000; // Number of results per batch
            var results = [];
            var pagedResults;

            log.debug('savedSearchId', savedSearchId);
            log.debug('Start index', start);

            var mySearch = search.load({ id: savedSearchId });

            do {
                // Get a range of results
                pagedResults = mySearch.run().getRange({
                    start: start,
                    end: start + pageSize
                });

                pagedResults.forEach(function (result) {
                    results.push({
                        id: result.id,
                        columns: result.columns.map(function (col) {
                            return {
                                name: col.name,
                                label: col.label,
                                text: result.getText(col),
                                value: result.getValue(col)
                            };
                        })
                    });
                });

                start += pageSize;

                // Check if we are nearing the execution time limit
                if (runtime.getCurrentScript().getRemainingUsage() < 100) {
                    log.audit('Rescheduling script', { start });
                    rescheduleScript(start);
                    return { status: 'Rescheduled', start };
                }

            } while (pagedResults.length === pageSize);

            return JSON.stringify(results);
        } catch (error) {
            log.error('Error occurred', error.message);
            return { error: 'An error occurred', details: error.message };
        }
    }

    function rescheduleScript(start) {
        var scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT
        });

        scriptTask.scriptId = runtime.getCurrentScript().id;
        scriptTask.params = {
            custscript_start_param: start // Pass the next start index as a parameter
        };

        scriptTask.submit();
    }

    return {
        get: get
    };
});





// ======================================================================================================

/**
 * @NApiVersion 2.1
 * @NScriptType restlet
 */
define(['N/search', 'N/runtime', 'N/task'], function (search, runtime, task) {
    function get(requestParams) {
        try {
            // Retrieve saved search ID from the request body
            var savedSearchId = requestParams.savedSearchId;
            if (!savedSearchId) {
                return { error: 'savedSearchId is required in the request body.' };
            }

            var start = parseInt(requestParams.start) || 0; // Start index from request or default to 0
            var pageSize = 1000; // Number of results per batch
            var results = [];
            var pagedResults;

            log.debug('savedSearchId', savedSearchId);
            log.debug('Start index', start);

            // Load the saved search using the ID
            var mySearch = search.load({ id: savedSearchId });

            do {
                // Get a range of results
                pagedResults = mySearch.run().getRange({
                    start: start,
                    end: start + pageSize
                });

                pagedResults.forEach(function (result) {
                    results.push({
                        id: result.id,
                        columns: result.columns.map(function (col) {
                            return {
                                name: col.name,
                                label: col.label,
                                text: result.getText(col),
                                value: result.getValue(col)
                            };
                        })
                    });
                });

                start += pageSize;

                // Check if we are nearing the execution time limit
                if (runtime.getCurrentScript().getRemainingUsage() < 100) {
                    log.audit('Rescheduling script', { start });
                    rescheduleScript(start, savedSearchId);
                    return { status: 'Rescheduled', start };
                }

            } while (pagedResults.length === pageSize);

            return JSON.stringify(results);
        } catch (error) {
            log.error('Error occurred', error.message);
            return { error: 'An error occurred', details: error.message };
        }
    }

    function rescheduleScript(start, savedSearchId) {
        var scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT
        });

        scriptTask.scriptId = runtime.getCurrentScript().id;
        scriptTask.params = {
            custscript_start_param: start, // Pass the next start index as a parameter
            custscript_saved_search_id_param: savedSearchId // Pass savedSearchId
        };

        scriptTask.submit();
    }

    return {
        get: get
    };
});
