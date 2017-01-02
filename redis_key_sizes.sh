#!/usr/bin/env bash

# This script prints out all of your Redis keys and their size in a human readable format
# Copyright 2013 Brent O'Connor
# License: http://www.apache.org/licenses/LICENSE-2.0

human_size() {
        awk -v sum="$1" ' BEGIN {hum[1024^3]="Gb"; hum[1024^2]="Mb"; hum[1024]="Kb"; for (x=1024^3; x>=1024; x/=1024) { if (sum>=x) { printf "%.2f %s\n",sum/x,hum[x]; break; } } if (sum<1024) print "1kb"; } '
}

redis_cmd='redis-cli'

# get keys and sizes
for k in `$redis_cmd keys "*"`; do key_size_bytes=`$redis_cmd debug object $k | perl -wpe 's/^.+serializedlength:([\d]+).+$/$1/g'`; size_key_list="$size_key_list$key_size_bytes $k\n"; done

# sort the list
sorted_key_list=`echo -e "$size_key_list" | sort -n`

# print out the list with human readable sizes
echo -e "$sorted_key_list" | while read l; do
    if [[ -n "$l" ]]; then
        size=`echo $l | perl -wpe 's/^(\d+).+/$1/g'`; hsize=`human_size "$size"`; key=`echo $l | perl -wpe 's/^\d+(.+)/$1/g'`; printf "%-10s%s\n" "$hsize" "$key";
    fi
done