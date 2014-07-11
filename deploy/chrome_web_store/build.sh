#!/bin/bash

app_name="WebRTC_Tic_Tac_Toe"
rm ${app_name}.zip 2> /dev/null
zip ${app_name}.zip src/*

