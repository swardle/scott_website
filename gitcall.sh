#!/bin/sh

# test

now=$(date)
cd 	/home2/swardlec/repositories/scott_website/
git fetch;
LOCAL=$(git rev-parse HEAD);
REMOTE=$(git rev-parse @{u});
echo looking for change $LOCAL != $REMOTE $now >> /home2/swardlec/gitloop.txt

#if our local revision id doesn't match the remote, we will need to pull the changes
if [ $LOCAL != $REMOTE ]; then
    echo found a difference >> /home2/swardlec/gitloop.txt
    #pull and merge changes
    git pull origin master;
    rsync -a -inplace /home2/swardlec/repositories/scott_website/ /home2/swardlec/public_html/sweb/
fi
sleep 60
