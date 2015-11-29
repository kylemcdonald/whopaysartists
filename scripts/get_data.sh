#!/usr/bin/env bash

echo "Drop current reports collection?"

drop=""
select yn in "Yes" "No"; do
  case $yn in
    Yes ) drop="--drop"; break;;
    No ) drop=""; break;;
  esac
done

curl 'http://www.whopaysartists.com/data.json' | mongoimport $drop --jsonArray --collection reports --db whopaysartists
