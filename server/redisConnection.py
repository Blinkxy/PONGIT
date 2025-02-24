
import redis
from django.conf import settings

# Connect to Redis database 0 (single Redis database)
redisPong = redis.StrictRedis(
    host='10.11.4.4',
    port='6379',
    db=0,
    decode_responses=True
)

redisTournament = redis.StrictRedis( 
    host='10.11.4.4',
    port='6379',
    db=0,
    decode_responses=True
)

redisLog = redis.StrictRedis( 
    host='10.11.4.4',
    port='6379',
    db=0,
    decode_responses=True
)


# import redis
# import os
# REDIS_HOST = os.environ.get('REDIS_HOST', 'redis')
# REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))

# redisPong = redis.Redis(
#     host=REDIS_HOST,
#     port=REDIS_PORT,
#     db=0,
#     decode_responses=True
# )

# redisTournament = redis.StrictRedis( 
#     host=REDIS_HOST,
#     port=REDIS_PORT,
#     db=0,
#     decode_responses=True
# )

# redisLog = redis.StrictRedis( 
#     host=REDIS_HOST,
#     port=REDIS_PORT,
#     db=0,
#     decode_responses=True
# )