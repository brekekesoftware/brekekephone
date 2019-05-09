pretxml:
	git ls-tree -r HEAD --name-only \
	| egrep "\.(xml|xib|xccheme|xcworkspacedata|plist)$$" \
	| xargs -L1 sh -c 'xmllint --format --output $$0 $$0' \
	| xargs;

pretobjc:
	git ls-tree -r HEAD --name-only \
	| egrep "\.(h|m)$$" \
	| xargs -L1 clang-format -i -style=file \
	| xargs;

pretjava:
	git ls-tree -r HEAD --name-only \
	| egrep "\.java$$" \
	| xargs -L1 google-java-format -i \
	| xargs;
