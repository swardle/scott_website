#!/bin/sh

while true
do
	git fetch;
	LOCAL=$(git rev-parse HEAD);
	REMOTE=$(git rev-parse @{u});
	echo hi there2 $LOCAL != $REMOTE

	#if our local revision id doesn't match the remote, we will need to pull the changes
	if [ $LOCAL != $REMOTE ]; then
		#pull and merge changes
		git pull origin master;
		cp -r ~/public_html/scott_website ~/public_html/scott_website_temp
		mv ~/public_html/scott_website_temp ~/public_html/sweb
		echo hi there5
	fi
	sleep 60
done
