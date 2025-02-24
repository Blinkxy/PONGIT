from game.task import test_celery

test_celery.delay()  # or test_celery.apply_async() for more control
