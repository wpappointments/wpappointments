#!/bin/bash

version=$(grep -o "Version: [0-9.]*" wpappointments.php | awk '{print $2}')

echo "Releasing version $version"

pnpm build

mv vendor vendor-temp
composer install --no-dev > /dev/null 2>&1

mkdir "wpappointments"

rsync -av --exclude=wpappointments --exclude-from=.zipignore . wpappointments

zip -qr "wpappointments-$version.zip" wpappointments/* -x@.zipignore

rm -rf "wpappointments"

rm -rf vendor
mv vendor-temp vendor

echo "\r\nRelease complete ✨ "
