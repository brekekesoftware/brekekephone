# start ssh session
ssh bre;

sudo service nginx stop && \
./certbot-auto renew --no-bootstrap && \
sudo service nginx start;
rm -rf /etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 && \
openssl pkcs12 -export \
-in /etc/letsencrypt/live/dev01.brekeke.com/fullchain.pem \
-inkey /etc/letsencrypt/live/dev01.brekeke.com/privkey.pem \
-certfile /etc/letsencrypt/live/dev01.brekeke.com/cert.pem \
-name "tomcat7" \
-out /etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 \
-passout pass:tomcat7 && \
echo "pkcs12 file created" && \
sudo -s;
# the above last line will enter sudo interactive

# shutdown and restart tomcat, then exit from sudo interactive
cd /tomcat/bin
./shutdown.sh
killall java
./startup.sh
exit;

# exit from ssh session
exit;

# download the new tomcat7.p12 to ../0/brekeke
# change the directory to your desired one if needed
scp bre:/etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 ../0/brekeke

# https://dev01.brekeke.com:8443/pbx/gate
# [SIP SERVER] > [Configuration] > [SIP] > [Key and Certificate]
# upload new downloaded .p12 file and restart

# if there's still error, might need to check /tomcat/conf/server.xml
# download the server.xml to ../0/brekeke
scp bre:/tomcat/conf/server.xml ../0/brekeke
