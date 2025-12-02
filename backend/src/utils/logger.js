import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'aethera-backend' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        // Write errors to file
        new winston.transports.File({
            filename: 'error.log',
            level: 'error'
        }),

        // Write all logs to combined file
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]
});

export default logger;
