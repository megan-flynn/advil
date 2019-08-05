#!/bin/sh

# This script requires GIMP
# brew cask install gimp

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mkdir -p $HERE/../build

{
cat <<EOF
(define (convert-xcf-to-png filename outprefix)
  (let* (
     (image (car (gimp-file-load RUN-NONINTERACTIVE filename filename)))
     (drawable (car (gimp-image-merge-visible-layers image CLIP-TO-BOTTOM-LAYER)))
     )
    (file-png-save RUN-NONINTERACTIVE image drawable (string-append outprefix "128.png") (string-append outprefix "128.png") FALSE 9 FALSE FALSE FALSE FALSE FALSE)
    (gimp-image-scale image 48 48)
    (file-png-save RUN-NONINTERACTIVE image drawable (string-append outprefix "48.png") (string-append outprefix "48.png") FALSE 9 FALSE FALSE FALSE FALSE FALSE)
    (gimp-image-scale image 16 16)
    (file-png-save RUN-NONINTERACTIVE image drawable (string-append outprefix "16.png") (string-append outprefix "16.png") FALSE 9 FALSE FALSE FALSE FALSE FALSE)
    (gimp-image-delete image) ; ... or the memory will explode
    )
)

(gimp-message-set-handler 1) ; Messages to standard output
EOF

echo "(convert-xcf-to-png \"$HERE/../resources/icon128-src.xcf\" \"$HERE/../static/icon\")"

echo "(gimp-quit 0)"
} | /Applications/GIMP*/Contents/MacOS/gimp -i -b -
