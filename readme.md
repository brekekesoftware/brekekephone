

# Push Incoming calls
$pbx.src = ^true
$request = ^INVITE
$getSIPuser(To) = (.+)
$pn.user("%1") = true
X-PBX-EXINFO = (.+):(.+)/(.+)/(.+)	

&pn.notify.user = %1
&pn.notify.message = Incoming call
&pn.notify.custom = "body": "%{$getDisplayName(From)} - %{$getSIPuser(From)}", "tag": "incoming-call", "data": { "user": "%5", "host": "%2", "port": "%3", "tenant": "%4" }
$continue = true
X-PBX-EXINFO = 	


# Wait REGISTER	
$request = ^INVITE
&pn.notify.user = (.+)
$registered = false

$wait4reg = %1
