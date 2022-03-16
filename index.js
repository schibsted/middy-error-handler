const R = require('ramda');

module.exports = ({ logger = console, level = 'error', exposeStackTrace = false, filter = () => true } = {}) => ({
    onError: async (handler) => {
        const { error } = handler;

        // if there are a `statusCode` and an `error` field
        // this is a valid http error object
        if (filter(error) && typeof logger[level] === 'function') {
            logger[level](
                {
                    error: R.pick(['name', 'message', 'stack', 'details', 'status', 'statusCode', 'expose'], error),
                },
                `${R.prop('name', error)}: ${R.prop('message', error)}`
            );
        }

        // eslint-disable-next-line no-param-reassign
        handler.response = {
            ...R.propOr({}, 'response', handler),
            statusCode: R.propOr(500, 'statusCode', error),
            body: JSON.stringify(
                R.filter(Boolean, {
                    statusCode: R.prop('statusCode', error),
                    message: R.prop('message', error),
                    details: R.prop('details', error),
                    stack: exposeStackTrace && filter(error) && R.prop('stack', error),
                })
            ),
        };
    },
});
