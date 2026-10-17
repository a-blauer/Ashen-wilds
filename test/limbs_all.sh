#!/bin/bash
# full contact sheets with limbs_zoom.py (auto-framed), 6 models per image: ./limbs_all.sh <tag>
T=$1
L=(sp:Foxlet,sp:Emberlynx,sp:Ashwolf,sp:Direfang,sp:Skollmaw,en:snowwolf
sp:Stoneshell,sp:Cragback,sp:Titanshell,en:tortoise,sp:Mossfrog,sp:Bogmaw
sp:Batwing,sp:Duskwing,en:cavebat,en:bloodbat,sp:Skyhawk,sp:Stormtalon
sp:Rocsovereign,en:harpy,sp:Drakelet,sp:Pyrewing,sp:Elderdrake,en:magmadrake
sp:Gravewyrm,sp:Venomcoil,en:sandwyrm,sp:Wispling,sp:Lumenwisp,sp:Soulwarden
en:wraith,sp:Boneling,sp:Lichbone,sp:Gloomcap,sp:Sporelord,en:shambler
sp:Cryptspider,sp:Widowqueen,sp:Hivemother,en:stalker,en:lurker,en:boghorror
en:goo,en:spitter,en:maggot,en:scorp,bs:0:EyeWolf,bs:1:Hydra
bs:2:IceWraith,bs:3:Centipede,mt:pony,mt:boar,mt:stag,mt:ram
mt:charger,mt:raptor,mt:panther,mt:destrier,mt:direwolf,mt:drake)
i=0;for x in "${L[@]}";do timeout 900 python3 limbs_zoom.py ${T}_$(printf %02d $i) "$x" 230 | grep png;i=$((i+1));done
