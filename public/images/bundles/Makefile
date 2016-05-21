# convert $i -resize '320x320^' -gravity center -crop 258x258+0+0 $i
.PHONEY: all clean contacts icons

all: contacts icons

contacts: baseball-contact.png basketball-contact.png cars-contact.png golf-contact.png plane-contact.png tenniscourts-contact.png
icons: baseball-icon.png basketball-icon.png cars-icon.png golf-icon.png plane-icon.png tenniscourts-icon.png

baseball-contact.png: baseball
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@
basketball-contact.png: basketball
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@
cars-contact.png: cars
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@
golf-contact.png: golf
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@
plane-contact.png: plane
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@
tenniscourts-contact.png: tenniscourts
	montage -background '#000000' -fill 'gray' -define jpeg:size=200x200 -geometry 200x200+2+2 -auto-orient $</*.png $@
	sips -z 640 640 $@

baseball-icon.png: baseball
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@
basketball-icon.png: basketball
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@
cars-icon.png: cars
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@
golf-icon.png: golf
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@
plane-icon.png: plane
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@
tenniscourts-icon.png: tenniscourts
	montage -background '#000000' -fill 'gray' -geometry 50x50+2+2 -auto-orient `ls ./$</* |gshuf |tail -4` $@

clean:
	-rm baseball-contact.png basketball-contact.png cars-contact.png golf-contact.png plane-contact.png tenniscourts-contact.png
	-rm baseball-icon.png basketball-icon.png cars-icon.png golf-icon.png plane-icon.png tenniscourts-icon.png
