const middy = require('@middy/core');
const createError = require('http-errors');
const middleware = require('./index');

test('Middleware works with logging disabled', async () => {
    const handler = middy(() => {
        throw new createError.NotFound('File not found');
    });

    handler.use(middleware({ logger: false }));

    const response = await handler({}, {});
    expect(response).toEqual({
        statusCode: 404,
        body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
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

    const response = await handler({}, {});
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
        statusCode: 404,
        body: JSON.stringify({ statusCode: 404, message: 'File not found' }),
    });
});
