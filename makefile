format:
	yarn format
	make format-objc
	make format-swift
	make format-java
	make format-xml

format-objc:
	export EXT="h|m" && \
	make -s ls | \
	xargs clang-format -i -style=file;
format-swift:
	export EXT="swift" && \
	make -s ls | \
	xargs swiftformat -i;
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

w:
	git status && \
	yarn build && \
	mv build brekeke_phone && \
	zip -vr brekeke_phone.zip brekeke_phone && \
	scp ./brekeke_phone.zip bre:/var/www/apps-static/0/ && \
	ssh bre "cd /var/www/brekekephone && rm -rf phone && unzip /var/www/apps-static/0/brekeke_phone.zip && mv brekeke_phone phone" && \
	rm -rf brekeke_phone* && \
	git checkout master;

d:
	git status && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone\ Dev.ipa bre:/var/www/apps-static/0/brekeke_phonedev.ipa && \
	rm -rf ../0/build/BrekekePhone/ && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/apps-static/0/brekeke_phonedev.apk;

p:
	git status && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone.ipa bre:/var/www/apps-static/0/brekeke_phone.ipa && \
	rm -rf ../0/build/BrekekePhone/ && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/apps-static/0/brekeke_phone.apk && \
	git checkout master;

r:
	git push && \
	git checkout release && \
	git rebase master && \
	git push -f;

apps:
	cd dev/apps && \
	yarn build && \
	zip -vr build.zip build && \
	scp ./build.zip bre:/var/www/apps/ && \
	ssh bre "cd /var/www/apps && rm -rf build && unzip build.zip && rm -f build.zip" && \
	rm -rf build* && \
	cd ../server && \
	scp index.js package.json yarn.lock bre:/var/www/apps/server && \
	ssh bre "cd /var/www/apps/server && yarn && pm2 -s restart dev";
