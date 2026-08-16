import re

# 1. Add EMASTER vars to .env
env_path = '/home/dhonawid/simpeg-app/.env'
with open(env_path, 'r') as f:
    env_content = f.read()

if 'EMASTER_USERNAME' not in env_content:
    env_content = env_content.rstrip() + '\nEMASTER_USERNAME=sman1prambon\nEMASTER_PASSWORD=sman1prambon29041994\nEMASTER_TOTP_SECRET=RNPQJRZAOIZBV3CS\n'
    with open(env_path, 'w') as f:
        f.write(env_content)
    print('ENV_VARS_ADDED')
else:
    print('ENV_VARS_ALREADY_EXIST')

# 2. Add EMASTER vars to docker-compose.production.yml backend environment
dc_path = '/home/dhonawid/simpeg-app/docker-compose.production.yml'
with open(dc_path, 'r') as f:
    dc_content = f.read()

if 'EMASTER_USERNAME' not in dc_content:
    # Add after JWT_SECRET line in the environment section
    dc_content = dc_content.replace(
        '      JWT_SECRET: ${JWT_SECRET}',
        '      JWT_SECRET: ${JWT_SECRET}\n      EMASTER_USERNAME: ${EMASTER_USERNAME}\n      EMASTER_PASSWORD: ${EMASTER_PASSWORD}\n      EMASTER_TOTP_SECRET: ${EMASTER_TOTP_SECRET}'
    )
    with open(dc_path, 'w') as f:
        f.write(dc_content)
    print('COMPOSE_ENV_ADDED')
else:
    print('COMPOSE_ENV_ALREADY_EXISTS')
