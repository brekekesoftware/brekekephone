format:
	yarn format
	make format-objc
	make format-java
	make format-xml

format-objc:
	export EXT="h|m" \
	&& make -s ls \
	| xargs clang-format -i -style=file
format-java:
	export EXT="java" \
	&& make -s ls \
	| xargs google-java-format -i
format-xml:
	export EXT="xml|storyboard|xcscheme|xcworkspacedata|plist|entitlements" \
	&& make -s ls \
	| xargs yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --xml-whitespace-sensitivity=ignore --loglevel=error --write
imagemin:
	export EXT="png|jpg|gif|ico" \
	&& make -s ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)'
ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$'

release:
	git push && \
	git checkout release && \
	git rebase master && \
	git push -f && \
	git checkout master;

checkout:
	cd /var/www/brekekephone && git fetch --prune && \
	git checkout -b tmp && git branch -D release && git checkout release && git branch -D tmp && \
	yarn --check-files --frozen-lockfile;

web:
	make checkout && \
	cd /var/www/brekekephone && yarn build && \
	mv build brekeke_phone && \
	zip -vr brekeke_phone.zip brekeke_phone && mv ./brekeke_phone.zip /var/www/apps-static/0/ && \
	mv brekeke_phone build;

comp:
	make checkout && \
	cd /var/www/brekekephone && yarn comp && \
	mv build/component brekeke_phone_component && \
	zip -vr brekeke_phone_component.zip brekeke_phone_component && mv ./brekeke_phone_component.zip /var/www/apps-static/0/ && \
	rm -rf brekeke_phone_component;

apps:
	cd /var/www/apps && git fetch --prune && \
	git checkout -b tmp && git branch -D master && git checkout master && git branch -D tmp && \
	yarn --check-files --frozen-lockfile && yarn build;
