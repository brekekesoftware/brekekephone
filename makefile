clean:
	yarn --check-files && \
	rm -rf ios/build/* ~/Library/Developer/Xcode/DerivedData/* && \
	cd ios && \
	pod install --repo-update && \
	cd .. && \
	yarn jetify && \
	cd android && ./gradlew clean;

start:
	make -s rm-babel-cache && \
	yarn craco start;

build:
	make -s rm-babel-cache && \
	yarn craco build && \
	node .embed;

intl:
	make -s rm-babel-cache && \
	export EXTRACT_INTL=1 && \
	yarn babel src -x .js,.ts,.tsx -d build && \
	rm -rf build && \
	node .intlBuild;

rm-babel-cache:
	rm -rf node_modules/.cache/babel* .intlNewEn.json;

###
# rn utils

ashake:
	adb shell input keyevent 82;

bitcode:
	[ -d node_modules/react-native-webrtc/ios/WebRTC.dSYM ] || \
	bash node_modules/react-native-webrtc/tools/downloadBitcode.sh;

###
# format

format:
	yarn format && \
	make -s format-objc && \
	make -s format-swift && \
	make -s format-java && \
	make -s format-xml;

format-objc:
	export EXT="h|m" && \
	make -s ls | \
	xargs clang-format -i -style=file;
format-swift:
	swiftformat ios;
format-java:
	export EXT="java" && \
	make -s ls | \
	xargs google-java-format -i;
format-xml:
	export EXT="xml|storyboard|xcscheme|xcworkspacedata|plist|entitlements" && \
	make -s ls | \
	xargs yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --xml-whitespace-sensitivity=ignore --loglevel=error --write;
imagemin:
	export EXT="png|jpg|gif|ico" && \
	make -s ls | \
	xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' | \
	egrep -h '\.($(EXT))$$';

###
# dev server

d:
	make -s chmod && \
	cd dev/react-app && yarn && yarn build && \
	mv build dev-react-app && zip -vr dev-react-app.zip dev-react-app && \
	scp dev-react-app.zip bre:/var/www && \
	rm -rf dev-react-app* && \
	ssh bre "cd /var/www && sudo rm -rf dev-react-app && unzip dev-react-app.zip && sudo rm -f dev-react-app.zip" && \
	cd ../api && yarn && \
	scp index.js package.json yarn.lock bre:/var/www/dev-api && \
	ssh bre "cd /var/www/dev-api && yarn && pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save" && \
	scp nginx.conf bre:/etc/nginx/conf.d/dev01.conf && \
	ssh bre "sudo nginx -t && sudo service nginx restart" && \
	cd ../.. && make -s chmod;

w:
	make -s chmod && \
	yarn && yarn build && \
	mv build brekeke_phone && zip -vr brekeke_phone.zip brekeke_phone && \
	scp brekeke_phone.zip bre:/var/www/upload && \
	rm -rf brekeke_phone* && \
	ssh bre "cd /var/www && sudo rm -rf phone && unzip /var/www/upload/brekeke_phone.zip && sudo mv brekeke_phone phone" && \
	make -s chmod;

bd:
	make -s chmod && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone\ Dev.ipa bre:/var/www/upload/brekeke_phonedev.ipa && \
	rm -rf ../0/build/BrekekePhone && \
	make -s chmod && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/upload/brekeke_phonedev.apk && \
	cd .. && make -s chmod;

bp:
	make -s chmod && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone.ipa bre:/var/www/upload/brekeke_phone.ipa && \
	rm -rf ../0/build/BrekekePhone && \
	make -s chmod && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/upload/brekeke_phone.apk && \
	cd .. && make -s chmod;

chmod:
	ssh bre "sudo chmod -R a+rwX /var/www";

keyhash1:
	ssh bre "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64";

keyhash2:
	openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys | openssl x509 -pubkey -in /dev/stdin -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64;
