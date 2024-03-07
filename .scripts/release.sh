#!/bin/bash

version=$(grep -o "Version: [0-9.]*" wpappointments.php | awk '{print $2}')

echo "Releasing version $version"

if [ -f wpappointments.zip ]; then
    rm wpappointments.zip
fi

pnpm build

mv vendor vendor-temp
composer install --no-dev > /dev/null 2>&1

zip -qr wpappointments.zip . -x@.zipignore

rm -rf vendor
mv vendor-temp vendor

echo "Release complete ✨ "