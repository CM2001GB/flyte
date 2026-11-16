#!/bin/sh
RESOLVER=$(grep nameserver /etc/resolv.conf | head -1 | awk '{print $2}')
sed -i "s/RESOLVER_IP/$RESOLVER/g" /etc/nginx/conf.d/default.conf
echo "Using resolver: $RESOLVER"
cat /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'