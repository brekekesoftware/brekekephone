###
# dev server

web:
	export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& make -Bs chmod \
	&& pnpm ci && pnpm build \
	&& mv ./build ./brekeke_phone$$V && zip -vr ./brekeke_phone$$V.zip ./brekeke_phone$$V \
	&& scp ./brekeke_phone$$V.zip dev01:/var/www/upload \
	&& rm -rf ./brekeke_phone ./brekeke_phone$$V.zip \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./phone && unzip /var/www/upload/brekeke_phone$$V.zip && sudo mv ./brekeke_phone$$V ./phone" \
	&& make -Bs chmod;

embed_b:
	export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& cd ../web \
	&& pnpm ci && pnpm build \
	&& rm -rf ../../embed/example-react/public/brekeke_phone* \
	&& mv ./build ../../embed/example-react/public/brekeke_phone$$V;

embed_u:
	cd ../../embed/example-react \
	&& npm i --force && npm run build \
	&& mv ./dist ./embed && zip -vr ./embed.zip ./embed \
	&& scp ./embed.zip dev01:/var/www \
	&& rm -rf ./embed ./embed.zip \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./embed && unzip ./embed.zip && rm ./embed.zip" \
	&& cd ../.. && make -Bs chmod;

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
