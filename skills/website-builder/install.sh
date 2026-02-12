#!/bin/bash
set -e
# Install nginx if not present
if ! command -v nginx &>/dev/null; then
    apt-get update -qq && apt-get install -y -qq nginx
fi
# Configure nginx for agent sites
cat > /etc/nginx/sites-available/agent-site << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /root/workspace/www;
    index index.html;
    server_name _;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/agent-site /etc/nginx/sites-enabled/agent-site
mkdir -p /root/workspace/www
chmod 755 /root /root/workspace /root/workspace/www
if [ ! -f /root/workspace/www/index.html ]; then
    echo '<html><body><h1>Coming soon</h1></body></html>' > /root/workspace/www/index.html
fi
systemctl enable nginx
systemctl restart nginx

# Auto-cleanup: delete www files older than 24 hours
(crontab -l 2>/dev/null | grep -v 'workspace/www'; echo '0 * * * * find /root/workspace/www -type f -mtime +0 -not -name "index.html" -delete 2>/dev/null') | crontab -
echo "nginx configured and running"
