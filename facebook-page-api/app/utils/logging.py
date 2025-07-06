import logging

def log_message(source, level, message):
    logger = logging.getLogger(source)
    log_func = getattr(logger, level, logger.info)
    log_func(message)