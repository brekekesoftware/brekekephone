clean:
	pnpm i \
	&& pnpm dedupe \
	&& rm -rf ios/build/* ~/Library/Developer/Xcode/DerivedData/* \
	&& cd ios \
	&& pod install --repo-update \
	&& cd .. \
	&& cd android && ./gradlew clean;

clean_deep:
	make -Bs clean_deep_rm \
	&& pnpm i --frozen-lockfile \
	&& pnpm dedupe \
	&& cd ios \
	&& pod cache clean --all \
	&& pod deintegrate \
	&& pod install --repo-update \
	&& cd ../android \
	&& ./gradlew clean;

clean_deep_rm:
	rm -rf ../../node_modules node_modules ios/build ios/Pods ~/Library/Developer/Xcode/DerivedData/* android/.gradle android/app/.cxx android/build ~/.gradle/caches ~/.gradle/daemon $$TMPDIR/react-native* $$TMPDIR/metro* $$TMPDIR/haste-map*;

intl:
	make -Bs rm_babel_cache \
	&& export EXTRACT_INTL=1 \
	&& npx babel src -x .js,.ts,.tsx -d build \
	&& rm -rf build \
	&& node .intlBuild;

rm_babel_cache:
	rm -rf node_modules/.cache/babel* .intlNewEn.local.json;

###
# rn utils

pods:
	cd ios \
	&& rm -rf Pods ~/Library/Caches/CocoaPods \
	&& pod deintegrate && pod setup \
	&& pod install --repo-update;

ashake:
	adb shell input keyevent 82;

bitcode:
	[ -d node_modules/react-native-webrtc/ios/WebRTC.dSYM ] \
	|| bash node_modules/react-native-webrtc/tools/downloadBitcode.sh;

###
# dev server

phonedev:
	pnpm ci \
	&& export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& make -Bs chmod \
	&& scp ../0/build/BrekekePhone/Brekeke\ Phone\ Dev.ipa dev01:/var/www/upload/brekeke_phonedev$$V.ipa \
	&& rm -rf ../0/build/BrekekePhone \
	&& make -Bs chmod \
	&& cd android && ./gradlew clean && ./gradlew assembleRelease \
	&& scp app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phonedev$$V.apk \
	&& cd .. && make -Bs chmod;

phone:
	pnpm ci \
	&& export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& make -Bs chmod \
	&& scp ../0/build/BrekekePhone/Brekeke\ Phone.ipa dev01:/var/www/upload/brekeke_phone$$V.ipa \
	&& rm -rf ../0/build/BrekekePhone \
	&& make -Bs chmod \
	&& cd android && ./gradlew clean && ./gradlew assembleRelease \
	&& scp app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phone$$V.apk \
	&& cd .. && make -Bs chmod;

web:
	export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& make -Bs chmod \
	&& pnpm ci && pnpm build \
	&& mv build brekeke_phone$$V && zip -vr brekeke_phone$$V.zip brekeke_phone$$V \
	&& scp brekeke_phone$$V.zip dev01:/var/www/upload \
	&& rm -rf brekeke_phone* \
	&& ssh dev01 "cd /var/www && sudo rm -rf phone && unzip /var/www/upload/brekeke_phone$$V.zip && sudo mv brekeke_phone$$V phone" \
	&& make -Bs chmod;

embed_b:
	export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& cd ../web \
	&& pnpm ci && pnpm build \
	&& rm -rf ../../embed/example-react/public/brekeke_phone* \
	&& mv build ../../embed/example-react/public/brekeke_phone$$V;

embed_u:
	cd embed/example-react \
	&& npm i --force && npm run build \
	&& mv dist embed && zip -vr embed.zip embed \
	&& scp embed.zip dev01:/var/www \
	&& rm -rf embed* \
	&& ssh dev01 "cd /var/www && sudo rm -rf embed && unzip embed.zip && rm embed.zip" \
	&& cd ../.. && make -Bs chmod;

dev:
	make -Bs chmod \
	&& cd dev01/react-app && pnpm ci && pnpm build \
	&& mv build dev-react-app && zip -vr dev-react-app.zip dev-react-app \
	&& scp dev-react-app.zip dev01:/var/www \
	&& rm -rf dev-react-app* \
	&& ssh dev01 "cd /var/www && sudo rm -rf dev-react-app && unzip dev-react-app.zip && sudo rm -f dev-react-app.zip" \
	&& cd ../api \
	&& scp index.js package.json dev01:/var/www/dev-api \
	&& ssh dev01 "cd /var/www/dev-api && source ~/.nvm/nvm.sh && npm i && pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save" \
	&& scp nginx.conf dev01:/etc/nginx/conf.d/dev01.conf \
	&& ssh dev01 "sudo nginx -t && sudo service nginx restart" \
	&& cd ../.. && make -Bs chmod;

chmod:
	ssh dev01 "sudo chmod -R a+rwX /var/www /etc/nginx/conf.d && sudo service nginx restart";

ssl:
	bash dev01/renewssl.sh;

keyhash1:
	ssh dev01 "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64";

keyhash2:
	openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys | openssl x509 -pubkey -in /dev/stdin -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64;
