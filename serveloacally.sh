#! /usr/bin/env bash

trap "kill 0" EXIT


BUNDLE="bundle.ruby2.7"
$BUNDLE exec jekyll serve &
http-server _site -o  &

wait
