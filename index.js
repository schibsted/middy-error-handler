const filterObject = (obj, predicate) =>
    Object.fromEntries(Object.entries(obj).filter(([key, val]) => predicate(val, key)));

module.exports = ({ logger = console, level = 'error', exposeStackTrace = false, filter = () => true } = {}) => ({
    onError: async (handler) => {
        const { error } = handler;

        // if there are a `statusCode` and an `error` field
        // this is a valid http error object
        if (filter(error) && typeof logger[level] === 'function') {
            logger[level](
                {
                    error: (({ name, message, stack, details, status, statusCode, expose }) => ({
                        name,
                        message,
                        stack,
                        details,
                        status,
                        statusCode,
                        expose,
                    }))(error),
                },
                `${error.name ?? ''}: ${error.message ?? ''}`
            );
        }

        // eslint-disable-next-line no-param-reassign
        handler.response = {
            ...(handler.response ?? {}),
            statusCode: error.statusCode ?? 500,
            body: JSON.stringify(
                filterObject(
                    {
                        statusCode: error.statusCode,
                        message: error.message,
                        details: error.details,
                        stack: exposeStackTrace && filter(error) && error.stack,
                    },
                    Boolean
                )
            ),
        };
    },
});
