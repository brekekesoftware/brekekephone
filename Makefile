pret: pretjava pretobjc pretxml

imagemin:
	make -s git EXT='png|jpg|gif|ico' \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$$()(dirname $$0)';

pretobjc:
	make -s git EXT='h|m' \
	| xargs clang-format -i -style=file;

pretjava:
	make -s git EXT='java' \
	| xargs google-java-format -i;

pretxml:
	make -s git EXT='xml|xib|xccheme|xcworkspacedata|plist' \
	| xargs -L1 bash -c 'xmllint --format --output $$0 $$0';

git:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.(${EXT})$$';
