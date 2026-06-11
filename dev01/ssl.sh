ssh dev01 "
  sudo service nginx stop \\
  && echo \"=== nginx stopped\" \\
  && sudo certbot renew --no-bootstrap --no-random-sleep-on-renew \\
  && echo \"=== certbot renewed\" \\
  && sudo service nginx start \\
  && echo \"=== nginx started\" \\
  && rm -rf /etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 \\
  && openssl pkcs12 -export \\
    -in /etc/letsencrypt/live/dev01.brekeke.com/fullchain.pem \\
    -inkey /etc/letsencrypt/live/dev01.brekeke.com/privkey.pem \\
    -certfile /etc/letsencrypt/live/dev01.brekeke.com/cert.pem \\
    -name \"tomcat7\" \\
    -out /etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 \\
    -passout pass:tomcat7 \\
  && echo \"=== pkcs12 file created\" \\
  && sudo su -c \"
    cd /tomcat/bin \\
    && ./shutdown.sh \\
    && killall java \\
    && ./startup.sh
  \" \\
  && echo \"=== tomcat restarted\";
" \
&& scp dev01:/etc/letsencrypt/live/dev01.brekeke.com/tomcat7.p12 ../0/brekeke \
&& echo "=== downloaded to local" \
&& echo "=== done";

# https://dev01.brekeke.com:8443/pbx/gate
# [SIP SERVER] > [Configuration] > [SIP] > [Key and Certificate]
# upload new downloaded .p12 file and restart

# if there's still error, might need to manually check /tomcat/conf/server.xml
