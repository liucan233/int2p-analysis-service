import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
            const { timestamp, level, message } = info;
            return `${timestamp} ${level.toUpperCase()}: ${message}`;
        }),
        winston.format.colorize({
            all: true
        }),
    ),
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});
