pret: pretjs pretjava pretobjc pretxml

pretjs: js-import-sort prettier

# 	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$0';
imagemin:
	make -s git EXT='png|jpg|gif' \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$$()(dirname $$0)';

js-import-sort:
	make -s git EXT='js' \
	| xargs npx js-import-sort --silent=1 --path;

prettier:
	make -s git EXT='html|css|js|json' \
	| xargs npx prettier --loglevel=silent --write;

pretobjc:
	make -s git EXT='h|m' \
	| xargs clang-format -i -style=file;

pretjava:
	make -s git EXT='java' \
	| xargs google-java-format -i;

pretxml:
	make -s git EXT='xml|xib|xccheme|xcworkspacedata|plist' \
	| xargs -L1 bash -c 'xmllint --format --output $$0 $$0';

lint:
ifdef ALL
	npx eslint .;
else
	make -s git EXT='js' \
	| xargs npx eslint --ignore-pattern='!*';
endif

git:
ifdef ALL
	make -s git-all;
else
	make -s git-changed-but-not-deleted;
endif

git-all:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.(${EXT})$$';

git-changed-but-not-deleted:
	git status -u --porcelain \
	| egrep -h '^[^D]{2}.*\.(${EXT})$$' \
	| cut -c 4-;
