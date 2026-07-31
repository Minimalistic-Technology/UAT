import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
