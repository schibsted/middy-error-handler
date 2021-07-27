const middy = require('@middy/core');
const createError = require('http-errors');
const middleware = require('./index');

const error = new createError.NotFound('File not found');

test('Middleware works with logging disabled', async () => {
    const handler = middy(() => {
        throw error;
    });

    handler.use(middleware({ logger: false }));

    await expect(handler({}, {})).resolves.toMatchObject({
        body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
        statusCode: 404,
    });
});

test('Middleware returns error details', async () => {
    const mockLogger = {
        error: jest.fn(() => {}),
    };

    const handler = middy(() => {
        throw new createError.NotFound('File not found');
    });

    handler.use(middleware({ logger: mockLogger }));

    await expect(handler({}, {})).resolves.toMatchObject({
        body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
        statusCode: 404,
    });

    expect(mockLogger.error).toHaveBeenCalledTimes(1);
});

test('Keep data already present in response', async () => {
    const handler = middy(async () => {
        throw error;
    });

    // eslint-disable-next-line no-shadow
    handler.onError(async (handler) => {
        // eslint-disable-next-line no-param-reassign
        handler.response = {
            headers: {
                someHeader: 'someValue',
            },
        };
    });

    handler.use(middleware({ logger: false }));

    await expect(handler({}, {})).resolves.toMatchObject({
        body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
        statusCode: 404,
        headers: { someHeader: 'someValue' },
    });
});
