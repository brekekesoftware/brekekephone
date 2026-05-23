###
# dev server

dev:
	make -Bs chmod \
	&& cd ./dev01/react-app && pnpm ci && pnpm build \
	&& mv ./build ./dev-react-app && zip -vr ./dev-react-app.zip ./dev-react-app \
	&& scp ./dev-react-app.zip dev01:/var/www \
	&& rm -rf ./dev-react-app ./dev-react-app.zip \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./dev-react-app && unzip ./dev-react-app.zip && sudo rm -f ./dev-react-app.zip" \
	&& cd ../api \
	&& scp ./index.js ./package.json dev01:/var/www/dev-api \
	&& ssh dev01 "cd /var/www/dev-api && source ~/.nvm/nvm.sh && npm i && pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save" \
	&& scp ./nginx.conf dev01:/etc/nginx/conf.d/dev01.conf \
	&& ssh dev01 "sudo nginx -t && sudo service nginx restart" \
	&& cd ../.. && make -Bs chmod;
