#!/bin/sh

while true

	git fetch;
	LOCAL=$(git rev-parse HEAD);
	REMOTE=$(git rev-parse @{u});

	#if our local revision id doesn't match the remote, we will need to pull the changes
	if [ $LOCAL != $REMOTE ]; then
		#pull and merge changes
		git pull origin master;
		mv ~/public_html/scott_website ~/public_html/sweb
	fi
	sleep 60

do
