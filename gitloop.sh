#!/bin/sh

while true
do
	git fetch;
	LOCAL=$(git rev-parse HEAD);
	REMOTE=$(git rev-parse @{u});
	echo looking for change $LOCAL != $REMOTE

	#if our local revision id doesn't match the remote, we will need to pull the changes
	if [ $LOCAL != $REMOTE ]; then
		echo found a difference
		#pull and merge changes
		git pull origin master;
		rsync -a ~/public_html/scott_website/ ~/public_html/sweb/
	fi
	sleep 60
done
