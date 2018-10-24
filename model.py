import tensorflow as tf
import cv2
import numpy as np
from os import listdir
from os.path import isfile, join, splitext
import sys

model = tf.keras.models.load_model(
    "captcha_model.h5"
)

def removePixel(img):
    kernel1 = np.array([[0, 0, 0],
                        [0, 1, 0],
                        [0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0],
                        [0, 1, 1],
                        [0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    return img

def getFile(file):
    img = cv2.imread(join("./captchas/", file),  cv2.IMREAD_GRAYSCALE) # 120x40
    orig = img.copy()
    ret, thresh = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.bitwise_and(thresh, thresh, mask=thresh)
    
    kernel1 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    x = 5
    y = 5
    h = 35
    w = 115
    im = img[y:y+h, x:x+w]
    
    ret, mask = cv2.threshold(im, 130, 255, cv2.THRESH_BINARY)
    img = removePixel(mask)
    return splitext(file)[0], img, orig
	
def getFileFullPath(file):
    img = cv2.imread(join(file),  cv2.IMREAD_GRAYSCALE) # 120x40
    orig = img.copy()
    ret, thresh = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.bitwise_and(thresh, thresh, mask=thresh)
    
    kernel1 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 0, 0, 0],
                        [0, 1, 1, 0],
                        [0, 1, 1, 0],
                        [0, 0, 0, 0]], np.uint8)

    hitormiss1 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(img, cv2.MORPH_ERODE, kernel2)
    img = cv2.bitwise_and(hitormiss1, hitormiss2)
    x = 5
    y = 5
    h = 35
    w = 115
    im = img[y:y+h, x:x+w]
    
    ret, mask = cv2.threshold(im, 130, 255, cv2.THRESH_BINARY)
    img = removePixel(mask)
    return splitext(file)[0], img, orig

def separetNumbers(name, img, index):
    x = int(0+((img.shape[1]/4)*(index)))
    y = 0
    h = int(img.shape[0])
    w = int(img.shape[1]/4)
    if x < 0:
        x = 0
    if x > 115:
        x = 115
    img = img[y:y+h, x:x+w]
    img = cv2.resize(img, (25, 30))
    ret, img = cv2.threshold(img, 160, 255, cv2.THRESH_BINARY)
    img = cv2.GaussianBlur(img, (5, 5), 1)
    ret, img = cv2.threshold(img, 240, 255, cv2.THRESH_BINARY)
    return name[index], img

def getCountorns(img):
    blur = cv2.GaussianBlur(img, (15, 15), 2)
    kernel1 = np.array([[0, 0, 0],
                        [0, 1, 0],
                        [0, 0, 0]], np.uint8)
    
    kernel2 = np.array([[0, 1, 0],
                        [1, 1, 1],
                        [0, 1, 0]], np.uint8)
    hitormiss1 = cv2.morphologyEx(blur, cv2.MORPH_ERODE, kernel1)
    hitormiss2 = cv2.morphologyEx(blur, cv2.MORPH_ERODE, kernel2)
    blur = cv2.bitwise_and(hitormiss1, hitormiss2)
    ret, blur = cv2.threshold(blur, 230, 255, cv2.THRESH_BINARY_INV)
    _, contours, _  = cv2.findContours(blur.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

    bb_list = []
    for c in contours:  
        bb = cv2.boundingRect(c)
        # save all boxes except the one that has the exact dimensions of the image (x, y, width, height)
        if (bb[0] == 0 and bb[1] == 0 and bb[2] == img.shape[1] and bb[3] == img.shape[0]):
            continue
        bb_list.append(bb)

    bb_list.sort(key=lambda x:x[0])
    x_start, _, _, _ = bb_list[0]
    x_end, _, w_end, _ = bb_list[-1]

    x = x_start
#     w = (x_end + w_end) - x_start
    w = (x_end + w_end)

    bb_list.sort(key=lambda y:y[1]) # sort by Y value: the first item has the smallest Y value 
    _, y, _, _ = bb_list[0]

    bb_list.sort(key=lambda y:y[3]) # sort by Height value: the last item has the largest Height value 
    _, _, _, h = bb_list[-1]

#     print("x=", x, "y=", y, "w=", w, "h=", h)
    h = 30
    roi_img = img.copy()
    cv2.rectangle(roi_img, (x, y), (x+w, y+h), (0, 0, 255), 1)

    crop_img = img[y:y+h, x:x+w]
    crop_img = cv2.GaussianBlur(crop_img, (3,3),0)
    ret, crop_img = cv2.threshold(crop_img, 240, 255, cv2.THRESH_BINARY)
    return blur, crop_img, roi_img

def preditc():
	label_test, img_test, original_img_test = getFileFullPath(sys.argv[1])

	img_test = cv2.bitwise_not(img_test)
	blur, crop_img, roi_img = getCountorns(img_test)

	x_pred = []
	y_pred = []
	label_predic = ""
	for i in range(4):
		label_letter, img_letter = separetNumbers("captcha", crop_img, i)
		prediction = model.predict(np.asarray([img_letter]))
		label_predic = label_predic + str(np.argmax(prediction[0]))

	return label_predic

print(preditc())