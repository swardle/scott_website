#!/bin/sh

while true
do
	echo hi there
	git fetch;
	LOCAL=$(git rev-parse HEAD);
	REMOTE=$(git rev-parse @{u});
	echo hi there2 $LOCAL != $REMOTE

	#if our local revision id doesn't match the remote, we will need to pull the changes
	if [ $LOCAL != $REMOTE ]; then
		#pull and merge changes
		git pull origin master;
		mv ~/public_html/scott_website ~/public_html/sweb
		echo hi there3
	fi
	sleep 5
	echo hi there4
done
